import * as THREE from "three";

export interface IXRManager {
  animate(): void;

  isInXR(): boolean;
  enterXR(): void;
  exitXR(): void;
}

export interface IVolumeRenderer {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  xr: IXRManager;
  volume: THREE.Mesh;

  animate(): void;

  updateCameraPosition(): void;
  resetScene(hardReset?: boolean): void;
  resize(): void;
  lazyRender(updateLighting?: boolean): void;
}
