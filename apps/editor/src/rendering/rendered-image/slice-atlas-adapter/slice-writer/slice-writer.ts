import {
  getAtlasGrid,
  getPlaneAxes,
  textureFormatForComponents,
  Vector,
  ViewType,
  viewTypes,
} from "@visian/utils";
import * as THREE from "three";

import { SliceLines } from "./slice-lines";
import { SliceQuad } from "./slice-quad";
import { SliceScene } from "./types";

export class SliceWriter {
  private sliceTextures: THREE.DataTexture[];
  private textureDatas: Uint8Array[] = [];

  private sliceLines: SliceLines;
  private sliceQuad: SliceQuad;

  constructor(
    voxelCount: Vector,
    components: number,
    private atlasViewType = ViewType.Transverse,
  ) {
    this.sliceTextures = viewTypes.map((viewType) => {
      const [widthAxis, heightAxis] = getPlaneAxes(viewType);
      const width = voxelCount[widthAxis];
      const height = voxelCount[heightAxis];

      this.textureDatas[viewType] = new Uint8Array(components * width * height);

      return new THREE.DataTexture(
        this.textureDatas[viewType],
        width,
        height,
        textureFormatForComponents(components),
      );
    });

    this.sliceLines = new SliceLines(voxelCount, this.sliceTextures);
    this.sliceQuad = new SliceQuad(
      this.sliceTextures[atlasViewType],
      getAtlasGrid(voxelCount),
    );
  }

  public writeSlice(
    sliceNumber: number,
    viewType: ViewType,
    sliceData: Uint8Array | THREE.Texture[] | undefined,
    renderTargets: THREE.WebGLRenderTarget[],
    renderers: THREE.WebGLRenderer[],
  ) {
    const textureData = this.textureDatas[viewType];
    if (sliceData) {
      if (sliceData instanceof Uint8Array) {
        if (sliceData.length !== textureData.length) {
          throw new Error("Provided data is not of the correct length.");
        }

        textureData.set(sliceData);
      }
    } else {
      textureData.fill(0);
    }

    this.sliceTextures[viewType].needsUpdate = true;

    let scene: SliceScene;
    let camera: THREE.Camera;
    if (viewType === this.atlasViewType) {
      this.sliceQuad.positionForSlice(sliceNumber);
      scene = this.sliceQuad;
      camera = this.sliceQuad.camera;
    } else {
      this.sliceLines.setSlice(viewType, sliceNumber);
      scene = this.sliceLines;
      camera = this.sliceLines.camera;
    }

    renderTargets.forEach((renderTarget, index) => {
      if (sliceData && !(sliceData instanceof Uint8Array)) {
        scene.setOverrideTexture(sliceData[index]);
      }

      const renderer = renderers[index];

      renderer.setRenderTarget(renderTarget);
      renderer.autoClear = false;

      renderer.render(scene, camera);

      renderer.autoClear = true;
      renderer.setRenderTarget(null);

      if (sliceData && !(sliceData instanceof Uint8Array)) {
        scene.setOverrideTexture();
      }
    });
  }
}
