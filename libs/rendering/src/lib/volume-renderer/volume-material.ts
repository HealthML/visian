import { IEditor } from "@visian/ui-shared";
import { IDisposable } from "@visian/utils";
import { reaction } from "mobx";
import * as THREE from "three";

import { volumeFragmentShader, volumeVertexShader } from "../shaders";
import { composeLayeredShader, SharedUniforms } from "./utils";

/** A volume domain material. */
export class VolumeMaterial
  extends THREE.ShaderMaterial
  implements IDisposable {
  constructor(
    editor: IEditor,
    sharedUniforms: SharedUniforms,
    firstDerivative: THREE.Texture,
    secondDerivative: THREE.Texture,
    outputDerivative: THREE.Texture,
    lao: THREE.Texture,
  ) {
    super({
      vertexShader: volumeVertexShader,
      fragmentShader: volumeFragmentShader,
      uniforms: {
        ...sharedUniforms.uniforms,
        uOutputFirstDerivative: { value: null },
        uLAO: { value: null },
      },
      transparent: true,
    });

    // Always render the back faces.
    this.side = THREE.BackSide;

    const url = new URL(window.location.href);
    const maxStepsParam = url.searchParams.get("maxSteps");
    this.defines.MAX_STEPS = maxStepsParam ? parseInt(maxStepsParam) : 600;

    this.uniforms.uInputFirstDerivative.value = firstDerivative;
    this.uniforms.uInputSecondDerivative.value = secondDerivative;
    this.uniforms.uOutputFirstDerivative.value = outputDerivative;
    this.uniforms.uLAO.value = lao;

    // TODO: Dispose
    reaction(
      () =>
        editor.activeDocument?.layers.filter((layer) => layer.kind === "image")
          .length || 0,
      (layerCount: number) => {
        this.fragmentShader = composeLayeredShader(
          volumeFragmentShader,
          layerCount,
        );
        this.needsUpdate = true;
      },
    );
  }
}
