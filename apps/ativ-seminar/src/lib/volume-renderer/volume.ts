import * as THREE from "three";

import { IDisposable } from "../types";
import { TextureAtlas } from "./utils";
import VolumeMaterial from "./volume-material";

import type VolumeRenderer from "./volume-renderer";

/** A volume domain. */
class Volume extends THREE.Mesh implements IDisposable {
  constructor(volumeRenderer: VolumeRenderer, renderer: THREE.WebGLRenderer) {
    super(
      new THREE.BoxGeometry(1, 1, 1),
      new VolumeMaterial(volumeRenderer, renderer),
    );

    // The coordinate system in medical images usually has the object
    // laying on the side. We want it to be upright.
    this.rotateX(-Math.PI / 2);
  }

  public tick() {
    (this.material as VolumeMaterial).tick();
  }

  /** Updates the rendered image. */
  public setAtlas(atlas: TextureAtlas) {
    (this.material as VolumeMaterial).setAtlas(atlas);

    this.scale.copy(
      atlas.voxelCount
        .clone()
        .multiply(atlas.voxelSpacing)
        .multiplyScalar(0.001),
    );
  }

  public setFocusAtlas(atlas?: TextureAtlas) {
    (this.material as VolumeMaterial).setFocusAtlas(atlas);
  }

  public updateCameraPosition(camera: THREE.Camera) {
    (this.material as VolumeMaterial).updateCameraPosition(this, camera);
  }

  public dispose() {
    (this.material as VolumeMaterial).dispose();
  }
}

export default Volume;
