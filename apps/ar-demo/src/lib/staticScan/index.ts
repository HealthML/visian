import * as THREE from "three";

import { Pixel, Voxel } from "../types";
import preGeneratedGeometries from "./preGeneratedGeometries";

export const voxelCount: Voxel = {
  x: 170,
  y: 244,
  z: 216,
};

// in meters
export const voxelDimensions: Voxel = {
  // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
  x: 0.0009999985694885254,
  y: 0.001,
  z: 0.001,
};

export const scanSize = {
  x: voxelCount.x * voxelDimensions.x,
  y: voxelCount.y * voxelDimensions.y,
  z: voxelCount.z * voxelDimensions.z,
};

export const atlasGrid: Pixel = {
  x: 18,
  y: 12,
};

export const getConnectedStructureGeometries: () => Promise<THREE.BufferGeometry>[] =
  () => {
    const geometryLoader = new THREE.BufferGeometryLoader();

    return Array.from(
      { length: preGeneratedGeometries.length },
      (_, i) => i,
    ).map(
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
