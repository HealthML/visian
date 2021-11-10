import { Voxel } from "@visian/utils";
import * as THREE from "three";

export class Texture3DMaterial extends THREE.ShaderMaterial {
  constructor(parameters: THREE.ShaderMaterialParameters = {}) {
    super({
      ...parameters,
      uniforms: {
        uSlice: { value: 0 },
        uSize: { value: [1, 1, 1] },
        ...parameters.uniforms,
      },
    });
  }

  public setSlice(slice: number) {
    this.uniforms.uSlice.value = slice;
  }

  public setSize(size: Voxel) {
    this.uniforms.uSize.value = [size.x, size.y, size.z];
  }
}
