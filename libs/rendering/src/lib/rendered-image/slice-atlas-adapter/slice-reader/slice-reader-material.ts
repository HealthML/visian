import { Vector, ViewType } from "@visian/utils";
import * as THREE from "three";

import { rawSliceFragmentShader, sliceVertexShader } from "../../../shaders";

export class SliceReaderMaterial extends THREE.ShaderMaterial {
  constructor(
    dataTexture: THREE.Texture,
    atlasGrid: Vector,
    voxelCount: Vector,
  ) {
    super({
      vertexShader: sliceVertexShader,
      fragmentShader: rawSliceFragmentShader,
      uniforms: {
        uDataTexture: { value: dataTexture },
        uVoxelCount: { value: voxelCount.toArray() },
        uAtlasGrid: { value: atlasGrid.toArray() },
        uSliceNumber: { value: 0 },
        uViewType: { value: ViewType.Transverse },
      },
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
