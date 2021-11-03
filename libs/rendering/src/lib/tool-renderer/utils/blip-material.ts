import * as THREE from "three";
import { Texture3DMaterial } from "../../texture-3d-renderer";

export const MAX_BLIP_STEPS = 254;

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

export class Blip3DMaterial extends Texture3DMaterial {
  constructor(parameters: THREE.ShaderMaterialParameters = {}) {
    super({
      ...parameters,
      uniforms: {
        uSourceTexture: { value: null },
        uTargetTexture: { value: null },
        uRenderValue: {
          value: MAX_BLIP_STEPS / (MAX_BLIP_STEPS + 1),
        },
        ...parameters.uniforms,
      },
    });
  }

  public setSourceTexture(texture: THREE.Texture) {
    this.uniforms.uSourceTexture.value = texture;
  }

  public setTargetTexture(texture: THREE.Texture) {
    this.uniforms.uTargetTexture.value = texture;
  }

  public setStep(step: number) {
    this.uniforms.uRenderValue.value =
      (MAX_BLIP_STEPS + 1 - step) / (MAX_BLIP_STEPS + 1);
  }
}
