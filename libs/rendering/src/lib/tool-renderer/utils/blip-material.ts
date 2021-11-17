import { IDocument } from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { reaction } from "mobx";
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

export class Blip3DMaterial extends Texture3DMaterial implements IDisposable {
  private disposers: IDisposer[] = [];

  constructor(
    document: IDocument,
    parameters: THREE.ShaderMaterialParameters = {},
  ) {
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
      defines: {
        VOLUMETRIC_IMAGE: "",
        ...parameters.defines,
      },
    });

    this.disposers.push(
      reaction(
        () => Boolean(document.baseImageLayer?.is3DLayer),
        (is3D: boolean) => {
          if (is3D) {
            this.defines.VOLUMETRIC_IMAGE = "";
          } else {
            delete this.defines.VOLUMETRIC_IMAGE;
          }
          this.needsUpdate = true;
        },
        { fireImmediately: true },
      ),
    );
  }

  public dispose() {
    super.dispose();
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
