import * as THREE from "three";

import { IDisposable } from "../types";
import volumeFragmentShader from "./shader/volume/volume.frag.glsl";
import volumeVertexShader from "./shader/volume/volume.vert.glsl";
import { SharedUniforms } from "./utils";

import type VolumeRenderer from "./volume-renderer";
/** A volume domain material. */
class VolumeMaterial extends THREE.ShaderMaterial implements IDisposable {
  constructor(
    protected volumeRenderer: VolumeRenderer,
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
  }
}

export default VolumeMaterial;
