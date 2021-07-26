import { IEditor } from "@visian/ui-shared";
import { IDisposer } from "@visian/utils";
import { reaction } from "mobx";
import * as THREE from "three";

import { gradientFragmentShader, gradientVertexShader } from "../../../shaders";
import { composeLayeredShader } from "../compose-layered-shader";
import { SharedUniforms } from "../shared-uniforms";

export enum GradientMode {
  Output = 0,
  First = 1,
  Second = 2,
}

export class GradientMaterial extends THREE.ShaderMaterial {
  private disposers: IDisposer[];

  constructor(
    editor: IEditor,
    private firstDerivativeTexture: THREE.Texture,
    private secondDerivativeTexture: THREE.Texture,
    sharedUniforms: SharedUniforms,
  ) {
    super({
      fragmentShader: gradientFragmentShader,
      vertexShader: gradientVertexShader,
      uniforms: {
        ...sharedUniforms.uniforms,
        uInputDimensions: { value: 1 },
        uGradientMode: { value: GradientMode.Output },
      },
    });

    this.uniforms.uInputFirstDerivative.value = firstDerivativeTexture;
    this.uniforms.uInputSecondDerivative.value = secondDerivativeTexture;

    this.disposers = [
      reaction(
        () => editor.activeDocument?.imageLayers.length || 0,
        (layerCount: number) => {
          this.fragmentShader = composeLayeredShader(
            gradientFragmentShader,
            layerCount + 1, // additional layer for 3d region growing
          );
          this.needsUpdate = true;
        },
      ),
    ];
  }

  public setGradientMode(mode: GradientMode) {
    this.uniforms.uGradientMode.value = mode;

    this.uniforms.uInputFirstDerivative.value =
      mode === GradientMode.First ? null : this.firstDerivativeTexture;

    this.uniforms.uInputSecondDerivative.value =
      mode === GradientMode.Second ? null : this.secondDerivativeTexture;
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }
}

export default GradientMaterial;
