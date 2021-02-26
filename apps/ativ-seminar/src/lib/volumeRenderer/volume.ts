import * as THREE from "three";

class Volume extends THREE.Mesh {
  constructor() {
    super(new THREE.BoxBufferGeometry(1, 1, 1), new THREE.MeshNormalMaterial());
  }
}

export default Volume;
