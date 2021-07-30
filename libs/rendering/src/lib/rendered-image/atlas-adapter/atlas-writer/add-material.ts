import * as THREE from "three";
import { addFragmentShader, addVertexShader } from "../../../shaders";

/**
 * This material is used to add one texture atlas to another.
 * It should be rendered without clearing the target.
 * The source is provided as a texture. and may contain values that are between 0 and 1.
 * If this is the case as threshold can be set. Then, only values larger than the threshold
 * will be added to the target. The default threshold is 0. The output value is always 1
 * or the pixel is discarded.
 */
export class AddMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: addVertexShader,
      fragmentShader: addFragmentShader,
      uniforms: {
        uDataTexture: { value: null },
        uThreshold: { value: 0 },
      },
    });
  }

  public setSource(texture: THREE.Texture) {
    this.uniforms.uDataTexture.value = texture;
  }

  public setThreshold(threshold: number) {
    this.uniforms.uThreshold.value = threshold;
  }
}
