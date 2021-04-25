import { Vector } from "@visian/utils";
import * as THREE from "three";

export class VoxelCamera extends THREE.OrthographicCamera {
  constructor() {
    super(-0.5, 1, 1, -0.5, 0, 10);
  }

  public setAtlasSize(size: Vector) {
    this.right = size.x - 0.5;
    this.top = size.y - 0.5;
    this.updateProjectionMatrix();
  }
}
