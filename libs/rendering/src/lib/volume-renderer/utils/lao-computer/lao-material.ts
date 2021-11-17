import { Texture3DMaterial } from "@visian/rendering";
import { IEditor } from "@visian/ui-shared";
import { IDisposer } from "@visian/utils";
import { autorun, reaction } from "mobx";
import * as THREE from "three";

import {
  laoFragmentShader,
  laoVertexShader,
  composeLayeredShader,
} from "../../../shaders";
import { SharedUniforms } from "../shared-uniforms";
import {
  getLAODirectionTexture,
  getTotalLAODirections,
} from "./lao-directions";

export class LAOMaterial extends Texture3DMaterial {
  private disposers: IDisposer[] = [];

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
        uDirections: { value: getLAODirectionTexture(32) },
        uPreviousDirections: { value: 0 },
        uTotalDirections: { value: 32 },
      },
      glslVersion: THREE.GLSL3,
    });

    sharedUniforms.subscribe(this);

    this.uniforms.uInputFirstDerivative.value = firstDerivativeTexture;
    this.uniforms.uInputSecondDerivative.value = secondDerivativeTexture;

    this.disposers.push(
      reaction(
        () => editor.volumeRenderer?.renderedImageLayerCount || 1,
        (layerCount: number) => {
          this.fragmentShader = composeLayeredShader(
            laoFragmentShader,
            layerCount,
          );
          this.needsUpdate = true;
        },
        { fireImmediately: true },
      ),
      autorun(() => {
        const totalLAORays = getTotalLAODirections(editor.performanceMode);

        this.uniforms.uTotalDirections.value = totalLAORays;
        this.uniforms.uDirections.value = getLAODirectionTexture(totalLAORays);
      }),
    );
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
