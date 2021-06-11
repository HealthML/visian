import {
  getTextureFromAtlas,
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
import { ScreenAlignedQuad } from "../screen-aligned-quad";

import {
  copyToRenderTarget,
  ImageRenderTarget,
  renderVoxels,
  Voxels,
} from "./edit-rendering";
import { SliceAtlasAdapter } from "./slice-atlas-adapter";

export class RenderedImage<T extends TypedArray = TypedArray> extends Image<T> {
  public static fromITKImage<T2 extends TypedArray = TypedArray>(
    image: ITKImage<T2>,
  ) {
    return new RenderedImage(itkImageToImageSnapshot(image));
  }

  public static async fromFile(file: File | File[]) {
    const renderedImage = RenderedImage.fromITKImage(
      await readMedicalImage(file),
    );
    renderedImage.name = Array.isArray(file) ? file[0]?.name || "" : file.name;
    return renderedImage;
  }

  private renderers: THREE.WebGLRenderer[] = [];

  /** Used to update the atlas from the CPU. */
  private internalTexture: THREE.DataTexture;

  /** Contains the voxels which have to be rendered into the atlas. */
  private voxelsToRender: (VoxelWithValue | VoxelWithValue[])[] = [];
  /**
   * Whether or not @member voxelsToRender have been rendered into the atlas
   * for the different WebGL contexts.
   * See @member renderTargets for texture filter explanation.
   */
  private voxelsRendered: Record<THREE.TextureFilter, boolean[]> = {
    [THREE.NearestFilter]: [true],
    [THREE.LinearFilter]: [true],
  };
  /** Used to render voxels into the texture atlas. */
  private voxels: Voxels;
  /** Whether or not @member voxelGeometry needs to be updated before rendering. */
  private isVoxelGeometryDirty = false;

  /**
   * The render targets for the texture atlases for the different WebGL contexts.
   *
   * Sadly, Three currently does not let you change the filtering mode of a render targte's
   * texture on the fly. As we need textures with nearest filtering for the 2D view and
   * linear filtering for the 3D view, we hold render targets for both filters.
   * See https://github.com/mrdoob/three.js/issues/14375
   * */
  private renderTargets: Record<THREE.TextureFilter, ImageRenderTarget[]> = {
    [THREE.NearestFilter]: [
      new ImageRenderTarget(this.getAtlasSize(), THREE.NearestFilter),
    ],
    [THREE.LinearFilter]: [
      new ImageRenderTarget(this.getAtlasSize(), THREE.LinearFilter),
    ],
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
  /** Used to update the render targets from the CPU data. */
  private screenAlignedQuad: ScreenAlignedQuad;

  /** Whether or not the atlas needs to be pulled from the GPU. */
  private hasGPUUpdates = false;

  private sliceAtlasAdapter: SliceAtlasAdapter;

  constructor(
    image: ImageSnapshot<T> & Pick<ImageSnapshot<T>, "voxelCount" | "data">,
  ) {
    super(image);

    this.internalTexture = getTextureFromAtlas(
      {
        voxelComponents: this.voxelComponents,
        voxelCount: this.voxelCount.clone(false),
      },
      this.getAtlas(),
      THREE.NearestFilter,
    );

    this.screenAlignedQuad = ScreenAlignedQuad.forTexture(this.internalTexture);

    this.voxels = new Voxels(
      this.getAtlasSize(),
      this.getAtlasGrid(),
      this.voxelCount,
    );

    this.sliceAtlasAdapter = new SliceAtlasAdapter(
      this.renderTargets[THREE.NearestFilter][0].texture,
      this.getAtlasGrid(),
      this.voxelCount.clone(false),
      this.voxelComponents,
    );
  }

  public setRenderers(renderers: THREE.WebGLRenderer[]) {
    this.renderers = renderers;

    if (this.renderers.length) {
      this.rendererCallbacks.forEach((callback) => callback());
      this.rendererCallbacks = [];
    }
  }

  public getTexture(rendererIndex = 0, filter = THREE.NearestFilter) {
    if (!this.renderTargets[filter][rendererIndex]) {
      this.renderTargets[filter][rendererIndex] = new ImageRenderTarget(
        this.getAtlasSize(),
        filter,
      );
      this.hasCPUUpdates[filter][rendererIndex] = true;
      this.voxelsRendered[filter][rendererIndex] = true;
    }

    return this.renderTargets[filter][rendererIndex].texture;
  }

  public waitForRender() {
    return new Promise<void>((resolve) => {
      this.renderCallbacks.push(resolve);
    });
  }

  public waitForRenderers() {
    if (this.renderers.length) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.rendererCallbacks.push(resolve);
    });
  }

  public render() {
    if (!this.renderers.length) return;

    this.renderers.forEach((renderer, rendererIndex) => {
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
    const renderer = this.renderers[rendererIndex];
    if (!renderer) return;

    copyToRenderTarget(
      this.screenAlignedQuad,
      this.renderTargets[filter][rendererIndex],
      renderer,
    );

    this.sliceAtlasAdapter.invalidateCache();

    this.hasCPUUpdates[filter][rendererIndex] = false;
  }

  private onModificationsOnGPU() {
    this.hasGPUUpdates = true;
    this.isDataDirty = true;
    this.sliceAtlasAdapter.invalidateCache();
  }

  private scheduleGPUPush() {
    this.internalTexture.needsUpdate = true;
    this.hasCPUUpdates[THREE.NearestFilter].fill(true);
    this.hasCPUUpdates[THREE.LinearFilter].fill(true);
  }

  private pullAtlasFromGPU() {
    if (!this.renderers.length) return;

    const atlasSize = this.getAtlasSize();
    const buffer = new Uint8Array(atlasSize.product() * 4);

    this.renderers[0].readRenderTargetPixels(
      this.renderTargets[THREE.NearestFilter][0],
      0,
      0,
      atlasSize.x,
      atlasSize.y,
      buffer,
    );

    const atlas = new Uint8Array(atlasSize.product());
    for (let i = 0; i < atlas.length; i++) {
      atlas[i] = buffer[4 * i];
    }

    super.setAtlas(atlas);
    this.hasGPUUpdates = false;
  }

  /** Can override unsaved changes to the atlas that are only stored on the GPU. */
  public setAtlas(atlas: Uint8Array) {
    super.setAtlas(atlas);
    this.hasGPUUpdates = false;

    if (this.internalTexture) {
      this.scheduleGPUPush();
    }
  }

  public setAtlasVoxels(voxels: VoxelWithValue[]) {
    this.voxelsToRender.push(voxels);
    this.voxelsRendered[THREE.NearestFilter].fill(false);
    this.voxelsRendered[THREE.LinearFilter].fill(false);
    this.isVoxelGeometryDirty = true;
  }

  public setAtlasVoxel(voxel: Voxel | Vector, value: number) {
    if (this.renderers.length) {
      const { x, y, z } = voxel;
      this.voxelsToRender.push({ x, y, z, value });
      this.voxelsRendered[THREE.NearestFilter].fill(false);
      this.voxelsRendered[THREE.LinearFilter].fill(false);
      this.isVoxelGeometryDirty = true;

      return;
    }

    super.setAtlasVoxel(voxel, value);
    this.scheduleGPUPush();
  }

  public setSlice(
    viewType: ViewType,
    slice: number,
    sliceData?: Uint8Array | THREE.Texture[],
  ) {
    if (this.renderers.length) {
      this.sliceAtlasAdapter.writeSlice(
        slice,
        viewType,
        sliceData,
        this.renderTargets[THREE.NearestFilter],
        this.renderers,
      );
      this.sliceAtlasAdapter.writeSlice(
        slice,
        viewType,
        sliceData,
        this.renderTargets[THREE.LinearFilter],
        this.renderers,
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
    if (this.renderers.length) {
      return this.sliceAtlasAdapter.readSlice(
        sliceNumber,
        viewType,
        this.renderers[0],
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
    const renderer = this.renderers[rendererIndex];
    if (!renderer) return;

    if (this.hasCPUUpdates[THREE.NearestFilter][rendererIndex]) {
      this.copyToRenderTarget(rendererIndex, THREE.NearestFilter);
    }

    this.sliceAtlasAdapter.readSliceToTarget(
      sliceNumber,
      viewType,
      renderer,
      target,
      this.getTexture(rendererIndex, THREE.NearestFilter),
    );
  }

  public getAtlas() {
    if (this.hasGPUUpdates) {
      this.pullAtlasFromGPU();
    }

    return super.getAtlas();
  }

  public toJSON() {
    if (this.hasGPUUpdates) {
      this.pullAtlasFromGPU();
    }

    return super.toJSON();
  }
}
