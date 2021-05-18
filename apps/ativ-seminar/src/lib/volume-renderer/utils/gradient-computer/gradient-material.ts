import * as THREE from "three";

import gradientFragmentShader from "../../shader/gradient/gradient.frag.glsl";
import gradientVertexShader from "../../shader/gradient/gradient.vert.glsl";
import { SharedUniforms } from "../shared-uniforms";

export enum GradientMode {
  Output = 0,
  First = 1,
  Second = 2,
}

export class GradientMaterial extends THREE.ShaderMaterial {
  constructor(
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
  }

  public setGradientMode(mode: GradientMode) {
    this.uniforms.uGradientMode.value = mode;

    this.uniforms.uInputFirstDerivative.value =
      mode === GradientMode.First ? null : this.firstDerivativeTexture;

    this.uniforms.uInputSecondDerivative.value =
      mode === GradientMode.Second ? null : this.secondDerivativeTexture;
  }

  public setCameraPosition(position: THREE.Vector3) {
    this.uniforms.uCameraPosition.value.copy(position);
  }
}

export default GradientMaterial;
