import * as THREE from "three";

export interface RenderParams {
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  scene: THREE.Scene;
}

export type RenderSubject = RenderParams | THREE.Material;
