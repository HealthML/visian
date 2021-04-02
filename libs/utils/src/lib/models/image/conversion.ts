import { Vector } from "@visian/utils";

/**
 * Returns the texture atlas index for the given voxel coordinates.
 *
 * @param voxel The coordinates of the voxel.
 * @param voxelCount The number of voxels in each direction.
 * @param atlasGrid The number of slices in the texture atlas in x/y direction.
 * @returns The index of the given voxel in an atlas with the given properties.
 */
export const getAtlasIndexFor = (
  voxel: Vector,
  voxelCount: Vector,
  atlasGrid: Vector,
) => {
  const textureAtlasWidth = atlasGrid.x * voxelCount.x;
  const sliceColumn = voxel.z % atlasGrid.x;
  const sliceRow = Math.floor(voxel.z / atlasGrid.x);
  const zOffset =
    sliceRow * voxelCount.y * textureAtlasWidth + sliceColumn * voxelCount.x;
  const yOffset = voxel.y * textureAtlasWidth;
  const xOffset = voxelCount.x - 1 - voxel.x;
  return xOffset + yOffset + zOffset;
};
