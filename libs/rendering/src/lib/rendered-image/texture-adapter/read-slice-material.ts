import { Vector, ViewType } from "@visian/utils";
import * as THREE from "three";

import { rawSliceFragmentShader, sliceVertexShader } from "../../shaders";

export class ReadSliceMaterial extends THREE.ShaderMaterial {
  constructor(voxelCount: Vector) {
    super({
      vertexShader: sliceVertexShader,
      fragmentShader: rawSliceFragmentShader,
      uniforms: {
        uDataTexture: { value: null },
        uSliceNumber: { value: 0 },
        uViewType: { value: ViewType.Transverse },
        uVoxelCount: { value: voxelCount.toArray() },
      },
      glslVersion: THREE.GLSL3,
    });
  }

  public setSliceNumber(sliceNumber: number) {
    this.uniforms.uSliceNumber.value = sliceNumber;
  }

  public setViewType(viewType: ViewType) {
    this.uniforms.uViewType.value = viewType;
  }

  public setDataTexture(texture: THREE.Texture) {
    this.uniforms.uDataTexture.value = texture;
  }
}
