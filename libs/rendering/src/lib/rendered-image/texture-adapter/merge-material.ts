import { MergeFunction } from "@visian/ui-shared";
import * as THREE from "three";

import { mergeFragmentShader, mergeVertexShader } from "../../shaders";

/**
 * This material is used to merge one texture to another.
 * It should be rendered without clearing the target.
 * The source is provided as a texture, and may contain values that are between 0 and 1.
 * If this is the case, a threshold can be set. Then, only values larger than the threshold
 * will be added to the target. The output value is always 1, 0, or the pixel is discarded.
 */
export class MergeMaterial extends THREE.ShaderMaterial {
  constructor(uniforms = {}, defines = {}) {
    super({
      vertexShader: mergeVertexShader,
      fragmentShader: mergeFragmentShader,
      uniforms: {
        uDataTexture: { value: null },
        uMergeFunction: { value: MergeFunction.Replace },
        uUseThreshold: { value: false },
        uThreshold: { value: 0 },
        ...uniforms,
      },
      glslVersion: THREE.GLSL3,
      defines,
      depthTest: false,
      blending: THREE.NoBlending,
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

export class MergeMaterial3D extends MergeMaterial {
  constructor() {
    super(
      {
        uDepth: { value: 0 },
      },
      { VOLUME_TEXTURE: "" },
    );
  }

  public setSlice(slice: number, sliceCount: number) {
    this.uniforms.uDepth.value = (slice + 0.5) / sliceCount;
  }
}
