import * as THREE from "three";
import { quadFragmentShader, quadVertexShader } from "../../../shaders";
import { MergeFunction } from "../../types";

export class SliceQuadMaterial extends THREE.ShaderMaterial {
  constructor(texture: THREE.Texture) {
    super({
      vertexShader: quadVertexShader,
      fragmentShader: quadFragmentShader,
      uniforms: {
        uDataTexture: { value: texture },
        uMergeFunction: { value: MergeFunction.Replace },
      },
    });
  }

  public setTexture(texture: THREE.Texture | null) {
    this.uniforms.uDataTexture.value = texture;
  }

  public setMergeFunction(mergeFunction: MergeFunction) {
    this.uniforms.uMergeFunction.value = mergeFunction;
  }
}
