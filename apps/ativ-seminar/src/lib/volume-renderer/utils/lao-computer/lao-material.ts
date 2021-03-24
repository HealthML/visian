import * as THREE from "three";

import fragmentShader from "../../shader/lao/lao.frag.glsl";
import vertexShader from "../../shader/lao/lao.vert.glsl";
import {
  atlasInfoUniforms,
  commonUniforms,
  imageInfoUniforms,
  opacityUniforms,
  transferFunctionsUniforms,
} from "../../uniforms";
import { GradientComputer } from "../gradient-computer";
import { getStepSize } from "../step-size";
import TextureAtlas from "../texture-atlas";

export class LAOMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader,
      fragmentShader,
      uniforms: THREE.UniformsUtils.merge([
        opacityUniforms,
        commonUniforms,
        atlasInfoUniforms,
        imageInfoUniforms,
        transferFunctionsUniforms,
      ]),
    });
  }

  public setAtlas(atlas: TextureAtlas, gradientComputer: GradientComputer) {
    this.uniforms.uVolume.value = atlas.getTexture();
    this.uniforms.uVoxelCount.value = atlas.voxelCount;
    this.uniforms.uAtlasGrid.value = atlas.atlasGrid;
    this.uniforms.uStepSize.value = getStepSize(atlas);

    this.uniforms.uInputFirstDerivative.value = gradientComputer.getFirstDerivative();
    this.uniforms.uInputSecondDerivative.value = gradientComputer.getSecondDerivative();

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

  public setCameraPosition(position: THREE.Vector3) {
    this.uniforms.uCameraPosition.value.copy(position);
  }
}

export default LAOMaterial;
