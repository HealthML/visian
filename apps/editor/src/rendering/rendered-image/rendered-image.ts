import {
  getTextureFromAtlas,
  Image,
  ImageSnapshot,
  ITKImage,
  readMedicalImage,
  ScreenAlignedQuad,
  TypedArray,
  unifyOrientation,
  Vector,
  ViewType,
  VoxelWithValue,
} from "@visian/utils";
import * as THREE from "three";

import {
  copyToRenderTarget,
  ImageRenderTarget,
  renderVoxels,
  Voxels,
} from "./edit-rendering";
import { SliceAtlasAdapter } from "./slice-atlas-adapter";

export class RenderedImage<T extends TypedArray = TypedArray> extends Image<T> {
  public static fromITKImage<T extends TypedArray = TypedArray>(
    image: ITKImage<T>,
  ) {
    return new RenderedImage({
      name: image.name,
      dimensionality: image.imageType.dimension,
      voxelCount:
        image.imageType.dimension === 2 ? [...image.size, 1] : image.size,
      voxelSpacing:
        image.imageType.dimension === 2 ? [...image.spacing, 1] : image.spacing,
      voxelType: image.imageType.pixelType,
      voxelComponents: image.imageType.components,
      voxelComponentType: image.imageType.componentType,
      origin: image.origin,
      orientation: image.direction,
      data: unifyOrientation(
        image.data,
        image.direction,
        image.imageType.dimension,
        image.size,
        image.imageType.components,
      ),
    });
  }

  public static async fromFile(file: File) {
    const renderedImage = RenderedImage.fromITKImage(
      await readMedicalImage(file),
    );
    renderedImage.name = file.name;
    return renderedImage;
  }

  private renderers: THREE.WebGLRenderer[] = [];

  /** Used to update the atlas from the CPU. */
  private internalTexture: THREE.DataTexture;

  /** Contains the voxels which have to be rendered into the atlas. */
  private voxelsToRender: (VoxelWithValue | VoxelWithValue[])[] = [];
  /** Whether or not @member voxelsToRender have been rendered into the atlas for the different WebGL contexts. */
  private voxelsRendered = [true];
  /** Used to render voxels into the texture atlas. */
  private voxels: Voxels;
  /** Whether or not @member voxelGeometry needs to be updated before rendering. */
  private isVoxelGeometryDirty = false;

  /** The render targets for the texture atlases for the different WebGL contexts. */
  private renderTargets = [new ImageRenderTarget(this.getAtlasSize())];
  /** Whether or not the corresponding render target needs to be updated from the CPU data. */
  private hasCPUUpdates = [true];
  /** Callbacks to be invoked when the next render succeeds. */
  private renderCallbacks: (() => void)[] = [];
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
      this.renderTargets[0].texture,
      this.getAtlasGrid(),
      this.voxelCount.clone(false),
      this.voxelComponents,
    );
  }

  public setRenderers(renderers: THREE.WebGLRenderer[]) {
    this.renderers = renderers;
  }

  public getTexture(index = 0) {
    if (!this.renderTargets[index]) {
      this.renderTargets[index] = new ImageRenderTarget(this.getAtlasSize());
      this.hasCPUUpdates[index] = true;
      this.voxelsRendered[index] = true;
    }
    return this.renderTargets[index].texture;
  }

  public waitForRender() {
    return new Promise<void>((resolve) => {
      this.renderCallbacks.push(resolve);
    });
  }

  public onBeforeRender(index = 0) {
    const renderer = this.renderers[index];
    if (!renderer) return;

    if (this.hasCPUUpdates[index] && this.renderTargets[index]) {
      copyToRenderTarget(
        this.screenAlignedQuad,
        this.renderTargets[index],
        renderer,
      );

      this.sliceAtlasAdapter.invalidateCache();

      this.hasCPUUpdates[index] = false;
    }

    if (this.voxelsToRender.length && !this.voxelsRendered[index]) {
      if (this.isVoxelGeometryDirty) {
        this.voxels.updateGeometry(this.voxelsToRender);
        this.isVoxelGeometryDirty = false;
      }

      renderVoxels(this.voxels, this.renderTargets[index], renderer);
      this.onGPUUpates();

      this.voxelsRendered[index] = true;
      if (this.voxelsRendered.every((value) => value)) {
        this.voxelsToRender = [];
        this.isVoxelGeometryDirty = true;

        this.renderCallbacks.forEach((callback) => callback());
        this.renderCallbacks = [];
      }
    }
  }

  private onGPUUpates() {
    this.hasGPUUpdates = true;
    this.sliceAtlasAdapter.invalidateCache();
  }

  private triggerGPUPush() {
    this.internalTexture.needsUpdate = true;
    this.hasCPUUpdates.fill(true);
  }

  // TODO: Use this to update this.atlas when necessary.
  private pullAtlasFromGPU() {
    const renderer = this.renderers[0];
    if (!renderer) return;

    const atlasSize = this.getAtlasSize();
    const buffer = new Uint8Array(atlasSize.product() * 4);

    renderer.readRenderTargetPixels(
      this.renderTargets[0],
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

  public setAtlas(atlas: Uint8Array) {
    super.setAtlas(atlas);
    this.hasGPUUpdates = false;

    if (this.internalTexture) {
      this.triggerGPUPush();
    }
  }

  public setAtlasVoxels(voxels: VoxelWithValue[]) {
    this.voxelsToRender.push(voxels);
    this.voxelsRendered.fill(false);
    this.isVoxelGeometryDirty = true;
  }

  public setAtlasVoxel(voxel: Vector, value: number) {
    if (this.renderers[0]) {
      const { x, y, z } = voxel;
      this.voxelsToRender.push({ x, y, z, value });
      this.voxelsRendered.fill(false);
      this.isVoxelGeometryDirty = true;
    } else {
      super.setAtlasVoxel(voxel, value);
      this.triggerGPUPush();
    }
  }

  public setSlice(viewType: ViewType, slice: number, sliceData?: Uint8Array) {
    if (this.renderers[0]) {
      this.sliceAtlasAdapter.writeSlice(
        slice,
        viewType,
        sliceData,
        this.renderTargets,
        this.renderers,
      );

      this.onGPUUpates();

      return;
    }

    super.setSlice(viewType, slice, sliceData);
    this.triggerGPUPush();
  }

  public getSlice(sliceNumber: number, viewType: ViewType) {
    if (this.renderers[0]) {
      return this.sliceAtlasAdapter.readSlice(
        sliceNumber,
        viewType,
        this.renderers[0],
      );
    }

    // Attention: super.getSlice does not work for more than one component at the moment!
    return super.getSlice(sliceNumber, viewType);
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
