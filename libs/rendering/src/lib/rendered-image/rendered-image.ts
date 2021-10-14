import { IDocument } from "@visian/ui-shared";
import {
  Image,
  ImageSnapshot,
  ITKImage,
  itkImageToImageSnapshot,
  readMedicalImage,
  TypedArray,
  Vector,
  ViewType,
  Voxel,
  VoxelWithValue,
} from "@visian/utils";
import * as THREE from "three";

import { TextureAdapter } from "./texture-adapter";
import { ImageRenderTarget, renderVoxels, Voxels } from "./edit-rendering";
import { MergeFunction } from "./types";
import { textureFormatForComponents } from "./utils";

export class RenderedImage<T extends TypedArray = TypedArray> extends Image<T> {
  public static fromITKImage<T2 extends TypedArray = TypedArray>(
    image: ITKImage<T2>,
    document?: IDocument,
  ) {
    return new RenderedImage(itkImageToImageSnapshot(image), document);
  }

  public static async fromFile(file: File | File[], document?: IDocument) {
    const renderedImage = RenderedImage.fromITKImage(
      await readMedicalImage(file),
      document,
    );
    renderedImage.name = Array.isArray(file) ? file[0]?.name || "" : file.name;
    return renderedImage;
  }

  public excludeFromSnapshotTracking = ["document"];

  /** Used to update the texture from the CPU. */
  private internalTexture: THREE.DataTexture3D;

  /** Contains the voxels which have to be rendered into the texture. */
  private voxelsToRender: (VoxelWithValue | VoxelWithValue[])[] = [];
  /**
   * Whether or not @member voxelsToRender have been rendered into the texture
   * for the different WebGL contexts.
   * See @member renderTargets for texture filter explanation.
   */
  private voxelsRendered: Record<THREE.TextureFilter, boolean[]> = {
    [THREE.NearestFilter]: [true],
    [THREE.LinearFilter]: [true],
  };
  /** Used to render voxels into the texture. */
  private voxels: Voxels;
  /** Whether or not @member voxelGeometry needs to be updated before rendering. */
  private isVoxelGeometryDirty = false;

  /**
   * The render targets for the textures for the different WebGL contexts.
   *
   * Sadly, Three currently does not let you change the filtering mode of a render targte's
   * texture on the fly. As we need textures with nearest filtering for the 2D view and
   * linear filtering for the 3D view, we hold render targets for both filters.
   * See https://github.com/mrdoob/three.js/issues/14375
   * */
  private renderTargets: Record<THREE.TextureFilter, ImageRenderTarget[]> = {
    [THREE.NearestFilter]: [new ImageRenderTarget(this, THREE.NearestFilter)],
    [THREE.LinearFilter]: [new ImageRenderTarget(this, THREE.LinearFilter)],
  };
  /**
   * Whether or not the corresponding render target needs to be updated from the CPU data.
   * See @member renderTargets for texture filter explanation.
   */
  private hasCPUUpdates: Record<THREE.TextureFilter, boolean[]> = {
    [THREE.NearestFilter]: [true],
    [THREE.LinearFilter]: [true],
  };
  /** Callbacks to be invoked when the next render succeeds. */
  private renderCallbacks: (() => void)[] = [];
  /** Callbacks to be invoked when `renderes` are set. */
  private rendererCallbacks: (() => void)[] = [];

  /** Whether or not the texture data needs to be pulled from the GPU. */
  private hasGPUUpdates = false;

  private textureData: Uint8Array;
  private isTextureDataDirty = true;

  private isDataDirty = false;

  private textureAdapter: TextureAdapter;

  constructor(
    image: ImageSnapshot<T> & Pick<ImageSnapshot<T>, "voxelCount" | "data">,
    protected document?: IDocument,
  ) {
    super(image);

    this.textureData = new Uint8Array(
      this.voxelCount.product() * this.voxelComponents,
    );

    this.internalTexture = new THREE.DataTexture3D(
      this.getTextureData(),
      this.voxelCount.x,
      this.voxelCount.y,
      this.voxelCount.z,
    );
    this.internalTexture.magFilter = THREE.NearestFilter;
    this.internalTexture.format = textureFormatForComponents(
      this.voxelComponents,
    );

    this.voxels = new Voxels(new Vector(2), new Vector(2), this.voxelCount);

    this.textureAdapter = new TextureAdapter(this);
  }

