import * as THREE from "three";

import { TextureAtlas } from "./utils";
import VolumeMaterial from "./volume-material";

/** A volume domain. */
class Volume extends THREE.Mesh {
  constructor() {
    super(new THREE.BoxGeometry(1, 1, 1), new VolumeMaterial());

    // Keep the geometry a 1 by 1 by 1 box and use this
    // to scale according to the real volume dimensions.
    this.scale.set(2, 2, 2);
    this.rotateX(-Math.PI / 2);
  }

  /** Updates the rendered image. */
  public setAtlas(atlas: TextureAtlas, renderer: THREE.WebGLRenderer) {
    (this.material as VolumeMaterial).setAtlas(atlas, renderer);

    this.scale.copy(
      atlas.voxelCount
        .clone()
        .multiply(atlas.voxelSpacing)
        .multiplyScalar(0.01),
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
