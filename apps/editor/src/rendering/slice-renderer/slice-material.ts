import { TextureAtlas } from "@visian/util";
import { autorun } from "mobx";
import { IDisposer } from "mobx-utils/lib/utils";
import * as THREE from "three";

import fragmentShader from "./shaders/slice.frag.glsl";
import vertexShader from "./shaders/slice.vert.glsl";
import { IDisposable, ViewType } from "./types";

import type { Editor } from "../../models";

export class SliceMaterial extends THREE.ShaderMaterial implements IDisposable {
  private disposers: IDisposer[] = [];

  constructor(editor: Editor, viewType: ViewType, render: () => void) {
    super({
      defines: {
        SCAN: "",
      },
      vertexShader,
      fragmentShader,
      uniforms: {
        uDataTexture: { value: null },
        uActiveSlices: { value: [0, 0, 0] },
        uVoxelCount: { value: [1, 1, 1] },
        uAtlasGrid: { value: [1, 1] },
        uContrast: { value: editor.contrast },
        uBrightness: { value: editor.brightness },
        uForegroundColor: { value: new THREE.Color("white") },
      },
      transparent: true,
    });

    switch (viewType) {
      case ViewType.Transverse:
        this.defines.TRANSVERSE = "";
        break;
      case ViewType.Sagittal:
        this.defines.SAGITTAL = "";
        break;
      case ViewType.Coronal:
        this.defines.CORONAL = "";
        break;
    }

    this.disposers.push(
      autorun(() => {
        this.uniforms.uContrast.value = editor.contrast;
        render();
      }),
      autorun(() => {
        this.uniforms.uBrightness.value = editor.brightness;
        render();
      }),
      autorun(() => {
        this.uniforms.uActiveSlices.value = editor.selectedVoxel.array;
        render();
      }),
      autorun(() => {
        (this.uniforms.uForegroundColor.value as THREE.Color).set(
          editor.foregroundColor,
        );
      }),
    );
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }

  /** Updates the rendered atlas. */
  public setAtlas(atlas: TextureAtlas) {
    this.uniforms.uDataTexture.value = atlas.getTexture();
    this.uniforms.uVoxelCount.value = atlas.voxelCount;
    this.uniforms.uAtlasGrid.value = atlas.atlasGrid;
  }
}
