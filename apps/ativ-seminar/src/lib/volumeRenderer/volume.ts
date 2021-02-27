import * as THREE from "three";

import VolumeMaterial from "./volumeMaterial";

class Volume extends THREE.Mesh {
  constructor() {
    super(new THREE.BoxBufferGeometry(1, 1, 1), new VolumeMaterial());

    // Keep the geometry a 1 by 1 by 1 box and use this
    // to scale according to the real volume dimensions.
    this.scale.set(2, 2, 2);
  }
}

export default Volume;
