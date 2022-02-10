import { TypedArray } from "itk/Image";

import { ITKMatrix } from "../../io";
import { Vector } from "../vector";

/** Vector of the indices of x, y, z axis for calculations. */
const axesIndices = new Vector([0, 1, 2], false);

/**
 * Extracts the orientation for each axis as a single vector.
 * @param orientation A matrix containing the orientation of the image.
 * @returns An array of Vector3 representing the orientations of x, y, z respectively.
 */
const getOrientationVectors = (orientation: ITKMatrix) => {
  const d = orientation.data;

  // Extract basis
  const orientationVectors: [Vector, Vector, Vector] = [
    new Vector([d[0], d[1], d[2]], false).round(),
    new Vector([d[3], d[4], d[5]], false).round(),
    new Vector([d[6], d[7], d[8]], false).round(),
  ];

  return orientationVectors;
};

/**
 * Infers the actual axis mapping from the given orientation.
 * @param orientationVectors A Vector3 array representing the orientations of x, y, z respectively.
 * @returns A Vector3 whose components map the respective axis to the actual axis index.
 */
const getAxisMapping = (orientationVectors: [Vector, Vector, Vector]) => {
  const axisMapping = new Vector(3, false);
  orientationVectors.forEach((vector, index) => {
    axisMapping.setComponent(index, Math.abs(vector.dot(axesIndices)));
  });

  return axisMapping;
};

/**
 * Swaps the components of the given metadata for the axes according to the actual orientation.
 * @param toSwap The metadata for which to adapt the order according to the orientation.
 * Is expected to have three components.
 * @param orientation A matrix containing the orientation of the image.
 * @returns The metadata with its components swapped according to the axes orientation.
 */
export const swapAxesForMetadata = (
  toSwap: number[],
  orientation: ITKMatrix,
) => {
  const orientationVecs = getOrientationVectors(orientation);
  const axisMapping = getAxisMapping(orientationVecs);
  const swappedMetadata = [
    toSwap[axisMapping.x],
    toSwap[axisMapping.y],
    toSwap[axisMapping.z],
  ];
  return swappedMetadata;
};

/**
 * Converts the given orientation to the orientation the image has after orientation correction
 * for its data through {@link unifyOrientation}
 * @param orientation A matrix containing the original orientation of the image.
 * The image is expected to have three dimensions.
 * @returns A matrix containing the orientation the image will have after {@link unifyOrientation}.
 */
export const calculateNewOrientation = (orientation: ITKMatrix) => {
  const d = orientation.data;
  const m = new ITKMatrix(3, 3);

  // Transpose
  m.data = [d[0], d[3], d[6], d[1], d[4], d[7], d[2], d[5], d[8]];

  return m;
};

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
 * @param toInternal A boolean indicating whether the orientation conversion happens to the internal
 * VISIAN format needed in the texture atlas. Defaults to true.
 * @returns a TypedArray containing the image data in the expected orientation.
 */
export const unifyOrientation = (
  data: TypedArray,
  orientation: ITKMatrix,
  dimensionality: number,
  size: number[],
  components: number,
  toInternal = true,
) => {
  let axisMapping: Vector;
  let direction: Vector;

  if (dimensionality < 3) {
    axisMapping = axesIndices;
    direction = defaultDirection;
  } else {
    const orientationVectors = getOrientationVectors(orientation);

    axisMapping = getAxisMapping(orientationVectors);

    // Calculate actual axes inversion, based on the expected direction for the texture atlas.
    direction = new Vector(3, false);
    if (toInternal) {
      const dotVector = new Vector([1, 1, 1], false);
      orientationVectors.forEach((vector, index) => {
        direction.setComponent(index, vector.dot(dotVector));
      });
      direction.multiply(defaultDirection);
    } else {
      const originalDirection = new Vector(3, false);
      orientationVectors.forEach((vector) => originalDirection.add(vector));
      originalDirection.multiply(defaultDirection);

      direction.set(
        originalDirection.getComponent(axisMapping.x),
        originalDirection.getComponent(axisMapping.y),
        originalDirection.getComponent(axisMapping.z),
      );
    }
  }

  const axisInversion = {
    x: direction.x < 0,
    y: direction.y < 0,
    z: direction.z < 0,
  };

  const sliceCount = dimensionality === 2 ? 1 : size[2];
  const newSize = [size[0], size[1], sliceCount];

  const rowSize = size[0] * components;
  const sliceSize = size[0] * size[1] * components;
  const axisMultipliers = [components, rowSize, sliceSize];

  const unifiedData = new (data.constructor as new (
    size: number,
  ) => typeof data)(size[0] * size[1] * sliceCount * components);

  let newIndex = 0;

  // Read data according to axes orientation.
  for (
    let thirdAxisIndex = 0;
    thirdAxisIndex < newSize[axisMapping.z];
    thirdAxisIndex++
  ) {
    const originalThirdAxisIndex = axisInversion.z
      ? newSize[axisMapping.z] - (thirdAxisIndex + 1)
      : thirdAxisIndex;

    const originalThirdAxisOffset =
      originalThirdAxisIndex * axisMultipliers[axisMapping.z];

    for (
      let secondAxisIndex = 0;
      secondAxisIndex < newSize[axisMapping.y];
      secondAxisIndex++
    ) {
      const originalSecondAxisIndex = axisInversion.y
        ? newSize[axisMapping.y] - (secondAxisIndex + 1)
        : secondAxisIndex;

      const originalSecondAxisOffset =
        originalSecondAxisIndex * axisMultipliers[axisMapping.y];

      for (
        let firstAxisIndex = 0;
        firstAxisIndex < newSize[axisMapping.x];
        firstAxisIndex++
      ) {
        const originalFirstAxisIndex = axisInversion.x
          ? newSize[axisMapping.x] - (firstAxisIndex + 1)
          : firstAxisIndex;

        const originalFirstAxisOffset =
          originalFirstAxisIndex * axisMultipliers[axisMapping.x];

        for (let c = 0; c < components; c++) {
          unifiedData[newIndex] =
            data[
              originalFirstAxisOffset +
                originalSecondAxisOffset +
                originalThirdAxisOffset +
                c
            ];
          newIndex++;
        }
      }
    }
  }
  return unifiedData;
};
