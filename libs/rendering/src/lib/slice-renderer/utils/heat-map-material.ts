import { heatMapFragmentShader, heatMapVertexShader } from "@visian/rendering";
import { IEditor } from "@visian/ui-shared";
import { IDisposable, IDisposer, ViewType } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

export class HeatMapMaterial
  extends THREE.ShaderMaterial
  implements IDisposable {
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
      },
      side: THREE.DoubleSide,
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
        this.uniforms.uImageVoxelCount.value =
          editor.activeDocument?.baseImageLayer?.image.voxelCount;
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uActiveSlices.value = editor.activeDocument?.viewSettings.selectedVoxel.toArray();
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uDataTexture.value =
          editor.activeDocument?.trackingData?.texture;
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uVoxelCount.value = editor.activeDocument?.trackingData?.resolution.toArray();
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uAtlasGrid.value = editor.activeDocument?.trackingData?.atlasGrid.toArray();
        editor.sliceRenderer?.lazyRender();
      }),
    );
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }
}
