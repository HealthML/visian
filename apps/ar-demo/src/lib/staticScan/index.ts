import * as THREE from "three";

import preGeneratedGeometries from "./preGeneratedGeometries";

export const voxelCount = new THREE.Vector3(170, 244, 216);

// in meters
export const voxelDimensions = new THREE.Vector3(
  0.0009999985694885254,
  0.001,
  0.001,
);

export const scanSize = new THREE.Vector3()
  .copy(voxelCount)
  .multiply(voxelDimensions);

export const atlasGrid = new THREE.Vector2(18, 12);

export const getConnectedStructureGeometries: () => Promise<THREE.BufferGeometry>[] = () => {
  const geometryLoader = new THREE.BufferGeometryLoader();

  return Array.from({ length: preGeneratedGeometries.length }, (_, i) => i).map(
    (geometryIndex) =>
      new Promise<THREE.BufferGeometry>((resolve) => {
        geometryLoader.load(
          preGeneratedGeometries[geometryIndex],
          (geometry) => {
            resolve(geometry.scale(0.001, 0.001, 0.001));
          },
          undefined,
          () => {
            resolve(new THREE.BufferGeometry());
          },
        );
      }),
  );
};
