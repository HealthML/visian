import { IDisposer } from "@visian/utils";
import { autorun, reaction } from "mobx";
import * as THREE from "three";

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
