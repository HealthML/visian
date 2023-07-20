import * as THREE from "three";

import {
  autoSegPreviewFragmentShader,
  autoSegPreviewVertexShader,
} from "../../shaders";

export class AutoSegPreviewMaterial extends THREE.ShaderMaterial {
  constructor(parameters?: THREE.ShaderMaterialParameters) {
    super(
      parameters || {
        vertexShader: autoSegPreviewVertexShader,
        fragmentShader: autoSegPreviewFragmentShader,
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
