import * as THREE from "three";

import fragmentShader from "../../shader/lao/lao.frag.glsl";
import vertexShader from "../../shader/lao/lao.vert.glsl";
import { SharedUniforms } from "../shared-uniforms";
import { totalLAORays } from "./lao-computer";
import { getLAODirectionTexture } from "./lao-directions";

export class LAOMaterial extends THREE.ShaderMaterial {
  constructor(
    firstDerivativeTexture: THREE.Texture,
    secondDerivativeTexture: THREE.Texture,
    private previousFrameTexture: THREE.Texture,
    sharedUniforms: SharedUniforms,
  ) {
    super({
      vertexShader,
      fragmentShader,
      uniforms: {
        ...sharedUniforms.uniforms,
        uPreviousFrame: { value: null },
        uDirections: { value: getLAODirectionTexture(totalLAORays) },
        uPreviousDirections: { value: 0 },
        uTotalDirections: { value: totalLAORays },
      },
    });

    this.uniforms.uInputFirstDerivative.value = firstDerivativeTexture;
    this.uniforms.uInputSecondDerivative.value = secondDerivativeTexture;
  }

  public setCameraPosition(position: THREE.Vector3) {
    this.uniforms.uCameraPosition.value.copy(position);
  }

  public setPreviousDirections(amount: number) {
    if (amount) {
      this.uniforms.uPreviousFrame.value = this.previousFrameTexture;
    } else {
      this.uniforms.uPreviousFrame.value = null;
    }

    this.uniforms.uPreviousDirections.value = amount;
  }

  public get previousDirections() {
    return this.uniforms.uPreviousDirections.value;
  }
}

export default LAOMaterial;
