import { IDisposer } from "@visian/utils";
import { autorun, reaction } from "mobx";
import * as THREE from "three";
import tc from "tinycolor2";

import { VolumeRendererModel } from "../../../../models";
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
  private disposers: IDisposer[] = [];

  constructor(
    firstDerivativeTexture: THREE.Texture,
    secondDerivativeTexture: THREE.Texture,
    private previousFrameTexture: THREE.Texture,
    volumeRendererModel: VolumeRendererModel,
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

    this.disposers.push(
      reaction(
        () => volumeRendererModel.image,
        (atlas?: TextureAtlas) => {
          if (!atlas) return;

          this.uniforms.uVolume.value = atlas.getTexture();
          this.uniforms.uVoxelCount.value = atlas.voxelCount;
          this.uniforms.uAtlasGrid.value = atlas.atlasGrid;
          this.uniforms.uStepSize.value = getStepSize(atlas);
        },
      ),
      reaction(
        () => volumeRendererModel.focus,
        (atlas?: TextureAtlas) => {
          if (atlas) {
            this.uniforms.uFocus.value = atlas.getTexture();
          } else {
            this.uniforms.uFocus.value = null;
          }
        },
      ),
      autorun(() => {
        this.uniforms.uTransferFunction.value =
          volumeRendererModel.transferFunction.type;
      }),
      autorun(() => {
        this.uniforms.uOpacity.value = volumeRendererModel.imageOpacity;
      }),
      autorun(() => {
        this.uniforms.uContextOpacity.value =
          volumeRendererModel.contextOpacity;
      }),
      autorun(() => {
        this.uniforms.uLimitLow.value = volumeRendererModel.rangeLimits[0];
        this.uniforms.uLimitHigh.value = volumeRendererModel.rangeLimits[1];
      }),
      autorun(() => {
        this.uniforms.uConeAngle.value = volumeRendererModel.cutAwayConeAngle;
      }),
      autorun(() => {
        this.uniforms.uUseFocus.value = volumeRendererModel.useFocusVolume;
      }),
      autorun(() => {
        const color = tc(volumeRendererModel.focusColor).toRgb();
        this.uniforms.uFocusColor.value = [
          color.r / 255,
          color.g / 255,
          color.b / 255,
          color.a,
        ];
      }),
      autorun(() => {
        this.uniforms.uCustomTFTexture.value =
          volumeRendererModel.customTFTexture;
      }),
    );
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
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
