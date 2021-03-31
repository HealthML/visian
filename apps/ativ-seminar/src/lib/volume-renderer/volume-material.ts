import { TextureAtlas } from "@visian/utils";
import { autorun, IReactionDisposer } from "mobx";
import * as THREE from "three";

import { IDisposable } from "../types";
import volumeFragmentShader from "./shader/volume.frag.glsl";
import volumeVertexShader from "./shader/volume.vert.glsl";
import { getStepSize, GradientComputer } from "./utils";

import type Volume from "./volume";
import type VolumeRenderer from "./volume-renderer";

/** A volume domain material. */
class VolumeMaterial extends THREE.ShaderMaterial implements IDisposable {
  private workingMatrix4 = new THREE.Matrix4();

  protected reactionDisposers: IReactionDisposer[] = [];

  constructor(protected renderer: VolumeRenderer) {
    super({
      vertexShader: volumeVertexShader,
      fragmentShader: volumeFragmentShader,
      uniforms: {
        uVolume: { value: null },
        uFirstDerivative: { value: null },
        uSecondDerivative: { value: null },
        uFocus: { value: null },
        uUseFocus: { value: false },
        uVoxelCount: {
          value: [1, 1, 1],
        },
        uAtlasGrid: { value: [1, 1] },
        uStepSize: { value: 1 },
        uCameraPosition: { value: new THREE.Vector3() },

        uOpacity: { value: 1 },
      },
    });

    // Always render the back faces.
    this.side = THREE.BackSide;

    this.reactionDisposers.push(
      autorun(() => {
        this.uniforms.uOpacity.value = renderer.imageOpacity;
      }),
    );
  }

  /** Updates the rendered atlas. */
  public setAtlas(atlas: TextureAtlas) {
    this.uniforms.uVolume.value = atlas.getTexture();
    this.uniforms.uVoxelCount.value = atlas.voxelCount;
    this.uniforms.uAtlasGrid.value = atlas.atlasGrid;
    this.uniforms.uStepSize.value = getStepSize(atlas);

    const gradientComputer = new GradientComputer(
      atlas,
      this.renderer.renderer,
    );
    this.uniforms.uFirstDerivative.value = gradientComputer.getFirstDerivative();
    this.uniforms.uSecondDerivative.value = gradientComputer.getSecondDerivative();

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
  }

  public dispose() {
    this.reactionDisposers.forEach((disposer) => {
      disposer();
    });
  }
}

export default VolumeMaterial;
