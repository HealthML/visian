import { IEditor } from "@visian/ui-shared";
import { IDisposable, IDisposer, ViewType } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

import { heatMapFragmentShader, heatMapVertexShader } from "../../shaders";
import colorScheme from "./heat-map-color-scheme.png";

export class HeatMapMaterial
  extends THREE.ShaderMaterial
  implements IDisposable
{
  private disposers: IDisposer[] = [];

  constructor(editor: IEditor, viewType: ViewType) {
    super({
      vertexShader: heatMapVertexShader,
      fragmentShader: heatMapFragmentShader,
      uniforms: {
        uDataTexture: { value: null },
        uActiveSlices: { value: [0, 0, 0] },
        uImageVoxelCount: { value: [1, 1, 1] },
        uVoxelCount: { value: [1, 1, 1] },
        uAtlasGrid: { value: [1, 1] },
        uColorTexture: { value: null },
        uOpacity: { value: 0.5 },
      },
      side: THREE.DoubleSide,
      transparent: true,
      glslVersion: THREE.GLSL3,
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

    const loader = new THREE.TextureLoader();
    const colorTexture = loader.load(colorScheme, () => {
      editor.sliceRenderer?.lazyRender();
    });
    colorTexture.minFilter = THREE.NearestFilter;
    colorTexture.magFilter = THREE.NearestFilter;
    this.uniforms.uColorTexture.value = colorTexture;

    this.disposers.push(
      autorun(() => {
        this.uniforms.uImageVoxelCount.value =
          editor.activeDocument?.mainImageLayer?.image.voxelCount;
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uActiveSlices.value =
          editor.activeDocument?.viewSettings.selectedVoxel.toArray();
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uDataTexture.value =
          editor.activeDocument?.trackingData?.texture;
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uVoxelCount.value =
          editor.activeDocument?.trackingData?.resolution.toArray();
        editor.sliceRenderer?.lazyRender();
      }),
    );
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }
}
