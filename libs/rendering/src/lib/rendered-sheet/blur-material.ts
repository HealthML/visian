import * as THREE from "three";

export class BlurMaterial extends THREE.MeshPhysicalMaterial {
  constructor(
    params: THREE.MeshPhysicalMaterialParameters & { thickness: number },
  ) {
    super(params);

    this.thickness = params.thickness;
  }
}
