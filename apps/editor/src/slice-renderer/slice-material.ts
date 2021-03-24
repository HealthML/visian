import { TextureAtlas } from "@visian/util";
import { autorun } from "mobx";
import { IDisposer } from "mobx-utils/lib/utils";
import * as THREE from "three";

import { Editor } from "../models";
import fragmentShader from "./shader/slice.frag.glsl";
import vertexShader from "./shader/slice.vert.glsl";
import { IDisposable, ViewType } from "./types";

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
        // TODO: This should go as soon as we map density to alpha
        uBackground: { value: [0, 0, 0] },
        // TODO: This should probably go as soon as we map density to alpha
        uScanBackground: { value: 0 },
        uContrast: { value: editor.contrast },
        uBrightness: { value: editor.brightness },
        // TODO: This should go as soon as we map density to alpha
        uBlueTint: { value: false },
      },
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
