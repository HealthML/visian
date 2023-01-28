import * as THREE from "three";

import { copyFragmentShader, copyVertexShader } from "../../shaders";

export class CopyMaterial extends THREE.ShaderMaterial {
  constructor(sourceTexture: THREE.Texture | null = null) {
    super({
      vertexShader: copyVertexShader,
      fragmentShader: copyFragmentShader,
      uniforms: {
        uSourceTexture: { value: sourceTexture },
      },
      defines: {
        TWO_D: "",
      },
      glslVersion: THREE.GLSL3,
    });
  }

  public setSourceTexture(sourceTexture: THREE.Texture | null) {
    this.uniforms.uSourceTexture.value = sourceTexture;
  }
}
