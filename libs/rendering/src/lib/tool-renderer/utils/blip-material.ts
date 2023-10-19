import { IDocument } from "@visian/ui-shared";
import * as THREE from "three";

import { Tool3DMaterial } from "./tool-3d-material";

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

export class Blip3DMaterial extends Tool3DMaterial {
  constructor(
    document: IDocument,
    parameters: THREE.ShaderMaterialParameters = {},
  ) {
    super(document, {
      ...parameters,
      uniforms: {
        uTargetTexture: { value: null },
        uRenderValue: {
          value: MAX_BLIP_STEPS / (MAX_BLIP_STEPS + 1),
        },
        ...parameters.uniforms,
      },
    });
  }

  public setTargetTexture(texture: THREE.Texture) {
    this.uniforms.uTargetTexture.value = texture;
  }

  public setStep(step: number) {
    this.uniforms.uRenderValue.value =
      (MAX_BLIP_STEPS + 1 - step) / (MAX_BLIP_STEPS + 1);
  }
}
