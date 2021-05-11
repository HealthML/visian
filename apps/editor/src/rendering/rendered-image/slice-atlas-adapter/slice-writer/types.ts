import * as THREE from "three";

export abstract class SliceScene extends THREE.Scene {
  abstract setOverrideTexture(texture?: THREE.Texture): void;
}
