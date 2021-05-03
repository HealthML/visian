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
import { getStepSize, GradientComputer, LAOComputer } from "./utils";

import type Volume from "./volume";
import type VolumeRenderer from "./volume-renderer";
/** A volume domain material. */
class VolumeMaterial extends THREE.ShaderMaterial implements IDisposable {
  private workingMatrix4 = new THREE.Matrix4();

  protected reactionDisposers: IReactionDisposer[] = [];

  private gradientComputer: GradientComputer;
  private laoComputer: LAOComputer;

  constructor(
    protected volumeRenderer: VolumeRenderer,
    renderer: THREE.WebGLRenderer,
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

    this.gradientComputer = new GradientComputer(renderer, volumeRenderer);
    this.uniforms.uInputFirstDerivative.value = this.gradientComputer.getFirstDerivative();
    this.uniforms.uInputSecondDerivative.value = this.gradientComputer.getSecondDerivative();
    this.uniforms.uOutputFirstDerivative.value = this.gradientComputer.getOutputDerivative();

    this.laoComputer = new LAOComputer(
      renderer,
      volumeRenderer,
      this.gradientComputer.getFirstDerivative(),
      this.gradientComputer.getSecondDerivative(),
    );
    this.uniforms.uLAO.value = this.laoComputer.getLAOTexture();

    this.reactionDisposers.push(
      autorun(() => {
        this.uniforms.uUseFocus.value =
          volumeRenderer.state.shouldUseFocusVolume;
      }),
      autorun(() => {
        const color = tc(volumeRenderer.state.focusColor).toRgb();
        this.uniforms.uFocusColor.value = [
          color.r / 255,
          color.g / 255,
          color.b / 255,
          color.a,
        ];
      }),
      autorun(() => {
        this.uniforms.uTransferFunction.value =
          volumeRenderer.state.transferFunction.type;
      }),
      autorun(() => {
        this.uniforms.uOpacity.value = volumeRenderer.state.imageOpacity;
      }),
      autorun(() => {
        this.uniforms.uContextOpacity.value =
          volumeRenderer.state.contextOpacity;
      }),
      autorun(() => {
        this.uniforms.uLimitLow.value = volumeRenderer.state.rangeLimits[0];
        this.uniforms.uLimitHigh.value = volumeRenderer.state.rangeLimits[1];
      }),
      autorun(() => {
        this.uniforms.uConeAngle.value = volumeRenderer.state.cutAwayConeAngle;
      }),
      autorun(() => {
        this.uniforms.uLightingMode.value =
          volumeRenderer.state.lightingMode.type;
      }),
      autorun(() => {
        this.uniforms.uLaoIntensity.value = volumeRenderer.state.laoIntensity;
      }),
      autorun(() => {
        this.uniforms.uCustomTFTexture.value =
          volumeRenderer.state.customTFTexture;
      }),
      reaction(
        () => volumeRenderer.state.image,
        (atlas?: TextureAtlas) => {
          if (!atlas) return;

          this.uniforms.uVolume.value = atlas.getTexture();
          this.uniforms.uVoxelCount.value = atlas.voxelCount;
          this.uniforms.uAtlasGrid.value = atlas.atlasGrid;
          this.uniforms.uStepSize.value = getStepSize(atlas);

          this.laoComputer.setAtlas(atlas);
        },
      ),
      reaction(
        () => volumeRenderer.state.focus,
        (atlas?: TextureAtlas) => {
          if (atlas) {
            this.uniforms.uFocus.value = atlas.getTexture();
          } else {
            this.uniforms.uFocus.value = null;
          }

          this.laoComputer.setFocusAtlas(atlas);
        },
      ),
    );
  }

  public tick() {
    this.gradientComputer.tick();
    this.laoComputer.tick();
  }

  /**
   * Updates the `uCameraPosition` uniform.
   *
   * @see https://davidpeicho.github.io/blog/cloud-raymarching-walkthrough-part1/
   */
  public updateCameraPosition(volumeObject: Volume, camera: THREE.Camera) {
    this.uniforms.uCameraPosition.value.setFromMatrixPosition(
      camera.matrixWorld,
    );
    this.uniforms.uCameraPosition.value.applyMatrix4(
      this.workingMatrix4.copy(volumeObject.matrixWorld).invert(),
    );

    this.gradientComputer.setCameraPosition(
      this.uniforms.uCameraPosition.value,
    );
    this.laoComputer.setCameraPosition(this.uniforms.uCameraPosition.value);
  }

  public dispose() {
    this.reactionDisposers.forEach((disposer) => {
      disposer();
    });
    this.gradientComputer.dispose();
    this.laoComputer.dispose();
  }
}

export default VolumeMaterial;
