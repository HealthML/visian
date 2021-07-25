import * as THREE from "three";
import { addFragmentShader, addVertexShader } from "../../../shaders";

export class AddMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: addVertexShader,
      fragmentShader: addFragmentShader,
      uniforms: {
        uDataTexture: { value: null },
      },
    });
  }

  public setSource(texture: THREE.Texture) {
    this.uniforms.uDataTexture.value = texture;
  }
}
