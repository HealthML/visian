import { TypedArray } from "../../io";
import { Voxel } from "../../types";
import { Vector } from "../vector";
import { getOrthogonalAxis, getPlaneAxes, ViewType } from "../view-types";
import type { Image } from "./image";

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
  image: Pick<Image, "voxelComponents" | "voxelCount">,
  data: TypedArray,
  viewType: ViewType,
  slice: number,
  predicate: (
    voxel: Vector & Voxel,
    value: Vector,
    index: number,
  ) => boolean | undefined | void,
) => {
  const voxel = new Vector(3, false);
  const value = new Vector(image.voxelComponents, false);
  const fixedCoordinate = getOrthogonalAxis(viewType);
  const [horizontalAxis, verticalAxis] = getPlaneAxes(viewType);
  const horizontalCount = image.voxelCount[horizontalAxis];
  const verticalCount = image.voxelCount[verticalAxis];
  for (let vertical = 0; vertical < verticalCount; vertical++) {
    for (let horizontal = 0; horizontal < horizontalCount; horizontal++) {
      voxel.setComponent(fixedCoordinate, slice);
      voxel.setComponent(horizontalAxis, horizontal);
      voxel.setComponent(verticalAxis, vertical);

      const index =
        voxel.x +
        voxel.y * image.voxelCount.x +
        voxel.z * image.voxelCount.x * image.voxelCount.y;
      value.set(...data.slice(index, index + image.voxelComponents));

      if (predicate(voxel, value, index)) {
        return { voxel, value, index };
      }
    }
  }
};

/**
 * Iterates over the given image's texture data until the predicate returns true.
 *
 * @param image The image.
 * @param data The texture data.
 * @param predicate The predicate.
 * @returns The voxel coordinates, value, and index for which the predicate first returned true.
 */
export const findVoxelInData = (
  image: Pick<Image, "voxelComponents" | "voxelCount">,
  data: Uint8Array,
  predicate: (
    voxel: Vector & Voxel,
    value: Vector,
    index: number,
  ) => boolean | undefined | void,
) => {
  const value = new Vector(image.voxelComponents, false);
  const voxel = new Vector(3, false);

  const rowSize = image.voxelCount.x * image.voxelComponents;
  const sliceSize = rowSize * image.voxelCount.y;

  for (let z = 0; z < image.voxelCount.z; z++) {
    const zOffset = z * sliceSize;
    for (let y = 0; y < image.voxelCount.y; y++) {
      const yOffset = y * rowSize;
      for (let x = 0; x < image.voxelCount.x; x++) {
        const index = zOffset + yOffset + x;
        value.set(...data.slice(index, index + image.voxelComponents));
        voxel.set(x, y, z);
        if (predicate(voxel, value, index)) {
          return { voxel, value, index };
        }
      }
    }
  }
};

export const getVolume = (
  image: Pick<Image, "voxelSpacing" | "voxelCount" | "voxelComponents">,
  data: Uint8Array,
) => {
  let nonZeroVoxelCount = 0;
  findVoxelInData(image, data, (_, value) => {
    if (value.sum() > 0) {
      nonZeroVoxelCount++;
    }
  });
  return nonZeroVoxelCount * image.voxelSpacing.product();
};

export const getArea = (
  image: Pick<Image, "voxelSpacing" | "voxelCount" | "voxelComponents">,
  data: Uint8Array,
  viewType: ViewType,
  slice: number,
) => {
  let nonZeroVoxelCount = 0;
  findVoxelInSlice(image, data, viewType, slice, (_, value) => {
    if (value.sum() > 0) {
      nonZeroVoxelCount++;
    }
  });

  const [widthAxis, heightAxis] = getPlaneAxes(viewType);
  const pixelSize =
    image.voxelSpacing[widthAxis] * image.voxelSpacing[heightAxis];

  return nonZeroVoxelCount * pixelSize;
};

/**
 * Returns an array of boolean arrays that indicate for each slice and
 * `ViewType` if the slice is empty.
 */
export const getEmptySlices = (
  image: Pick<Image, "voxelCount" | "voxelComponents">,
  data: Uint8Array,
) => {
  const transverse = new Array<boolean>(
    image.voxelCount.getFromView(ViewType.Transverse),
  ).fill(true);
  const sagittal = new Array<boolean>(
    image.voxelCount.getFromView(ViewType.Sagittal),
  ).fill(true);
  const coronal = new Array<boolean>(
    image.voxelCount.getFromView(ViewType.Coronal),
  ).fill(true);

  findVoxelInData(image, data, (voxel, value) => {
    if (!value.sum()) return;
    transverse[voxel.getFromView(ViewType.Transverse)] = false;
    sagittal[voxel.getFromView(ViewType.Sagittal)] = false;
    coronal[voxel.getFromView(ViewType.Coronal)] = false;
  });

  const returnedArray: boolean[][] = [];
  returnedArray[ViewType.Transverse] = transverse;
  returnedArray[ViewType.Sagittal] = sagittal;
  returnedArray[ViewType.Coronal] = coronal;
  return returnedArray;
};

export const setSlice = (
  image: Pick<Image, "voxelComponents" | "voxelCount">,
  data: TypedArray,
  viewType: ViewType,
  slice: number,
  sliceData?: TypedArray,
) => {
  const [horizontalAxis, verticalAxis] = getPlaneAxes(viewType);
  const sliceWidth = image.voxelCount[horizontalAxis];

  findVoxelInSlice(
    {
      voxelComponents: image.voxelComponents,
      voxelCount: image.voxelCount.clone(false),
    },
    data,
    viewType,
    slice,
    (voxel, _, index) => {
      const sliceIndex =
        voxel[verticalAxis] * sliceWidth + voxel[horizontalAxis];
      data[index] = sliceData ? sliceData[sliceIndex] : 0;
    },
  );
};
