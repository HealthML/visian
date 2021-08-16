import { IEditor } from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { reaction } from "mobx";
import * as THREE from "three";

import {
  composeLayeredShader,
  volumeFragmentShader,
  volumeVertexShader,
} from "../shaders";
import { SharedUniforms } from "./utils";

/** A volume domain material. */
export class VolumeMaterial
  extends THREE.ShaderMaterial
  implements IDisposable {
  private disposers: IDisposer[] = [];

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
        uUseRayDithering: { value: true },
        uDepthPass: { value: null },
        uDepthSize: { value: [1, 1] },
        uCameraNear: { value: 0 },
        uCameraFar: { value: 1 },
      },
      defines: {},
      transparent: true,
      depthTest: true,
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

    this.disposers.push(
      reaction(
        () => editor.volumeRenderer?.renderedImageLayerCount || 1,
        (layerCount: number) => {
          this.fragmentShader = composeLayeredShader(
            volumeFragmentShader,
            layerCount,
          );
          this.needsUpdate = true;
        },
        { fireImmediately: true },
      ),
    );
  }

  public setVolumetricOcclusion(value: boolean) {
    this.depthTest = !value;
    if (value) {
      this.defines.VOLUMETRIC_OCCLUSION = "";
    } else {
      delete this.defines.VOLUMETRIC_OCCLUSION;
    }
    this.needsUpdate = true;
  }

  public setUseRayDithering(value: boolean) {
    this.uniforms.uUseRayDithering.value = value;
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }
}
