import * as THREE from "three";

import { Vector } from "../../models/vector";
import { textureFormatForComponents } from "./utils";

import type { Image } from "../../models/image";
import type { TypedArray } from "../itk";
export type TextureAtlasMetadata<T extends TypedArray = TypedArray> = Pick<
  Image<T>,
  "voxelComponents" | "voxelCount"
>;

/**
 * Returns the optimal number of slices in x/y direction in the texture atlas.
 *
 * @param voxelCount The number of voxels in each direction.
 */
export const getAtlasGrid = (voxelCount: Vector) => {
  const atlasGridX = Math.ceil(
    Math.sqrt((voxelCount.z * voxelCount.y) / voxelCount.x),
  );
  return new Vector([atlasGridX, Math.ceil(voxelCount.z / atlasGridX)], false);
};

export const getAtlasSize = (
  voxelCount: Vector,
  atlasGrid = getAtlasGrid(voxelCount),
) => new Vector([voxelCount.x, voxelCount.y], false).multiply(atlasGrid);

export const convertDataArrayToAtlas = <T extends TypedArray = TypedArray>(
  data: T,
  image: TextureAtlasMetadata<T>,
  inPlaceAtlas?: T,
) => {
  const atlasGrid = getAtlasGrid(image.voxelCount);
  const atlasSize = getAtlasSize(image.voxelCount, atlasGrid);
  const atlas =
    inPlaceAtlas ||
    new (data.constructor as new (size: number) => T)(
      atlasSize.x * atlasSize.y * image.voxelComponents,
    );

  const sliceSize =
    image.voxelCount.x * image.voxelCount.y * image.voxelComponents;

  // TODO: Test if ordered read can improve performance here
  for (let z = 0; z < image.voxelCount.z; z++) {
    const dataZOffset = z * sliceSize;
    const sliceOffset = new THREE.Vector2(
      (z % atlasGrid.x) * image.voxelCount.x,
      Math.floor(z / atlasGrid.x) * image.voxelCount.y,
    );

    for (let y = 0; y < image.voxelCount.y; y++) {
      const atlasYOffset =
        (y + sliceOffset.y) * atlasSize.x * image.voxelComponents;
      const dataYOffset = y * image.voxelCount.x * image.voxelComponents;

      for (let x = 0; x < image.voxelCount.x; x++) {
        const atlasXOffset = (x + sliceOffset.x) * image.voxelComponents;
        const dataXOffset = x * image.voxelComponents;

        for (let c = 0; c < image.voxelComponents; c++) {
          atlas[atlasYOffset + atlasXOffset + c] =
            data[dataZOffset + dataYOffset + dataXOffset + c];
        }
      }
    }
  }

  // TODO: Implement 16+ bit support
  const maxValue = (atlas as Uint8Array).reduce(
    (a: number, b: number) => Math.max(a, b),
    0,
  );

  return new Uint8Array(
    atlas.map((value: number) =>
      Math.round((Math.max(0, value) / maxValue) * 255),
    ),
  );
};

export const getTextureFromAtlas = <T extends TypedArray = TypedArray>(
  image: Pick<Image<T>, "voxelComponents" | "voxelCount">,
  atlas: T,
  magFilter: THREE.TextureFilter = THREE.LinearFilter,
) => {
  const atlasGrid = getAtlasGrid(image.voxelCount);
  return new THREE.DataTexture(
    atlas,
    atlasGrid.x * image.voxelCount.x,
    atlasGrid.y * image.voxelCount.y,
    textureFormatForComponents(image.voxelComponents),
    undefined,
    undefined,
    undefined,
    undefined,
    magFilter,
  );
};

/**
 * Returns the texture atlas index for the given voxel coordinates.
 *
 * @param voxel The coordinates of the voxel. The w component specifies the component.
 * @param image The image.
 * @param atlasSize The size of the texture atlas in pixels.
 * @param atlasGrid The number of slices in the texture atlas in x/y direction.
 * @returns The index of the given voxel in an atlas with the given properties.
 */
export const getAtlasIndexFor = (
  voxel: Vector,
  image: Pick<Image, "voxelComponents" | "voxelCount">,
  atlasGrid = getAtlasGrid(image.voxelCount),
  atlasSize = getAtlasSize(image.voxelCount, atlasGrid),
) => {
  const sliceOffset = new Vector(
    [
      (voxel.z % atlasGrid.x) * image.voxelCount.x,
      Math.floor(voxel.z / atlasGrid.x) * image.voxelCount.y,
    ],
    false,
  );

  return (
    image.voxelComponents *
      ((sliceOffset.y + voxel.y) * atlasSize.x + sliceOffset.x + voxel.x) +
    (voxel.size > 3 ? voxel.w : 0)
  );
};

/**
 * Returns the texture atlas index for the given voxel coordinates.
 *
 * @param atlasIndex The texture atlas index of the voxel.
 * @param image The image.
 * @param atlasSize The size of the texture atlas in pixels.
 * @param atlasGrid The number of slices in the texture atlas in x/y direction.
 * @returns The index of the given voxel in an atlas with the given properties.
 */
export const getScanVoxelFor = (
  atlasIndex: number,
  image: Pick<Image, "voxelComponents" | "voxelCount">,
  atlasGrid = getAtlasGrid(image.voxelCount),
  atlasSize = getAtlasSize(image.voxelCount, atlasGrid),
  isObservable = false,
) => {
  const atlasX = atlasIndex % atlasSize.x;
  const atlasY = Math.floor(atlasIndex / atlasSize.x);
  const sliceColumn = Math.floor(atlasX / image.voxelCount.x);
  const sliceRow = Math.floor(atlasY / image.voxelCount.y);
  return new Vector(
    [
      atlasX % image.voxelCount.x,
      atlasY % image.voxelCount.y,
      sliceColumn + sliceRow * atlasGrid.x,
    ],
    isObservable,
  );
};

export const convertAtlasToDataArray = <T extends TypedArray = TypedArray>(
  atlas: Uint8Array,
  image: TextureAtlasMetadata<T>,
  inPlaceDataArray?: T,
) => {
  const atlasGrid = getAtlasGrid(image.voxelCount);
  const atlasSize = getAtlasSize(image.voxelCount, atlasGrid);

  const dataArray =
    inPlaceDataArray ||
    new (atlas.constructor as new (size: number) => T)(
      image.voxelCount.product() * image.voxelComponents,
    );

  const sliceSize =
    image.voxelCount.x * image.voxelCount.y * image.voxelComponents;

  for (let z = 0; z < image.voxelCount.z; z++) {
    const dataZOffset = z * sliceSize;
    const atlasSliceOffset = new THREE.Vector2(
      (z % atlasGrid.x) * image.voxelCount.x,
      Math.floor(z / atlasGrid.x) * image.voxelCount.y,
    );

    for (let y = 0; y < image.voxelCount.y; y++) {
      const atlasYOffset =
        (y + atlasSliceOffset.y) * atlasSize.x * image.voxelComponents;
      const dataYOffset = y * image.voxelCount.x * image.voxelComponents;

      for (let x = 0; x < image.voxelCount.x; x++) {
        const atlasXOffset = (x + atlasSliceOffset.x) * image.voxelComponents;
        const dataXOffset = x * image.voxelComponents;

        for (let c = 0; c < image.voxelComponents; c++) {
          dataArray[dataZOffset + dataYOffset + dataXOffset + c] =
            atlas[atlasYOffset + atlasXOffset + c];
        }
      }
    }
  }

  return dataArray;
};
