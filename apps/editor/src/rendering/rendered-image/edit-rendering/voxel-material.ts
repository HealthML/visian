import { Vector } from "@visian/utils";
import * as THREE from "three";

import { voxelFragmentShader, voxelVertexShader } from "../../shaders";

export class VoxelMaterial extends THREE.ShaderMaterial {
  constructor(atlasGrid: Vector, voxelCount: Vector) {
    super({
      vertexShader: voxelVertexShader,
      fragmentShader: voxelFragmentShader,
      uniforms: {
        uVoxelCount: { value: voxelCount.toArray() },
        uAtlasGrid: { value: atlasGrid.toArray() },
      },
    });
  }
}

export default VoxelMaterial;
