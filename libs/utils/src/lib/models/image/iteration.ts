import {
  getAtlasGrid,
  getAtlasIndexFor,
  getAtlasSize,
  getScanVoxelFor,
} from "../../io";
import { Voxel } from "../../types";
import { Vector } from "../vector";
import { getOrthogonalAxis, getPlaneAxes, ViewType } from "../view-types";
import { Image } from "./image";

/**
 * Iterates over a particular slice in the plane of the given view type
 * until the predicate returns true.
 *
 * @param image The image.
 * @param viewType The view's type, dictating the orientation of the search plane.
 * @param slice The index of the slice to search.
 * @param predicate The predicate.
 * @param atlasSize The size of the texture atlas in pixels.
 * @param atlasGrid The number of slices in the texture atlas in x/y direction.
 * @returns The voxel coordinates, value, and index for which the predicate first returned true.
 */
export const findVoxelInSlice = (
  image: Pick<Image, "getAtlas" | "voxelComponents" | "voxelCount">,
  viewType: ViewType,
  slice: number,
  predicate: (
    voxel: Vector & Voxel,
    value: number,
    index: number,
  ) => boolean | undefined | void,
  atlasGrid = getAtlasGrid(image.voxelCount),
  atlasSize = getAtlasSize(image.voxelCount, atlasGrid),
) => {
  const atlas = image.getAtlas();
  const { voxelCount } = image;

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

      const index = getAtlasIndexFor(voxel, image, atlasGrid, atlasSize);
      const value = atlas[index];

      if (predicate(voxel, value, index)) {
        return { voxel, value, index };
      }
    }
  }
};

/**
 * Iterates over the given image's texture atlas until the predicate returns true.
 *
 * @param image The image.
 * @param predicate The predicate.
 * @param atlasSize The size of the texture atlas in pixels.
 * @param atlasGrid The number of slices in the texture atlas in x/y direction.
 * @returns The voxel coordinates, value, and index for which the predicate first returned true.
 */
export const findVoxelInAtlas = (
  image: Pick<Image, "getAtlas" | "voxelComponents" | "voxelCount">,
  predicate: (
    voxel: Vector & Voxel,
    value: number,
    index: number,
  ) => boolean | undefined | void,
  atlasGrid = getAtlasGrid(image.voxelCount),
  atlasSize = getAtlasSize(image.voxelCount, atlasGrid),
) => {
  const atlas = image.getAtlas();
  const atlasLength = atlas.length;

  for (let index = 0; index < atlasLength; index++) {
    const value = atlas[index];
    const voxel = getScanVoxelFor(index, image, atlasGrid, atlasSize);
    if (predicate(voxel, value, index)) {
      return { voxel, value, index };
    }
  }
};
