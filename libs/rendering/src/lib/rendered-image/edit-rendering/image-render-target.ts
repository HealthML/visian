import { Vector } from "@visian/utils";
import * as THREE from "three";

export class ImageRenderTarget extends THREE.WebGLRenderTarget {
  constructor(size: Vector, filter: THREE.TextureFilter) {
    super(size.x, size.y, {
      magFilter: filter,
      minFilter: filter,
    });
  }
}
