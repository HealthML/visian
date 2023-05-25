import * as THREE from "three";

import {
  samPreviewFragmentShader,
  samPreviewVertexShader,
} from "../../shaders";
import { Texture3DMaterial } from "../../texture-3d-renderer";

export class SamPreviewMaterial extends Texture3DMaterial {
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
