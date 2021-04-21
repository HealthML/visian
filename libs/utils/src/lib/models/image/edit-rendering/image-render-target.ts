import * as THREE from "three";

import { Vector } from "../../vector";

export class ImageRenderTarget extends THREE.WebGLRenderTarget {
  constructor(size: Vector) {
    super(size.x, size.y, {
      magFilter: THREE.NearestFilter,
      minFilter: THREE.NearestFilter,
    });
  }
}
