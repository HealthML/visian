import * as THREE from "three";

import gradientFragmentShader from "../../shader/gradient/gradient.frag.glsl";
import gradientVertexShader from "../../shader/gradient/gradient.vert.glsl";
import {
  atlasInfoUniforms,
  commonUniforms,
  imageInfoUniforms,
  transferFunctionsUniforms,
} from "../../uniforms";
import { getStepSize } from "../step-size";
import { TextureAtlas } from "../texture-atlas";

export enum GradientMode {
  Output = 0,
  First = 1,
  Second = 2,
}

export class GradientMaterial extends THREE.ShaderMaterial {
  constructor(
    private firstDerivativeTexture: THREE.Texture,
    private secondDerivativeTexture: THREE.Texture,
  ) {
    super({
      fragmentShader: gradientFragmentShader,
      vertexShader: gradientVertexShader,
      uniforms: THREE.UniformsUtils.merge([
        {
          uInputDimensions: { value: 1 },
          uGradientMode: { value: GradientMode.Output },
        },
        commonUniforms,
        atlasInfoUniforms,
        imageInfoUniforms,
        transferFunctionsUniforms,
      ]),
    });

    this.uniforms.uInputFirstDerivative.value = firstDerivativeTexture;
    this.uniforms.uInputSecondDerivative.value = secondDerivativeTexture;
  }

  public setAtlas(atlas: TextureAtlas) {
    this.uniforms.uVolume.value = atlas.getTexture();
    this.uniforms.uVoxelCount.value = atlas.voxelCount;
    this.uniforms.uAtlasGrid.value = atlas.atlasGrid;
    this.uniforms.uStepSize.value = getStepSize(atlas);

    this.uniforms.uUseFocus.value = false;
  }

  public setFocusAtlas(atlas?: TextureAtlas) {
    if (atlas) {
      this.uniforms.uFocus.value = atlas.getTexture();
      this.uniforms.uUseFocus.value = true;
    } else {
      this.uniforms.uFocus.value = null;
      this.uniforms.uUseFocus.value = false;
    }
  }

  public setGradientMode(mode: GradientMode) {
    this.uniforms.uGradientMode.value = mode;

    this.uniforms.uInputFirstDerivative.value =
      mode === GradientMode.First ? null : this.firstDerivativeTexture;

    this.uniforms.uInputSecondDerivative.value =
      mode === GradientMode.Second ? null : this.secondDerivativeTexture;
  }

  public setCameraPosition(position: THREE.Vector3) {
    this.uniforms.uCameraPosition.value.copy(position);
  }
}

export default GradientMaterial;
