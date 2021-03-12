import * as THREE from "three";

import { TextureAtlas } from "./utils";
import VolumeMaterial from "./volume-material";

/** A volume domain. */
class Volume extends THREE.Mesh {
  constructor() {
    super(new THREE.BoxGeometry(1, 1, 1), new VolumeMaterial());

    // The coordinate system in medical images usually has the object
    // laying on the side. We want it to be upright.
    this.rotateX(-Math.PI / 2);
  }

  /** Updates the rendered image. */
  public setAtlas(atlas: TextureAtlas, renderer: THREE.WebGLRenderer) {
    (this.material as VolumeMaterial).setAtlas(atlas, renderer);

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
}

export default Volume;
