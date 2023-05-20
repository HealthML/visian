import * as THREE from "three";

import {
  samPreviewFragmentShader,
  samPreviewVertexShader,
} from "../../shaders";

export class SamPreviewMaterial extends THREE.ShaderMaterial {
  constructor(parameters?: THREE.ShaderMaterialParameters) {
    super(
      parameters || {
        vertexShader: samPreviewVertexShader,
        fragmentShader: samPreviewFragmentShader,
        uniforms: {
          uDataTexture: { value: null },
        },
      },
    );
  }

  public setDataTexture(texture: THREE.Texture) {
    this.uniforms.uDataTexture.value = texture;
  }
}
