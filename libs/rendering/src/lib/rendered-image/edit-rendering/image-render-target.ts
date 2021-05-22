import { Vector } from "@visian/utils";
import * as THREE from "three";

export class ImageRenderTarget extends THREE.WebGLRenderTarget {
  constructor(size: Vector) {
    super(size.x, size.y, {
      magFilter: THREE.NearestFilter,
      minFilter: THREE.NearestFilter,
    });
  }
}
