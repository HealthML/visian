import { Voxel } from "@visian/utils";
import * as THREE from "three";

export class Texture3DMaterial extends THREE.ShaderMaterial {
  constructor(parameters: THREE.ShaderMaterialParameters = {}) {
    super({
      ...parameters,
      uniforms: {
        uSlice: { value: 0 },
        uSize: { value: [1, 1, 1] },
        uSourceTexture: { value: null },
        ...parameters.uniforms,
      },
      defines: {
        VOLUMETRIC_IMAGE: "",
        ...parameters.defines,
      },
    });
  }

  public setSourceTexture(texture: THREE.Texture) {
    this.uniforms.uSourceTexture.value = texture;
  }

  public setSlice(slice: number) {
    this.uniforms.uSlice.value = slice;
  }

  public setSize(size: Voxel) {
    this.uniforms.uSize.value = [size.x, size.y, size.z];
  }
}
