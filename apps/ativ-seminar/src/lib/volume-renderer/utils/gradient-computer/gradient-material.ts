import { IDisposer } from "@visian/utils";
import { reaction } from "mobx";
import * as THREE from "three";

import { VolumeRendererModel } from "../../../../models";
import { TextureAtlas } from "../../../texture-atlas";
import gradientFragmentShader from "../../shader/gradient/gradient.frag.glsl";
import gradientVertexShader from "../../shader/gradient/gradient.vert.glsl";
import {
  atlasInfoUniforms,
  commonUniforms,
  imageInfoUniforms,
  transferFunctionsUniforms,
} from "../../uniforms";
import { getStepSize } from "../step-size";

export enum GradientMode {
  Output = 0,
  First = 1,
  Second = 2,
}

export class GradientMaterial extends THREE.ShaderMaterial {
  private disposers: IDisposer[] = [];

  constructor(
    private firstDerivativeTexture: THREE.Texture,
    private secondDerivativeTexture: THREE.Texture,
    volumeRendererModel: VolumeRendererModel,
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

    this.disposers.push(
      reaction(
        () => volumeRendererModel.image,
        (atlas?: TextureAtlas) => {
          if (!atlas) return;

          this.uniforms.uVolume.value = atlas.getTexture();
          this.uniforms.uVoxelCount.value = atlas.voxelCount;
          this.uniforms.uAtlasGrid.value = atlas.atlasGrid;
          this.uniforms.uStepSize.value = getStepSize(atlas);

          this.uniforms.uUseFocus.value = false;
        },
      ),
      reaction(
        () => volumeRendererModel.focus,
        (atlas?: TextureAtlas) => {
          if (atlas) {
            this.uniforms.uFocus.value = atlas.getTexture();
            this.uniforms.uUseFocus.value = true;
          } else {
            this.uniforms.uFocus.value = null;
            this.uniforms.uUseFocus.value = false;
          }
        },
      ),
    );
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
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
