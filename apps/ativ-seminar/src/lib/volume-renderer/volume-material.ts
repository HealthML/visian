import * as THREE from "three";

import volumeFragmentShader from "./shader/volume.frag.glsl";
import volumeVertexShader from "./shader/volume.vert.glsl";

class VolumeMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: volumeVertexShader,
      fragmentShader: volumeFragmentShader,
    });
  }
}

export default VolumeMaterial;
