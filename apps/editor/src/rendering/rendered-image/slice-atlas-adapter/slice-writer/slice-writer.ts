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

export class SliceWriter {
  private sliceTextures: THREE.DataTexture[];
  private textureDatas: Uint8Array[] = [];

  private sliceLines: SliceLines;
  private sliceQuad: SliceQuad;

  private linesScene = new THREE.Scene();
  private quadScene = new THREE.Scene();

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

    this.linesScene.add(this.sliceLines);
    this.quadScene.add(this.sliceQuad);
  }

  public writeSlice(
    sliceNumber: number,
    viewType: ViewType,
    sliceData: Uint8Array | undefined,
    renderTargets: THREE.WebGLRenderTarget[],
    renderers: THREE.WebGLRenderer[],
  ) {
    const textureData = this.textureDatas[viewType];
    if (sliceData) {
      if (sliceData.length !== textureData.length) {
        throw new Error("Provided data is not of the correct length.");
      }
      textureData.set(sliceData);
    } else {
      textureData.fill(0);
    }

    this.sliceTextures[viewType].needsUpdate = true;

    let scene: THREE.Scene;
    let camera: THREE.Camera;
    if (viewType === this.atlasViewType) {
      this.sliceQuad.positionForSlice(sliceNumber);
      scene = this.quadScene;
      camera = this.sliceQuad.camera;
    } else {
      this.sliceLines.setSlice(viewType, sliceNumber);
      scene = this.linesScene;
      camera = this.sliceLines.camera;
    }

    renderTargets.forEach((renderTarget, index) => {
      const renderer = renderers[index];

      renderer.setRenderTarget(renderTarget);
      renderer.autoClear = false;

      renderer.render(scene, camera);

      renderer.autoClear = true;
      renderer.setRenderTarget(null);
    });
  }
}
