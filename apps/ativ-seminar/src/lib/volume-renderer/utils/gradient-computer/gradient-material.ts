import * as THREE from "three";

import { TextureAtlas } from "..";
import { TransferFunction } from "../..";
import gradientFragmentShader from "./shader/gradient.frag.glsl";
import gradientVertexShader from "./shader/gradient.vert.glsl";

export enum GradientMode {
  Output = 0,
  First = 1,
  Second = 2,
}

export class GradientMaterial extends THREE.ShaderMaterial {
  constructor(
    textureAtlas: TextureAtlas,
    private firstDerivativeTexture: THREE.Texture,
    private secondDerivativeTexture: THREE.Texture,
  ) {
    super({
      fragmentShader: gradientFragmentShader,
      vertexShader: gradientVertexShader,
      uniforms: {
        uVolume: { value: textureAtlas.getTexture() },
        uVoxelSpacing: { value: textureAtlas.voxelSpacing },
        uVoxelCount: { value: textureAtlas.voxelCount },
        uAtlasGrid: { value: textureAtlas.atlasGrid },
        uInputDimensions: { value: 1 },
        uGradientMode: { value: GradientMode.Output },

        uInputFirstDerivative: {
          value: firstDerivativeTexture,
        },
        uInputSecondDerivative: {
          value: secondDerivativeTexture,
        },
        uFocus: { value: null },
        uUseFocus: { value: false },
        uCameraPosition: { value: new THREE.Vector3() },
        uTransferFunction: { value: 0 },
        uConeAngle: { value: 1 },
        uContextOpacity: { value: 1 },
        uLimitLow: { value: 0 },
        uLimitHigh: { value: 1 },
      },
    });
  }

  public setGradientMode(mode: GradientMode) {
    this.uniforms.uGradientMode.value = mode;

    this.uniforms.uInputFirstDerivative.value =
      mode === GradientMode.First ? null : this.firstDerivativeTexture;

    this.uniforms.uInputSecondDerivative.value =
      mode === GradientMode.Second ? null : this.secondDerivativeTexture;
  }

  public setFocus(atlas?: TextureAtlas) {
    if (atlas) {
      this.uniforms.uFocus.value = atlas.getTexture();
      this.uniforms.uUseFocus.value = true;
    } else {
      this.uniforms.uFocus.value = null;
      this.uniforms.uUseFocus.value = false;
    }
  }

  public setCameraPosition(position: THREE.Vector3) {
    this.uniforms.uCameraPosition.value.copy(position);
  }

  public setTransferFunction(transferFunction: TransferFunction) {
    this.uniforms.uTransferFunction.value = transferFunction;
  }

  public setCutAwayConeAngle(radians: number) {
    this.uniforms.uConeAngle.value = radians;
  }

  public setContextOpacity(value: number) {
    this.uniforms.uContextOpacity.value = value;
  }

  public setRangeLimits(value: [number, number]) {
    this.uniforms.uLimitLow.value = value[0];
    this.uniforms.uLimitHigh.value = value[1];
  }
}

export default GradientMaterial;
