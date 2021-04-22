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
  updateVoxelGeometry,
  VoxelCamera,
  VoxelMaterial,
  VoxelScene,
} from "./edit-rendering";

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

  /** Used to update the atlas from the CPU. */
  private internalTexture: THREE.DataTexture;

  /** Contains the voxels which have to be rendered into the atlas. */
  private voxelsToRender: VoxelWithValue[] = [];
  /** Whether or not @member voxelsToRender have been rendered into the atlas for the different WebGL contexts. */
  private voxelsRendered = [true];
  /** Used to render the voxels into the texture atlas. */
  private voxelGeometry = new THREE.BufferGeometry();
  private voxelMaterial = new VoxelMaterial();
  private voxels = new VoxelScene(this.voxelGeometry, this.voxelMaterial);
  private voxelCamera = new VoxelCamera();
  /** Whether or not @member voxelGeometry needs to be updated before rendering. */
  private isVoxelGeometryDirty = false;

  /** The render targets for the texture atlases for the different WebGL contexts. */
  private renderTargets: ImageRenderTarget[] = [];
  /** Whether or not the corresponding render target needs to be updated from the CPU data. */
  public isTextureDirty = [true];
  /** Used to update the render targets from the CPU data. */
  private screenAlignedQuad: ScreenAlignedQuad;

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
    this.voxelCamera.setAtlasSize(this.getAtlasSize());
    this.voxelMaterial.setAtlasGrid(this.getAtlasGrid());
    this.voxelMaterial.setVoxelCount(this.voxelCount);
  }

  public getTexture(index = 0) {
    if (!this.renderTargets[index]) {
      this.renderTargets[index] = new ImageRenderTarget(this.getAtlasSize());
      this.isTextureDirty[index] = true;
      this.voxelsRendered[index] = true;
    }
    return this.renderTargets[index].texture;
  }

  public onBeforeRender(renderer: THREE.WebGLRenderer, index = 0) {
    if (this.isTextureDirty[index] && this.renderTargets[index]) {
      copyToRenderTarget(
        this.screenAlignedQuad,
        this.renderTargets[index],
        renderer,
      );

      this.isTextureDirty[index] = false;
    }

    if (this.voxelsToRender.length && !this.voxelsRendered[index]) {
      if (this.isVoxelGeometryDirty) {
        updateVoxelGeometry(this.voxelsToRender, this.voxelGeometry);
        this.isVoxelGeometryDirty = false;
      }

      renderVoxels(
        this.voxels,
        this.voxelCamera,
        this.renderTargets[index],
        renderer,
      );

      this.voxelsRendered[index] = true;
      if (this.voxelsRendered.every((value) => value)) {
        this.voxelsToRender = [];
        this.isVoxelGeometryDirty = true;
      }
    }
  }

  private triggerCopy() {
    this.isTextureDirty.fill(true);
  }

  public setAtlas(atlas: Uint8Array) {
    super.setAtlas(atlas);

    if (this.internalTexture) {
      this.internalTexture.needsUpdate = true;
      this.triggerCopy();
    }
  }

  public setAtlasVoxel(voxel: Vector, value: number) {
    super.setAtlasVoxel(voxel, value);

    const { x, y, z } = voxel;
    this.voxelsToRender.push({ x, y, z, value });
    this.voxelsRendered.fill(false);
    this.isVoxelGeometryDirty = true;

    this.internalTexture.needsUpdate = true;
  }

  public setSlice(viewType: ViewType, slice: number, sliceData?: Uint8Array) {
    super.setSlice(viewType, slice, sliceData);

    this.internalTexture.needsUpdate = true;
    this.triggerCopy();
  }
}
