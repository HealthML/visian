import * as THREE from "three";

import { Vector } from "../../../models/utils";
import { ViewType } from "../types";

export const getSpriteSizes = (voxelCount: Vector, voxelSpacing: Vector) => {
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

export const getMaxSpriteSize = (voxelCount: Vector, voxelSpacing: Vector) => {
  const [spriteWidths, spriteHeights] = getSpriteSizes(
    voxelCount,
    voxelSpacing,
  );

  return {
    x: Math.max(...spriteWidths),
    y: Math.max(...spriteHeights),
  };
};

export const getGeometrySizes = (voxelCount: Vector, voxelSpacing: Vector) => {
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
  voxelCount: Vector,
  voxelSpacing: Vector,
  viewType: ViewType,
) => {
  const [geometryWidths, geometryHeights] = getGeometrySizes(
    voxelCount,
    voxelSpacing,
  );
  return new THREE.Vector2(geometryWidths[viewType], geometryHeights[viewType]);
};
