import * as THREE from "three";

import { Voxel } from "../../types";

export const createLights = (voxelCount: Voxel) => {
  const lights: THREE.Light[] = [];

  lights.push(new THREE.AmbientLight(0xffffff, 0.2));
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, voxelCount.z + 10, 0);
  lights.push(new THREE.DirectionalLight(0xffffff, 0.4));
  lights.push(new THREE.HemisphereLight(0x222222, 0xffffff, 0.3));

  return [lights, [directionalLight.target]] as [
    THREE.Light[],
    THREE.Object3D[],
  ];
};

export const createCameraLight = (camera: THREE.Camera) => {
  const cameraLight = new THREE.DirectionalLight(0xffffff, 0.4);
  cameraLight.position.copy(camera.position);
  return cameraLight;
};
