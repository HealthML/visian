import { TypedArray } from "itk/Image";
import * as THREE from "three";

import { ITKMatrix } from "../../io";
import { Vector } from "../vector";

/**
 * The texture atlas generation expects the x- and y-axis to be inverted
 * and the z-axis to be non-inverted.
 */
export const defaultDirection = new Vector([-1, -1, 1], false);

/**
 * Converts an image array with unexpected orientation to the expected orientation.
 * @param data The original TypedArray of the image data.
 * @param orientation A matrix containing the orientation of the image.
 * @param dimensionality The dimensionality of the image.
 * @param size An array containing the size of the image.
 * @param components The amount of components per voxel.
 * @returns a TypedArray containing the image data in the expected orientation.
 */
export const unifyOrientation = (
  data: TypedArray,
  orientation: ITKMatrix,
  dimensionality: number,
  size: number[],
  components: number,
) => {
  const direction =
    dimensionality < 3
      ? defaultDirection
      : Vector.fromArray(
          new THREE.Vector3()
            .setScalar(1)
            .applyMatrix3(new THREE.Matrix3().fromArray(orientation.data))
            .round()
            .multiply(new THREE.Vector3().fromArray(defaultDirection.toArray()))
            .toArray(),
        );

  const axisInversion = {
    x: direction.x < 0,
    y: direction.y < 0,
    z: direction.z < 0,
  };

  if (!axisInversion.x && !axisInversion.y && !axisInversion.z) return data;

  const sliceCount = dimensionality === 2 ? 1 : size[2];

  const unifiedData = new (data.constructor as new (
    size: number,
  ) => typeof data)(size[0] * size[1] * sliceCount * components);

  for (let z = 0; z < sliceCount; z++) {
    const originalZ = axisInversion.z ? sliceCount - (z + 1) : z;

    const sliceSize = size[0] * size[1] * components;
    const zOffset = z * sliceSize;
    const originalZOffset = originalZ * sliceSize;

    for (let y = 0; y < size[1]; y++) {
      const originalY = axisInversion.y ? size[1] - (y + 1) : y;

      const rowSize = size[0] * components;
      const yOffset = y * rowSize;
      const originalYOffset = originalY * rowSize;

      for (let x = 0; x < size[0]; x++) {
        const originalX = axisInversion.x ? size[0] - (x + 1) : x;

        const xOffset = x * components;
        const originalXOffset = originalX * components;

        for (let c = 0; c < components; c++) {
          unifiedData[zOffset + yOffset + xOffset + c] =
            data[originalZOffset + originalYOffset + originalXOffset + c];
        }
      }
    }
  }

  return unifiedData;
};
