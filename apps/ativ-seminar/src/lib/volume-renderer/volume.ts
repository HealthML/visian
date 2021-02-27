import * as THREE from "three";

import VolumeMaterial from "./volume-material";

class Volume extends THREE.Mesh {
  constructor() {
    super(new THREE.BoxBufferGeometry(1, 1, 1), new VolumeMaterial());
  }
}

export default Volume;
