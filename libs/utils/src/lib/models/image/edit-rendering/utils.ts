import * as THREE from "three";

import { ScreenAlignedQuad } from "../../../rendering";
import { VoxelWithValue } from "../../../types";

export const copyToRenderTarget = (
  source: ScreenAlignedQuad,
  target: THREE.WebGLRenderTarget,
  renderer: THREE.WebGLRenderer,
) => {
  const previousRenderTarget = renderer.getRenderTarget();
  renderer.setRenderTarget(target);

  const previousAutoClear = renderer.autoClear;
  renderer.autoClear = true;

  source.renderWith(renderer);

  renderer.autoClear = previousAutoClear;
  renderer.setRenderTarget(previousRenderTarget);
};

export const renderVoxels = (
  voxels: THREE.Scene,
  camera: THREE.Camera,
  target: THREE.WebGLRenderTarget,
  renderer: THREE.WebGLRenderer,
) => {
  const previousRenderTarget = renderer.getRenderTarget();
  renderer.setRenderTarget(target);

  const previousAutoClear = renderer.autoClear;
  renderer.autoClear = false;

  renderer.render(voxels, camera);

  renderer.autoClear = previousAutoClear;
  renderer.setRenderTarget(previousRenderTarget);
};

export const updateVoxelGeometry = (
  voxelsToRender: VoxelWithValue[],
  voxelGeometry: THREE.BufferGeometry,
) => {
  const vertices: number[] = [];
  voxelsToRender.forEach((voxel) => {
    vertices.push(voxel.x, voxel.y, voxel.z);
  });
  voxelGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3),
  );

  const colors: number[] = [];
  voxelsToRender.forEach((voxel) => {
    colors.push(voxel.value, voxel.value, voxel.value);
  });
  voxelGeometry.setAttribute(
    "color",
    new THREE.Uint8BufferAttribute(colors, 3),
  );
};