  public getTextureData() {
    if (this.isTextureDataDirty) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maxValue = (this.getData() as any).reduce(
        (a: number, b: number) => Math.max(a, b),
        0,
      );

      const textureData = new Uint8Array(
        this.getData().map((value: number) =>
          Math.round((Math.max(0, value) / maxValue) * 255),
        ),
      );

      this.textureData.set(textureData);

      this.isTextureDataDirty = false;
    }

    return this.textureData;
  }

  public getData() {
    if (this.isDataDirty) {
      super.getData().set(this.textureData);

      this.isDataDirty = false;
    }

    return super.getData();
  }

  public getTexture(rendererIndex = 0, filter = THREE.NearestFilter) {
    if (!this.renderTargets[filter][rendererIndex]) {
      this.renderTargets[filter][rendererIndex] = new ImageRenderTarget(
        this,
        filter,
      );
      this.hasCPUUpdates[filter][rendererIndex] = true;
      this.voxelsRendered[filter][rendererIndex] = true;
    }

    return this.renderTargets[filter][rendererIndex]
      .texture as THREE.DataTexture3D;
  }

  public waitForRender() {
    return new Promise<void>((resolve) => {
      this.renderCallbacks.push(resolve);
    });
  }

  public waitForRenderers() {
    if (this.document?.renderers) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.rendererCallbacks.push(resolve);
    });
  }

  public render() {
    if (!this.document?.renderers) return;

    this.rendererCallbacks.forEach((callback) => callback());

    this.document.renderers.forEach((renderer, rendererIndex) => {
      [THREE.NearestFilter, THREE.LinearFilter].forEach((filter) => {
        if (
          this.hasCPUUpdates[filter][rendererIndex] &&
          this.renderTargets[filter][rendererIndex]
        ) {
          this.copyToRenderTarget(rendererIndex, filter);
        }

        if (
          this.voxelsToRender.length &&
          this.voxelsRendered[filter][rendererIndex] === false
        ) {
          if (this.isVoxelGeometryDirty) {
            this.voxels.updateGeometry(this.voxelsToRender);
            this.isVoxelGeometryDirty = false;
          }

          renderVoxels(
            this.voxels,
            this.renderTargets[filter][rendererIndex],
            renderer,
          );
          this.onModificationsOnGPU();

          this.voxelsRendered[filter][rendererIndex] = true;
          if (
            this.voxelsRendered[THREE.NearestFilter].every((value) => value) &&
            this.voxelsRendered[THREE.LinearFilter].every((value) => value)
          ) {
            this.voxelsToRender = [];
            this.isVoxelGeometryDirty = true;

            this.renderCallbacks.forEach((callback) => callback());
            this.renderCallbacks = [];
          }
        }
      });
    });
  }

  private copyToRenderTarget(
    rendererIndex: number,
    filter: THREE.TextureFilter,
  ) {
    const renderers = this.document?.renderers;
    if (!renderers) return;
    const renderer = renderers[rendererIndex];
    if (!renderer) return;

    this.textureAdapter.writeImage(
      [this.internalTexture],
      [this.renderTargets[filter][rendererIndex]],
      [renderer],
      MergeFunction.Replace,
    );

    this.textureAdapter.invalidateCache();

    this.hasCPUUpdates[filter][rendererIndex] = false;
  }

  private onModificationsOnGPU() {
    this.hasGPUUpdates = true;
    this.isDataDirty = true;
    this.textureAdapter.invalidateCache();
  }

  private scheduleGPUPush() {
    this.getTextureData();
    this.internalTexture.needsUpdate = true;
    this.hasCPUUpdates[THREE.NearestFilter].fill(true);
    this.hasCPUUpdates[THREE.LinearFilter].fill(true);
  }

  private pullDataFromGPU() {
    if (!this.document?.renderers?.length) return;

    this.textureAdapter.readImage(
      this.document.renderers[0],
      this.getTexture(0, THREE.NearestFilter),
      this.textureData,
    );
    this.isDataDirty = true;

    this.hasGPUUpdates = false;
  }

  /** Can override unsaved changes to the data that are only stored on the GPU. */
  public setData(data: T) {
    super.setData(data);
    this.hasGPUUpdates = false;
    this.isTextureDataDirty = true;
    this.isDataDirty = false;

    if (this.internalTexture) {
      this.scheduleGPUPush();
    }
  }

  public setTextureData(data: Uint8Array) {
    if (this.textureData === data) return;

    if (data.length !== this.textureData.length) {
      throw new Error("Provided data has the wrong length.");
    }

    this.textureData.set(data);
    this.hasGPUUpdates = false;
    this.isTextureDataDirty = false;
    this.isDataDirty = true;

    if (this.internalTexture) {
      this.scheduleGPUPush();
    }
  }

  public setVoxels(voxels: VoxelWithValue[]) {
    this.voxelsToRender.push(voxels);
    this.voxelsRendered[THREE.NearestFilter].fill(false);
    this.voxelsRendered[THREE.LinearFilter].fill(false);
    this.isVoxelGeometryDirty = true;
  }

  public setVoxel(voxel: Voxel | Vector, value: number) {
    if (this.document?.renderers?.length) {
      const { x, y, z } = voxel;
      this.voxelsToRender.push({ x, y, z, value });
      this.voxelsRendered[THREE.NearestFilter].fill(false);
      this.voxelsRendered[THREE.LinearFilter].fill(false);
      this.isVoxelGeometryDirty = true;

      return;
    }

    super.setVoxel(voxel, value);
    this.scheduleGPUPush();
  }

  public writeToTexture(
    textures: THREE.DataTexture3D[],
    mergeFunction = MergeFunction.Replace,
    threshold?: number,
  ) {
    if (!this.document?.renderers) return;

    this.textureAdapter.writeImage(
      textures,
      this.renderTargets[THREE.NearestFilter],
      this.document.renderers,
      mergeFunction,
      threshold,
    );
    this.textureAdapter.writeImage(
      textures,
      this.renderTargets[THREE.LinearFilter],
      this.document.renderers,
      mergeFunction,
      threshold,
    );

    this.onModificationsOnGPU();
  }

  public setSlice(
    viewType: ViewType,
    slice: number,
    sliceData?: Uint8Array | THREE.Texture[],
    mergeFunction = MergeFunction.Replace,
  ) {
    if (this.document?.renderers?.length) {
      this.textureAdapter.writeSlice(
        slice,
        viewType,
        sliceData,
        this.renderTargets[THREE.NearestFilter],
        this.document.renderers,
        mergeFunction,
      );
      this.textureAdapter.writeSlice(
        slice,
        viewType,
        sliceData,
        this.renderTargets[THREE.LinearFilter],
        this.document.renderers,
        mergeFunction,
      );

      this.onModificationsOnGPU();

      return;
    }

    if (sliceData === undefined || sliceData instanceof Uint8Array) {
      super.setSlice(viewType, slice, sliceData);
      this.scheduleGPUPush();
    }
  }

  public getSlice(viewType: ViewType, sliceNumber: number) {
    if (this.document?.renderers?.length) {
      return this.textureAdapter.readSlice(
        sliceNumber,
        viewType,
        this.document.renderers[0],
        this.getTexture(0, THREE.NearestFilter),
      );
    }

    // Attention: super.getSlice does not work for more than one component at the moment!
    return super.getSlice(viewType, sliceNumber);
  }

  public readSliceToTarget(
    sliceNumber: number,
    viewType: ViewType,
    rendererIndex: number,
    target: THREE.WebGLRenderTarget,
  ) {
    const renderers = this.document?.renderers;
    if (!renderers) return;
    const renderer = renderers[rendererIndex];
    if (!renderer) return;

    if (this.hasCPUUpdates[THREE.NearestFilter][rendererIndex]) {
      this.copyToRenderTarget(rendererIndex, THREE.NearestFilter);
    }

    this.textureAdapter.readSliceToTarget(
      sliceNumber,
      viewType,
      renderer,
      this.getTexture(rendererIndex, THREE.NearestFilter),
      target,
    );
  }

  public getVoxelData(voxel: Voxel | Vector) {
    const index = this.getDataIndex(voxel);

    return new Vector(
      Array.from(
        this.getTextureData().slice(index, index + this.voxelComponents),
      ),
      false,
    );
  }

  public toJSON() {
    if (this.hasGPUUpdates) {
      this.pullDataFromGPU();
    }

    return super.toJSON();
  }
}
