import { IDocument, MergeFunction } from "@visian/ui-shared";
import {
  getPlaneAxes,
  IDisposable,
  Image,
  ImageSnapshot,
  ITKImage,
  itkImageToImageSnapshot,
  readMedicalImage,
  TypedArray,
  Vector,
  ViewType,
  Voxel,
} from "@visian/utils";
import * as THREE from "three";

import { TextureAdapter } from "./texture-adapter";
import { textureFormatForComponents } from "./utils";
import { OrientedSlice } from "./types";
import { ImageRenderTarget } from "./image-render-target";

export class RenderedImage<T extends TypedArray = TypedArray>
  extends Image<T>
  implements IDisposable {
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
  private internalTexture: THREE.DataTexture3D | THREE.DataTexture;

  /**
   * Sadly, Three currently does not let you change the filtering mode of a render target's
   * texture on the fly. As we need textures with nearest filtering for the 2D view and
   * linear filtering for the 3D view, we hold render targets for both filters.
   * See https://github.com/mrdoob/three.js/issues/14375
   * */
  private renderTargets: Record<THREE.TextureFilter, ImageRenderTarget> = {
    [THREE.NearestFilter]: new ImageRenderTarget(this, THREE.NearestFilter),
    [THREE.LinearFilter]: new ImageRenderTarget(this, THREE.LinearFilter),
  };
  /**
   * Whether or not the corresponding render target needs to be updated from the CPU data.
   * See @member renderTargets for texture filter explanation.
   */
  private hasCPUUpdates: Record<THREE.TextureFilter, boolean> = {
    [THREE.NearestFilter]: true,
    [THREE.LinearFilter]: true,
  };

  /** Callbacks to be invoked when `renderer` is set. */
  private rendererCallbacks: (() => void)[] = [];

  private gpuUpdates: OrientedSlice[] = [];
  private hasWholeTextureChanged = false;

  /** Reflects the content of `Image.data`, but is normalized to a Uint8Array as it is used on the GPU. */
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

    if (this.is3D) {
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
    } else {
      const [widthAxis, heightAxis] = getPlaneAxes(this.defaultViewType);
      this.internalTexture = new THREE.DataTexture(
        this.getTextureData(),
        this.voxelCount[widthAxis],
        this.voxelCount[heightAxis],
        textureFormatForComponents(this.voxelComponents),
        undefined,
        undefined,
        undefined,
        undefined,
        THREE.NearestFilter,
      );
    }

    this.textureAdapter = new TextureAdapter(this);
  }

  public dispose() {
    this.textureAdapter.dispose();
    this.internalTexture.dispose();
    this.renderTargets[THREE.NearestFilter].dispose();
    this.renderTargets[THREE.LinearFilter].dispose();
  }

  /** Whether or not the texture data needs to be pulled from the GPU. */
  private get hasGPUUpdates(): boolean {
    return this.hasWholeTextureChanged || this.gpuUpdates.length > 0;
  }

  public getTextureData() {
    if (this.hasGPUUpdates) {
      this.pullDataFromGPU();
    }

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
      if (this.hasGPUUpdates) {
        this.pullDataFromGPU();
      }
      super.getData().set(this.textureData);

      this.isDataDirty = false;
    }

    return super.getData();
  }

  public getTexture(filter = THREE.NearestFilter) {
    if (!this.renderTargets[filter]) {
      this.renderTargets[filter] = new ImageRenderTarget(this, filter);
      this.hasCPUUpdates[filter] = true;
    }

    return this.renderTargets[filter].texture;
  }

  public waitForRenderer() {
    if (this.document?.renderer) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.rendererCallbacks.push(resolve);
    });
  }

  public render() {
    if (!this.document?.renderer) return;

    this.rendererCallbacks.forEach((callback) => callback());

    [THREE.NearestFilter, THREE.LinearFilter].forEach((filter) => {
      if (this.hasCPUUpdates[filter] && this.renderTargets[filter]) {
        this.copyToRenderTarget(filter);
      }
    });
  }

  private copyToRenderTarget(filter: THREE.TextureFilter) {
    const renderer = this.document?.renderer;
    if (!renderer) return;

    this.textureAdapter.writeImage(
      this.internalTexture,
      this.renderTargets[filter],
      renderer,
      MergeFunction.Replace,
    );

    this.textureAdapter.invalidateCache();

    this.hasCPUUpdates[filter] = false;
  }

  private onModificationsOnGPU() {
    this.isDataDirty = true;
    this.textureAdapter.invalidateCache();
  }

  private scheduleGPUPush() {
    this.getTextureData();
    this.internalTexture.needsUpdate = true;
    this.hasCPUUpdates[THREE.NearestFilter] = true;
    this.hasCPUUpdates[THREE.LinearFilter] = true;
  }

  private pullDataFromGPU() {
    if (!this.document?.renderer) return;

    if (this.hasWholeTextureChanged) {
      this.textureAdapter.readImage(
        this.document.renderer,
        this.getTexture(THREE.NearestFilter),
        this.textureData,
      );
      this.isDataDirty = true;
    } else {
      this.textureAdapter.readSlices(
        this.gpuUpdates,
        this.document.renderer,
        this.getTexture(THREE.NearestFilter),
        this.textureData,
      );
    }

    this.hasWholeTextureChanged = false;
    this.gpuUpdates = [];
  }

  /** Can override unsaved changes to the data that are only stored on the GPU. */
  public setData(data: T) {
    super.setData(data);
    this.hasWholeTextureChanged = false;
    this.gpuUpdates = [];
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
    this.hasWholeTextureChanged = false;
    this.gpuUpdates = [];
    this.isTextureDataDirty = false;
    this.isDataDirty = true;

    if (this.internalTexture) {
      this.scheduleGPUPush();
    }
  }

  public writeToTexture(
    texture: THREE.Texture,
    mergeFunction = MergeFunction.Replace,
    threshold?: number,
  ) {
    if (!this.document?.renderer) return;

    this.textureAdapter.writeImage(
      texture,
      this.renderTargets[THREE.NearestFilter],
      this.document.renderer,
      mergeFunction,
      threshold,
    );
    this.textureAdapter.writeImage(
      texture,
      this.renderTargets[THREE.LinearFilter],
      this.document.renderer,
      mergeFunction,
      threshold,
    );

    this.hasWholeTextureChanged = true;
    this.onModificationsOnGPU();
  }

  public setSlice(
    viewType: ViewType,
    slice: number,
    sliceData?: Uint8Array | THREE.Texture,
    mergeFunction = MergeFunction.Replace,
  ) {
    if (this.document?.renderer) {
      this.textureAdapter.writeSlice(
        slice,
        viewType,
        sliceData,
        this.renderTargets[THREE.NearestFilter],
        this.document.renderer,
        mergeFunction,
      );
      this.textureAdapter.writeSlice(
        slice,
        viewType,
        sliceData,
        this.renderTargets[THREE.LinearFilter],
        this.document.renderer,
        mergeFunction,
      );

      this.gpuUpdates.push({ slice, viewType });
      this.onModificationsOnGPU();

      return;
    }

    if (sliceData === undefined || sliceData instanceof Uint8Array) {
      super.setSlice(viewType, slice, sliceData);
      this.isTextureDataDirty = true;
      this.scheduleGPUPush();
    }
  }

  public getSlice(viewType: ViewType, sliceNumber: number) {
    if (this.document?.renderer) {
      return this.textureAdapter.readSlice(
        sliceNumber,
        viewType,
        this.document.renderer,
        this.getTexture(THREE.NearestFilter),
      );
    }

    // Attention: super.getSlice does not work for more than one component at the moment!
    return super.getSlice(viewType, sliceNumber);
  }

  public readSliceToTarget(
    sliceNumber: number,
    viewType: ViewType,
    target: THREE.WebGLRenderTarget,
  ) {
    const renderer = this.document?.renderer;
    if (!renderer) return;

    if (this.hasCPUUpdates[THREE.NearestFilter]) {
      this.copyToRenderTarget(THREE.NearestFilter);
    }

    this.textureAdapter.readSliceToTarget(
      sliceNumber,
      viewType,
      renderer,
      this.getTexture(THREE.NearestFilter),
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
