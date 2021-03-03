import * as THREE from "three";

import volumeFragmentShader from "./shader/volume.frag.glsl";
import volumeVertexShader from "./shader/volume.vert.glsl";

import type Volume from "./volume";

class VolumeMaterial extends THREE.ShaderMaterial {
  private workingMatrix4 = new THREE.Matrix4();

  constructor() {
    super({
      vertexShader: volumeVertexShader,
      fragmentShader: volumeFragmentShader,
      uniforms: {
        uVolume: { value: null },
        uVoxelCount: {
          value: [1, 1, 1],
        },
        uAtlasGrid: { value: [1, 1] },
        uStepSize: { value: 1 },
        uCameraPosition: { value: new THREE.Vector3() },
      },
    });

    // Always render the back faces.
    this.side = THREE.BackSide;
  }

  public set texture(texture: THREE.DataTexture) {
    this.uniforms.uVolume.value = texture;
  }
  public set voxelCount(voxelCount: THREE.Vector3) {
    this.uniforms.uVoxelCount.value = voxelCount;
  }
  public set atlasGrid(atlasGrid: THREE.Vector2) {
    this.uniforms.uAtlasGrid.value = atlasGrid;
  }
  public set stepSize(stepSize: number) {
    this.uniforms.uStepSize.value = stepSize;
  }

  /**
   * Updates the `uCameraPosition` uniform.
   *
   * @see https://davidpeicho.github.io/blog/cloud-raymarching-walkthrough-part1/
   */
  public updateCameraPosition(volumeObject: Volume, camera: THREE.Camera) {
    camera.getWorldPosition(this.uniforms.uCameraPosition.value);
    this.uniforms.uCameraPosition.value.applyMatrix4(
      this.workingMatrix4.copy(volumeObject.matrixWorld).invert(),
    );
  }
}

export default VolumeMaterial;
