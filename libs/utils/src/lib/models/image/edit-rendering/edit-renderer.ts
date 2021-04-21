import * as THREE from "three";

import { ScreenAlignedQuad } from "../../../rendering";
import { VoxelWithValue } from "../../../types";
import { Vector } from "../../vector";
import { ImageRenderTarget } from "./image-render-target";
import { copyToRenderTarget, renderVoxels, updateVoxelGeometry } from "./utils";
import { VoxelCamera } from "./voxel-camera";
import VoxelMaterial from "./voxel-material";
import { VoxelScene } from "./voxel-scene";

export class EditRenderer {
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
    copyTexture: THREE.Texture,
    private atlasSize: Vector,
    atlasGrid: Vector,
    voxelCount: Vector,
  ) {
    this.screenAlignedQuad = ScreenAlignedQuad.forTexture(copyTexture);
    this.voxelCamera.setAtlasSize(atlasSize);
    this.voxelMaterial.setAtlasGrid(atlasGrid);
    this.voxelMaterial.setVoxelCount(voxelCount);
  }

  public getTexture(index = 0) {
    if (!this.renderTargets[index]) {
      this.renderTargets[index] = new ImageRenderTarget(this.atlasSize);
      this.isTextureDirty[index] = true;
      this.voxelsRendered[index] = true;
    }
    return this.renderTargets[index].texture;
  }

  public update(renderer: THREE.WebGLRenderer, index = 0) {
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

  public addVoxelToRender(voxel: VoxelWithValue) {
    this.voxelsToRender.push(voxel);
    this.voxelsRendered.fill(false);
    this.isVoxelGeometryDirty = true;
  }

  public triggerCopy() {
    this.isTextureDirty.fill(true);
  }
}
