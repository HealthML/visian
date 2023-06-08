import { IDocument } from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { reaction } from "mobx";
import * as THREE from "three";

import { Texture3DMaterial } from "../../texture-3d-renderer";

export class Tool3DMaterial extends Texture3DMaterial implements IDisposable {
  private disposers: IDisposer[] = [];

  constructor(
    document: IDocument,
    parameters: THREE.ShaderMaterialParameters = {},
  ) {
    super({
      ...parameters,
      uniforms: {
        uSourceTexture: { value: null },
        ...parameters.uniforms,
      },
      defines: {
        ...parameters.defines,
      },
    });

    this.disposers.push(
      reaction(
        () => Boolean(document.mainImageLayer?.is3DLayer),
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

  public setSourceTexture(texture: THREE.Texture) {
    this.uniforms.uSourceTexture.value = texture;
  }
}
