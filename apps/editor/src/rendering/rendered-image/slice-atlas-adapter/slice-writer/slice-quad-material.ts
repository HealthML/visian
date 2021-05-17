import * as THREE from "three";

export class SliceQuadMaterial extends THREE.MeshBasicMaterial {
  constructor(texture: THREE.Texture) {
    super({ map: texture });
  }

  public setTexture(texture: THREE.Texture) {
    this.map = texture;
  }
}
