import * as THREE from "three";
import { MAX_REGION_GROWING_STEPS } from "../region-growing-renderer-3d";

export class BlipMaterial extends THREE.ShaderMaterial {
  constructor(parameters: THREE.ShaderMaterialParameters = {}) {
    super({
      uniforms: {
        uSourceTexture: { value: null },
        uTargetTexture: { value: null },
      },
      ...parameters,
    });
  }

  public setSourceTexture(texture: THREE.Texture) {
    this.uniforms.uSourceTexture.value = texture;
  }

  public setTargetTexture(texture: THREE.Texture) {
    this.uniforms.uTargetTexture.value = texture;
  }
}

export class Blip3DMaterial extends BlipMaterial {
  constructor(parameters: THREE.ShaderMaterialParameters = {}) {
    super({
      uniforms: {
        uSourceTexture: { value: null },
        uTargetTexture: { value: null },
        uVoxelCount: { value: [1, 1, 1] },
        uAtlasGrid: { value: [1, 1] },
        uRenderValue: {
          value: MAX_REGION_GROWING_STEPS / (MAX_REGION_GROWING_STEPS + 1),
        },
      },
      ...parameters,
    });
  }

  public setVoxelCount(voxelCount: number[]) {
    this.uniforms.uVoxelCount.value = voxelCount;
  }

  public setAtlasGrid(atlasGrid: number[]) {
    this.uniforms.uAtlasGrid.value = atlasGrid;
  }

  public setStep(step: number) {
    this.uniforms.uRenderValue.value =
      (MAX_REGION_GROWING_STEPS + 1 - step) / (MAX_REGION_GROWING_STEPS + 1);
  }
}
