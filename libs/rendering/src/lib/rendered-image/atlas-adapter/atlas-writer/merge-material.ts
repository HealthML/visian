import * as THREE from "three";

import { mergeFragmentShader, mergeVertexShader } from "../../../shaders";
import { MergeFunction } from "../../types";

/**
 * This material is used to merge one texture atlas to another.
 * It should be rendered without clearing the target.
 * The source is provided as a texture. and may contain values that are between 0 and 1.
 * If this is the case, a threshold can be set. Then, only values larger than the threshold
 * will be added to the target. The output value is always 1
 * or the pixel is discarded.
 */
export class MergeMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: mergeVertexShader,
      fragmentShader: mergeFragmentShader,
      uniforms: {
        uDataTexture: { value: null },
        uMergeFunction: { value: MergeFunction.Replace },
        uUseThreshold: { value: false },
        uThreshold: { value: 0 },
      },
    });
  }

  public setSource(texture: THREE.Texture) {
    this.uniforms.uDataTexture.value = texture;
  }

  public setMergeFunction(mergeFunction: MergeFunction) {
    this.uniforms.uMergeFunction.value = mergeFunction;
  }

  public setThreshold(threshold?: number) {
    if (threshold !== undefined) {
      this.uniforms.uUseThreshold.value = true;
      this.uniforms.uThreshold.value = threshold;
    } else {
      this.uniforms.uUseThreshold.value = false;
    }
  }
}
