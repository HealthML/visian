import { Vector } from "@visian/utils";
import * as THREE from "three";

import { voxelFragmentShader, voxelVertexShader } from "../shaders";

export class VoxelMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: voxelVertexShader,
      fragmentShader: voxelFragmentShader,
      uniforms: {
        uVoxelCount: { value: new THREE.Vector3() },
        uAtlasGrid: { value: new THREE.Vector2() },
      },
    });
  }

  public setAtlasGrid(grid: Vector) {
    this.uniforms.uAtlasGrid.value.copy(grid);
  }

  public setVoxelCount(voxelCount: Vector) {
    this.uniforms.uVoxelCount.value.copy(voxelCount);
  }
}

export default VoxelMaterial;
