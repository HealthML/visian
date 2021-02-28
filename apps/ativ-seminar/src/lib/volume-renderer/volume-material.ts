import * as THREE from "three";

import volumeFragmentShader from "./shader/volume.frag.glsl";
import volumeVertexShader from "./shader/volume.vert.glsl";

class VolumeMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: volumeVertexShader,
      fragmentShader: volumeFragmentShader,
      uniforms: {
        uVolume: { value: null },
        uVoxelCount: {
          value: [1, 1, 1],
        },
        uAtlasGrid: { value: [1, 1] },
      },
    });

    // Always render the back faces.
    this.side = THREE.BackSide;
  }

  public set texture(texture: THREE.DataTexture) {
    this.uniforms.uVolume.value = texture;
  }
  public set voxelCount(voxelCount: THREE.Vector3) {
    this.uniforms.uVoxelCount.value = voxelCount;
  }
  public set atlasGrid(atlasGrid: THREE.Vector2) {
    this.uniforms.uAtlasGrid.value = atlasGrid;
  }
}

export default VolumeMaterial;
