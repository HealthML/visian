import { autorun, IReactionDisposer } from "mobx";
import * as THREE from "three";

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
import {
  getStepSize,
  GradientComputer,
  LAOComputer,
  TextureAtlas,
} from "./utils";

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
        this.uniforms.uTransferFunction.value =
          volumeRenderer.transferFunction.type;
      }),
      autorun(() => {
        this.uniforms.uOpacity.value = volumeRenderer.imageOpacity;
      }),
      autorun(() => {
        this.uniforms.uContextOpacity.value = volumeRenderer.contextOpacity;
      }),
      autorun(() => {
        this.uniforms.uLimitLow.value = volumeRenderer.rangeLimits[0];
        this.uniforms.uLimitHigh.value = volumeRenderer.rangeLimits[1];
      }),
      autorun(() => {
        this.uniforms.uConeAngle.value = volumeRenderer.cutAwayConeAngle;
      }),
      autorun(() => {
        this.uniforms.uLightingMode.value = volumeRenderer.lightingMode.type;
      }),
    );
  }

  public tick() {
    this.gradientComputer.tick();
    this.laoComputer.tick();
  }

  /** Updates the rendered atlas. */
  public setAtlas(atlas: TextureAtlas) {
    this.uniforms.uVolume.value = atlas.getTexture();
    this.uniforms.uVoxelCount.value = atlas.voxelCount;
    this.uniforms.uAtlasGrid.value = atlas.atlasGrid;
    this.uniforms.uStepSize.value = getStepSize(atlas);

    this.gradientComputer.setAtlas(atlas);
    this.laoComputer.setAtlas(atlas);

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

    this.gradientComputer.setFocusAtlas(atlas);
    this.laoComputer.setFocusAtlas(atlas);
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
