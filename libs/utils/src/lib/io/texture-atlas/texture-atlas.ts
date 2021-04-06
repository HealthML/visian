import * as THREE from "three";

import { Vector } from "../../models/vector";

import type { Image } from "../../models/image";
import type { TypedArray } from "../itk";

export type TextureAtlasMetadata<T extends TypedArray = TypedArray> = Pick<
  Image<T>,
  "data" | "dimensionality" | "orientation" | "voxelComponents" | "voxelCount"
>;

/**
 * The texture atlas generation expects the x- and y-axis to be inverted
 * and the z-axis to be non-inverted.
 */
export const defaultDirection = new Vector([-1, -1, 1], false);

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
  image: TextureAtlasMetadata<T>,
  inPlaceAtlas?: T,
) => {
  const atlasGrid = getAtlasGrid(image.voxelCount);
  const atlasSize = getAtlasSize(image.voxelCount, atlasGrid);
  const atlas =
    inPlaceAtlas ||
    new (image.data.constructor as new (size: number) => T)(
      atlasSize.x * atlasSize.y * image.voxelComponents,
    );

  // TODO: Refactor as soon as our Vector class implements `applyMatrix3`
  const direction =
    image.dimensionality < 3
      ? defaultDirection
      : Vector.fromArray(
          new THREE.Vector3()
            .setScalar(1)
            .applyMatrix3(new THREE.Matrix3().fromArray(image.orientation.data))
            .round()
            .multiply(new THREE.Vector3().fromArray(defaultDirection.toArray()))
            .toArray(),
        );

  const inverted = {
    x: direction.x < 0,
    y: direction.y < 0,
    z: direction.z < 0,
  };

  const sliceSize =
    image.voxelCount.x * image.voxelCount.y * image.voxelComponents;

  // TODO: Test if ordered read can improve performance here
  for (let z = 0; z < image.voxelCount.z; z++) {
    const sliceZ = inverted.z ? image.voxelCount.z - (z + 1) : z;
    const sliceData = image.data.subarray(
      sliceZ * sliceSize,
      (sliceZ + 1) * sliceSize,
    );
    const sliceOffset = new THREE.Vector2(
      (sliceZ % atlasGrid.x) * image.voxelCount.x * image.voxelComponents,
      Math.floor(sliceZ / atlasGrid.x) *
        image.voxelCount.y *
        image.voxelComponents,
    );

    for (let y = 0; y < image.voxelCount.y; y++) {
      const sliceY = inverted.y ? image.voxelCount.y - (y + 1) : y;
      for (let x = 0; x < image.voxelCount.x; x++) {
        const sliceX = inverted.x ? image.voxelCount.x - (x + 1) : x;
        for (let c = 0; c < image.voxelComponents; c++) {
          atlas[
            image.voxelComponents *
              ((sliceOffset.y + sliceY) * atlasSize.x +
                sliceOffset.x +
                sliceX) +
              c
          ] =
            sliceData[image.voxelComponents * (y * image.voxelCount.x + x) + c];
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
  const textureFormat: THREE.PixelFormat =
    image.voxelComponents === 1
      ? THREE.LuminanceFormat
      : image.voxelComponents === 2
      ? THREE.RGFormat
      : image.voxelComponents === 3
      ? THREE.RGBFormat
      : THREE.RGBAFormat;

  const atlasGrid = getAtlasGrid(image.voxelCount);
  return new THREE.DataTexture(
    atlas,
    atlasGrid.x * image.voxelCount.x,
    atlasGrid.y * image.voxelCount.y,
    textureFormat,
    undefined,
    undefined,
    undefined,
    undefined,
    magFilter,
  );
};
