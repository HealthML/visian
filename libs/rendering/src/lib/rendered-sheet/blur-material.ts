import * as THREE from "three";

export class BlurMaterial extends THREE.MeshPhysicalMaterial {
  constructor() {
    super({ transmission: 1, roughness: 0.75, ior: 1.49 });

    this.thickness = 0;
  }
}
