import * as THREE from "three";
import { addFragmentShader, addVertexShader } from "../../../shaders";

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
