import * as THREE from "three";

export class VoxelScene extends THREE.Scene {
  constructor(
    voxelGeometry: THREE.BufferGeometry,
    voxelMaterial: THREE.Material,
  ) {
    super();
    const points = new THREE.Points(voxelGeometry, voxelMaterial);
    points.frustumCulled = false;
    this.add(points);
  }
}
