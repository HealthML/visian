import * as THREE from "three";

import { copyFragmentShader, copyVertexShader } from "../shaders";
import { Texture3DMaterial } from "./texture-3d-material";

export class Texture3DCopyMaterial extends Texture3DMaterial {
  constructor(sourceTexture: THREE.Texture | null = null) {
    super({
      vertexShader: copyVertexShader,
      fragmentShader: copyFragmentShader,
      uniforms: {
        uSourceTexture: { value: sourceTexture },
      },
      glslVersion: THREE.GLSL3,
    });
  }

  public setSourceTexture(sourceTexture: THREE.Texture | null) {
    this.uniforms.uSourceTexture.value = sourceTexture;
  }
}
