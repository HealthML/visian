import * as THREE from "three";

import { ViewType } from "../types";

export const getSpriteSizes = (
  voxelCount: THREE.Vector3,
  voxelSpacing: THREE.Vector3,
) => {
  const spriteWidths: number[] = [];
  spriteWidths[ViewType.Transverse] = voxelCount.x * voxelSpacing.x;
  spriteWidths[ViewType.Sagittal] = voxelCount.y * voxelSpacing.y;
  spriteWidths[ViewType.Coronal] = spriteWidths[ViewType.Transverse];

  const spriteHeights: number[] = [];
  spriteHeights[ViewType.Transverse] = voxelCount.y * voxelSpacing.y;
  spriteHeights[ViewType.Sagittal] = voxelCount.z * voxelSpacing.z;
  spriteHeights[ViewType.Coronal] = spriteHeights[ViewType.Sagittal];

  return [spriteWidths, spriteHeights];
};

export const getMaxSpriteSize = (
  voxelCount: THREE.Vector3,
  voxelSpacing: THREE.Vector3,
) => {
  const [spriteWidths, spriteHeights] = getSpriteSizes(
    voxelCount,
    voxelSpacing,
  );

  return {
    x: Math.max(...spriteWidths),
    y: Math.max(...spriteHeights),
  };
};

export const getGeometrySizes = (
  voxelCount: THREE.Vector3,
  voxelSpacing: THREE.Vector3,
) => {
  const maxSpriteSize = getMaxSpriteSize(voxelCount, voxelSpacing);
  const maxDimension = Math.max(maxSpriteSize.x, maxSpriteSize.y);

  const webGLToScanRatio = 2 / maxDimension;
  const [spriteWidths, spriteHeights] = getSpriteSizes(
    voxelCount,
    voxelSpacing,
  );

  const geometryWidths: number[] = [];
  spriteWidths.forEach((width, viewType) => {
    geometryWidths[viewType] = width * webGLToScanRatio;
  });

  const geometryHeights: number[] = [];
  spriteHeights.forEach((height, viewType) => {
    geometryHeights[viewType] = height * webGLToScanRatio;
  });

  return [geometryWidths, geometryHeights];
};

export const getGeometrySize = (
  voxelCount: THREE.Vector3,
  voxelSpacing: THREE.Vector3,
  viewType: ViewType,
) => {
  const [geometryWidths, geometryHeights] = getGeometrySizes(
    voxelCount,
    voxelSpacing,
  );
  return new THREE.Vector2(geometryWidths[viewType], geometryHeights[viewType]);
};
