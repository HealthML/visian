import { Vector, ViewType } from "@visian/utils";
import * as THREE from "three";

import { linesFragmentShader, linesVertexShader } from "../../../shaders";

export class SliceLinesMaterial extends THREE.ShaderMaterial {
  constructor(
    atlasGrid: Vector,
    voxelCount: Vector,
    texture: THREE.Texture | null,
  ) {
    super({
      vertexShader: linesVertexShader,
      fragmentShader: linesFragmentShader,
      uniforms: {
        uAtlasGrid: { value: atlasGrid.toArray() },
        uVoxelCount: { value: voxelCount.toArray() },
        uViewType: { value: ViewType.Transverse },
        uDataTexture: { value: texture },
      },
    });
  }

  public setViewType(viewType: ViewType, texture: THREE.Texture | null) {
    this.uniforms.uViewType.value = viewType;
    this.uniforms.uDataTexture.value = texture;
  }
}
