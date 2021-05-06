import {
  getPlaneAxes,
  ScreenAlignedQuad,
  Vector,
  ViewType,
} from "@visian/utils";
import * as THREE from "three";

import { SliceReaderMaterial } from "./slice-reader-material";

export class SliceReader {
  private material: SliceReaderMaterial;
  private screenAlignedQuad: ScreenAlignedQuad;

  private lastViewType = ViewType.Transverse;
  private renderTarget: THREE.WebGLRenderTarget;

  private sliceCache?: {
    sliceNumber: number;
    viewType: ViewType;
    sliceData: Uint8Array;
  };

  constructor(
    atlasTexture: THREE.Texture,
    atlasGrid: Vector,
    private voxelCount: Vector,
    private components: number,
  ) {
    this.material = new SliceReaderMaterial(
      atlasTexture,
      atlasGrid,
      voxelCount,
    );
    this.screenAlignedQuad = new ScreenAlignedQuad(this.material);

    this.renderTarget = new THREE.WebGLRenderTarget(voxelCount.x, voxelCount.y);
  }

  public invalidateCache() {
    this.sliceCache = undefined;
  }

  public readSlice(
    sliceNumber: number,
    viewType: ViewType,
    renderer: THREE.WebGLRenderer,
  ) {
    if (
      this.sliceCache &&
      this.sliceCache.sliceNumber === sliceNumber &&
      this.sliceCache.viewType === viewType
    ) {
      return this.sliceCache.sliceData;
    }

    this.material.setSliceNumber(sliceNumber);

    const [widthAxis, heightAxis] = getPlaneAxes(viewType);
    const width = this.voxelCount[widthAxis];
    const height = this.voxelCount[heightAxis];

    if (this.lastViewType !== viewType) {
      this.material.setViewType(viewType);
      this.lastViewType = viewType;

      this.renderTarget.setSize(width, height);
    }

    // Render slice to render target.
    renderer.setRenderTarget(this.renderTarget);
    this.screenAlignedQuad.renderWith(renderer);
    renderer.setRenderTarget(null);

    // Read slice from render target.
    const buffer = new Uint8Array(width * height * 4);
    renderer.readRenderTargetPixels(
      this.renderTarget,
      0,
      0,
      width,
      height,
      buffer,
    );

    if (this.components === 4) {
      this.sliceCache = {
        sliceNumber,
        viewType,
        sliceData: buffer,
      };

      return buffer;
    }

    // Read components.
    const slice = new Uint8Array(width * height * this.components);
    for (let i = 0; i < width * height; i++) {
      for (let c = 0; c < this.components; c++) {
        slice[this.components * i + c] = buffer[4 * i + c];
      }
    }

    this.sliceCache = {
      sliceNumber,
      viewType,
      sliceData: slice,
    };

    return slice;
  }
}
