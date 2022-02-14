import { IDisposable, Vector } from "@visian/utils";
import * as THREE from "three";

export interface IXRManager {
  animate(): void;

  isInXR(): boolean;
  enterXR(): void;
  exitXR(): void;
}

export interface IVolumeRenderer extends IDisposable {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  xr: IXRManager;
  volume: THREE.Mesh;

  animate(): void;

  updateCameraPosition(): void;
  resetScene(hardReset?: boolean): void;
  resize(): void;
  lazyRender(updateLighting?: boolean, updateGradients?: boolean): void;
  setVolumeSpaceCameraPosition(position: Vector): void;
}
