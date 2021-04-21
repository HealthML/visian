import * as THREE from "three";

import { Vector } from "../../vector";

export class VoxelCamera extends THREE.OrthographicCamera {
  constructor() {
    super(0, 1, 1, -1, 0, 10);
  }

  public setAtlasSize(size: Vector) {
    this.right = size.x;
    this.top = size.y - 1;
    this.updateProjectionMatrix();
  }
}
