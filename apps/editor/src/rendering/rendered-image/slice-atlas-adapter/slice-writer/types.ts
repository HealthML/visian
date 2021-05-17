import * as THREE from "three";

export interface SliceScene extends THREE.Scene {
  setOverrideTexture(texture?: THREE.Texture): void;
}
