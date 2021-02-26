import * as THREE from "three";

import VolumeMaterial from "./volumeMaterial";

class Volume extends THREE.Mesh {
  constructor() {
    super(new THREE.BoxBufferGeometry(1, 1, 1), new VolumeMaterial());
  }
}

export default Volume;
