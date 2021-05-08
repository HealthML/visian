import { autorun, IReactionDisposer, reaction } from "mobx";
import * as THREE from "three";
import tc from "tinycolor2";

import { TextureAtlas } from "../texture-atlas";
import { IDisposable } from "../types";
import volumeFragmentShader from "./shader/volume/volume.frag.glsl";
import volumeVertexShader from "./shader/volume/volume.vert.glsl";
import {
  atlasInfoUniforms,
  commonUniforms,
  imageInfoUniforms,
  opacityUniforms,
  transferFunctionsUniforms,
} from "./uniforms";
import { lightingUniforms } from "./uniforms/lighting";
import { getStepSize } from "./utils";

import type VolumeRenderer from "./volume-renderer";
/** A volume domain material. */
class VolumeMaterial extends THREE.ShaderMaterial implements IDisposable {
  protected reactionDisposers: IReactionDisposer[] = [];

  constructor(
    protected volumeRenderer: VolumeRenderer,
    firstDerivative: THREE.Texture,
    secondDerivative: THREE.Texture,
    outputDerivative: THREE.Texture,
    lao: THREE.Texture,
  ) {
    super({
      vertexShader: volumeVertexShader,
      fragmentShader: volumeFragmentShader,
      uniforms: THREE.UniformsUtils.merge([
        {
          uOutputFirstDerivative: { value: null },
          uLAO: { value: null },
        },
        opacityUniforms,
        commonUniforms,
        atlasInfoUniforms,
        imageInfoUniforms,
        transferFunctionsUniforms,
        lightingUniforms,
      ]),
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

    this.reactionDisposers.push(
      autorun(() => {
        this.uniforms.uUseFocus.value =
          volumeRenderer.model.shouldUseFocusVolume;
      }),
      autorun(() => {
        const color = tc(volumeRenderer.model.focusColor).toRgb();
        this.uniforms.uFocusColor.value = [
          color.r / 255,
          color.g / 255,
          color.b / 255,
          color.a,
        ];
      }),
      autorun(() => {
        this.uniforms.uTransferFunction.value =
          volumeRenderer.model.transferFunction.type;
      }),
      autorun(() => {
        this.uniforms.uOpacity.value = volumeRenderer.model.imageOpacity;
      }),
      autorun(() => {
        this.uniforms.uContextOpacity.value =
          volumeRenderer.model.contextOpacity;
      }),
      autorun(() => {
        this.uniforms.uLimitLow.value = volumeRenderer.model.rangeLimits[0];
        this.uniforms.uLimitHigh.value = volumeRenderer.model.rangeLimits[1];
      }),
      autorun(() => {
        this.uniforms.uConeAngle.value = volumeRenderer.model.cutAwayConeAngle;
      }),
      autorun(() => {
        this.uniforms.uLightingMode.value =
          volumeRenderer.model.lightingMode.type;
      }),
      autorun(() => {
        this.uniforms.uLaoIntensity.value = volumeRenderer.model.laoIntensity;
      }),
      autorun(() => {
        this.uniforms.uCustomTFTexture.value =
          volumeRenderer.model.customTFTexture;
      }),
      reaction(
        () => volumeRenderer.model.image,
        (atlas?: TextureAtlas) => {
          if (!atlas) return;

          this.uniforms.uVolume.value = atlas.getTexture();
          this.uniforms.uVoxelCount.value = atlas.voxelCount;
          this.uniforms.uAtlasGrid.value = atlas.atlasGrid;
          this.uniforms.uStepSize.value = getStepSize(atlas);
        },
      ),
      reaction(
        () => volumeRenderer.model.focus,
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

  public setCameraPosition(position: THREE.Vector3) {
    this.uniforms.uCameraPosition.value = position;
  }

  public dispose() {
    this.reactionDisposers.forEach((disposer) => {
      disposer();
    });
  }
}

export default VolumeMaterial;
