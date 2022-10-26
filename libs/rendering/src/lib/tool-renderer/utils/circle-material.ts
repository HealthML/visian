import * as THREE from "three";

import { circleFragmentShader, circleVertexShader } from "../../shaders";

export class CircleMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: circleVertexShader,
      fragmentShader: circleFragmentShader,
    });
  }
}
