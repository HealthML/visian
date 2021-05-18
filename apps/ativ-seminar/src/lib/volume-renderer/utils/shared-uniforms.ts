import { IDisposable, IDisposer } from "@visian/utils";
import { autorun, reaction } from "mobx";
import * as THREE from "three";
import tc from "tinycolor2";

import { VolumeRendererModel } from "../../../models";
import {
  opacityUniforms,
  commonUniforms,
  atlasInfoUniforms,
  imageInfoUniforms,
  transferFunctionsUniforms,
  getStepSize,
} from "..";
import { TextureAtlas } from "../../texture-atlas";
import { lightingUniforms } from "../uniforms/lighting";

export class SharedUniforms implements IDisposable {
  public uniforms: { [uniform: string]: THREE.IUniform };

  private disposers: IDisposer[] = [];

  constructor(volumeRendererModel: VolumeRendererModel) {
    this.uniforms = THREE.UniformsUtils.merge([
      opacityUniforms,
      commonUniforms,
      atlasInfoUniforms,
      imageInfoUniforms,
      transferFunctionsUniforms,
      lightingUniforms,
    ]);

    this.disposers.push(
      autorun(() => {
        this.uniforms.uCameraPosition.value = volumeRendererModel.cameraPosition.toArray();
      }),
      autorun(() => {
        this.uniforms.uConeDirection.value = volumeRendererModel.cutAwayConeDirection.toArray();
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
        [
          this.uniforms.uLimitLow.value,
          this.uniforms.uLimitHigh.value,
        ] = volumeRendererModel.rangeLimits;
      }),
      autorun(() => {
        this.uniforms.uConeAngle.value = volumeRendererModel.cutAwayConeAngle;
      }),
      autorun(() => {
        this.uniforms.uLightingMode.value =
          volumeRendererModel.lightingMode.type;
      }),
      autorun(() => {
        this.uniforms.uLaoIntensity.value = volumeRendererModel.laoIntensity;
      }),
      autorun(() => {
        this.uniforms.uCustomTFTexture.value =
          volumeRendererModel.customTFTexture;
      }),
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
    );
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
  }
}
