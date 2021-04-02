import { Vector } from "../vector";
import { getOrthogonalAxis, getPlaneAxes, ViewType } from "../view-types";
import { getAtlasIndexFor } from "./conversion";

/**
 * Iterates over a particular slice in the plane of the given view type
 * until the predicate returns true.
 *
 * @param atlas The atlas data to iterate over.
 * @param viewType The view's type, dictating the orientation of the search plane.
 * @param slice The index of the slice to search.
 * @param predicate The predicate.
 * @param voxelCount The number of voxels in each direction.
 * @param atlasGrid The number of slices in the texture atlas in x/y direction.
 * @returns The voxel coordinates and value for which the predicate first returned true.
 */
export const findVoxelInSlice = (
  atlas: Uint8Array | undefined,
  viewType: ViewType,
  slice: number,
  predicate: (
    voxel: { x: number; y: number; z: number },
    value: number,
  ) => boolean | undefined | void,
  components: number,
  voxelCount: Vector,
  axisInversion: { x: boolean; y: boolean; z: boolean },
  atlasSize: Vector,
  atlasGrid: Vector,
) => {
  if (!atlas) return;

  const fixedCoordinate = getOrthogonalAxis(viewType);
  const [horizontalAxis, verticalAxis] = getPlaneAxes(viewType);
  const horizontalCount = voxelCount[horizontalAxis];
  const verticalCount = voxelCount[verticalAxis];
  for (let vertical = 0; vertical < verticalCount; vertical++) {
    for (let horizontal = 0; horizontal < horizontalCount; horizontal++) {
      const voxel = Vector.fromObject(
        {
          [fixedCoordinate]: slice,
          [horizontalAxis]: horizontal,
          [verticalAxis]: vertical,
        } as { x: number; y: number; z: number },
        false,
      );

      const value =
        atlas[
          getAtlasIndexFor(
            voxel,
            components,
            voxelCount,
            axisInversion,
            atlasSize,
            atlasGrid,
          )
        ];

      if (predicate(voxel, value)) {
        return { voxel, value };
      }
    }
  }
};
