import { Vector } from "@visian/utils";
import * as THREE from "three";

import { SliceQuadMaterial } from "./slice-quad-material";

export class SliceQuad extends THREE.Mesh {
  public readonly camera: THREE.Camera;

  private currentSliceNumber = 0;

  constructor(texture: THREE.Texture, private atlasGrid: Vector) {
    super(
      new THREE.PlaneBufferGeometry().translate(0.5, 0.5, 0),
      new SliceQuadMaterial(texture),
    );

    // In camera space, every slice in a 1 by 1 quad.
    this.camera = new THREE.OrthographicCamera(
      0,
      atlasGrid.x,
      atlasGrid.y,
      0,
      0,
      10,
    );
  }

  public positionForSlice(slice: number) {
    if (slice === this.currentSliceNumber) return;

    const x = slice % this.atlasGrid.x;
    const y = Math.floor(slice / this.atlasGrid.x);
    this.position.set(x, y, 0);

    this.currentSliceNumber = slice;
  }
}
