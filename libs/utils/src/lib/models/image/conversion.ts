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
  components: number,
  voxelCount: Vector,
  inverted: { x: boolean; y: boolean; z: boolean },
  atlasSize: Vector,
  atlasGrid: Vector,
) => {
  const actualVoxel = new Vector(
    [
      inverted.x ? voxelCount.x - (voxel.x + 1) : voxel.x,
      inverted.y ? voxelCount.y - (voxel.y + 1) : voxel.y,
      inverted.z ? voxelCount.z - (voxel.z + 1) : voxel.z,
    ],
    false,
  );

  const sliceOffset = new Vector(
    [
      (actualVoxel.z % atlasGrid.x) * voxelCount.x,
      Math.floor(actualVoxel.z / atlasGrid.x) * voxelCount.y,
    ],
    false,
  );

  return (
    components *
      ((sliceOffset.y + actualVoxel.y) * atlasSize.x +
        sliceOffset.x +
        actualVoxel.x) +
    (voxel.size > 3 ? voxel.w : 0)
  );
};
