import { Vector, VoxelWithValue } from "@visian/utils";
import * as THREE from "three";

import { VoxelCamera } from "./voxel-camera";
import VoxelMaterial from "./voxel-material";

export class Voxels extends THREE.Scene {
  private geometry = new THREE.BufferGeometry();
  private material: VoxelMaterial;

  public camera: VoxelCamera;

  constructor(atlasSize: Vector, atlasGrid: Vector, voxelCount: Vector) {
    super();

    this.material = new VoxelMaterial(atlasGrid, voxelCount);

    const points = new THREE.Points(this.geometry, this.material);
    points.frustumCulled = false;
    this.add(points);

    this.camera = new VoxelCamera(atlasSize);
  }

  public updateGeometry(voxels: (VoxelWithValue | VoxelWithValue[])[]) {
    const vertices: number[] = [];
    const colors: number[] = [];

    voxels.flat().forEach((voxel) => {
      vertices.push(voxel.x, voxel.y, voxel.z);
      colors.push(voxel.value, voxel.value, voxel.value);
    });

    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    this.geometry.setAttribute(
      "color",
      new THREE.Uint8BufferAttribute(colors, 3),
    );
  }
}
