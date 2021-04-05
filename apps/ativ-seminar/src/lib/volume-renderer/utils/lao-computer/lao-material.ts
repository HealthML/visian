import * as THREE from "three";

import { TextureAtlas } from "../../../texture-atlas";
import fragmentShader from "../../shader/lao/lao.frag.glsl";
import vertexShader from "../../shader/lao/lao.vert.glsl";
import {
  atlasInfoUniforms,
  commonUniforms,
  imageInfoUniforms,
  opacityUniforms,
  transferFunctionsUniforms,
} from "../../uniforms";
import { getStepSize } from "../step-size";
import { totalLAORays } from "./lao-computer";
import { getLAODirectionTexture } from "./lao-directions";

export class LAOMaterial extends THREE.ShaderMaterial {
  constructor(
    firstDerivativeTexture: THREE.Texture,
    secondDerivativeTexture: THREE.Texture,
    private previousFrameTexture: THREE.Texture,
  ) {
    super({
      vertexShader,
      fragmentShader,
      uniforms: THREE.UniformsUtils.merge([
        opacityUniforms,
        commonUniforms,
        atlasInfoUniforms,
        imageInfoUniforms,
        transferFunctionsUniforms,
        {
          uPreviousFrame: { value: null },
          uDirections: { value: getLAODirectionTexture(totalLAORays) },
          uPreviousDirections: { value: 0 },
          uTotalDirections: { value: totalLAORays },
        },
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

  public setCameraPosition(position: THREE.Vector3) {
    this.uniforms.uCameraPosition.value.copy(position);
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
}

export default LAOMaterial;
