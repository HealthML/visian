import { Vector } from "@visian/utils";
import * as THREE from "three";

export class VoxelCamera extends THREE.OrthographicCamera {
  constructor(atlasSize: Vector) {
    super(-0.5, atlasSize.x - 0.5, atlasSize.y - 0.5, -0.5, 0, 10);
  }
}
