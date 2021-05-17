import { Vector } from "@visian/utils";
import * as THREE from "three";

import { SliceQuadMaterial } from "./slice-quad-material";
import { SliceScene } from "./types";

/**
 * A represenation of a slice of a 3D image that can be rendered into a
 * texture atlas. The view type of the slice has to match the texture
 * atlas view type.
 */
export class SliceQuad extends THREE.Scene implements SliceScene {
  public readonly camera: THREE.Camera;

  private quad: THREE.Mesh;

  private currentSliceNumber = 0;

  constructor(private texture: THREE.Texture, private atlasGrid: Vector) {
    super();

    this.quad = new THREE.Mesh(
      new THREE.PlaneBufferGeometry().translate(0.5, 0.5, 0),
      new SliceQuadMaterial(texture),
    );
    this.add(this.quad);

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
    this.quad.position.set(x, y, 0);

    this.currentSliceNumber = slice;
  }

  public setOverrideTexture(texture?: THREE.Texture) {
    (this.quad.material as SliceQuadMaterial).setTexture(
      texture || this.texture,
    );
  }
}
