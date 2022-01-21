import * as THREE from "three";
import {
  progressiveAccumulationFragmentShader,
  progressiveAccumulationVertexShader,
} from "../../shaders";

export class ProgressiveAccumulationMaterial extends THREE.ShaderMaterial {
  constructor(accumulationTexture: THREE.Texture, newTexture: THREE.Texture) {
    super({
      vertexShader: progressiveAccumulationVertexShader,
      fragmentShader: progressiveAccumulationFragmentShader,
      uniforms: {
        uAccumulatedFrame: { value: accumulationTexture },
        uNewFrame: { value: newTexture },
        uAccumulationCount: { value: 0 },
      },
    });
  }

  public setAccumulationCount(value = 0) {
    this.uniforms.uAccumulationCount.value = value;
  }
}
