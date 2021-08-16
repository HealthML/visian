import type * as THREE from "three";

export const getWebGLSizeFromCamera = (camera: THREE.OrthographicCamera) => ({
  x: camera.right - camera.left,
  y: camera.top - camera.bottom,
});
