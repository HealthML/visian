import { Texture3DMaterial } from "@visian/rendering";
import { IEditor } from "@visian/ui-shared";
import { IDisposer } from "@visian/utils";
import { reaction } from "mobx";
import * as THREE from "three";

import {
  gradientFragmentShader,
  gradientVertexShader,
  composeLayeredShader,
} from "../../../shaders";
import { SharedUniforms } from "../shared-uniforms";

export enum GradientMode {
  Output = 0,
  First = 1,
  Second = 2,
}

export class GradientMaterial extends Texture3DMaterial {
  private disposers: IDisposer[];

  constructor(
    editor: IEditor,
    private firstDerivativeTexture: THREE.Texture,
    private secondDerivativeTexture: THREE.Texture,
    sharedUniforms: SharedUniforms,
  ) {
    super({
      fragmentShader: gradientFragmentShader,
      vertexShader: gradientVertexShader,
      uniforms: {
        ...sharedUniforms.uniforms,
        uInputDimensions: { value: 1 },
        uGradientMode: { value: GradientMode.Output },
      },
      glslVersion: THREE.GLSL3,
    });

    sharedUniforms.subscribe(this);

    this.uniforms.uInputFirstDerivative.value = firstDerivativeTexture;
    this.uniforms.uInputSecondDerivative.value = secondDerivativeTexture;

    this.disposers = [
      reaction(
        () => editor.volumeRenderer?.renderedImageLayerCount || 1,
        (layerCount: number) => {
          this.fragmentShader = composeLayeredShader(
            gradientFragmentShader,
            layerCount,
          );
          this.needsUpdate = true;
        },
        { fireImmediately: true },
      ),
    ];
  }

  public setGradientMode(mode: GradientMode) {
    this.uniforms.uGradientMode.value = mode;

    this.uniforms.uInputFirstDerivative.value =
      mode === GradientMode.First ? null : this.firstDerivativeTexture;

    this.uniforms.uInputSecondDerivative.value =
      mode === GradientMode.Second ? null : this.secondDerivativeTexture;
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }
}
