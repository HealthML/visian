import { IEditor } from "@visian/ui-shared";
import { IDisposer } from "@visian/utils";
import { reaction } from "mobx";
import * as THREE from "three";

import { laoFragmentShader, laoVertexShader } from "../../../shaders";
import { composeLayeredShader } from "../compose-layered-shader";
import { SharedUniforms } from "../shared-uniforms";
import { totalLAORays } from "./lao-computer";
import { getLAODirectionTexture } from "./lao-directions";

export class LAOMaterial extends THREE.ShaderMaterial {
  private disposers: IDisposer[];

  constructor(
    editor: IEditor,
    firstDerivativeTexture: THREE.Texture,
    secondDerivativeTexture: THREE.Texture,
    private previousFrameTexture: THREE.Texture,
    sharedUniforms: SharedUniforms,
  ) {
    super({
      vertexShader: laoVertexShader,
      fragmentShader: laoFragmentShader,
      uniforms: {
        ...sharedUniforms.uniforms,
        uPreviousFrame: { value: null },
        uDirections: { value: getLAODirectionTexture(totalLAORays) },
        uPreviousDirections: { value: 0 },
        uTotalDirections: { value: totalLAORays },
      },
    });

    this.uniforms.uInputFirstDerivative.value = firstDerivativeTexture;
    this.uniforms.uInputSecondDerivative.value = secondDerivativeTexture;

    this.disposers = [
      reaction(
        () =>
          editor.activeDocument?.layers.filter(
            (layer) => layer.kind === "image",
          ).length || 0,
        (layerCount: number) => {
          this.fragmentShader = composeLayeredShader(
            laoFragmentShader,
            layerCount,
          );
          this.needsUpdate = true;
        },
      ),
    ];
  }

  public setPreviousDirections(amount: number) {
    if (amount) {
      this.uniforms.uPreviousFrame.value = this.previousFrameTexture;
    } else {
      this.uniforms.uPreviousFrame.value = null;
    }

    this.uniforms.uPreviousDirections.value = amount;
  }

  public get previousDirections() {
    return this.uniforms.uPreviousDirections.value;
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }
}

export default LAOMaterial;
