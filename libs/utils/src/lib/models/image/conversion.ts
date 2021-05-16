import { TypedArray } from "itk/Image";
import { Vector3, Matrix3 } from "three";

import { ITKMatrix } from "../../io";

const getAxisMapping = (orientation: ITKMatrix) => {
  const axesIndices = new Vector3(0, 1, 2);

  const orientationVectors: [Vector3, Vector3, Vector3] = [
    new Vector3(),
    new Vector3(),
    new Vector3(),
  ];

  new Matrix3().fromArray(orientation.data).extractBasis(...orientationVectors);

  orientationVectors.forEach((vec) => vec.round());

  // create new axis mapping from the given orientation
  const axisMapping = new Vector3();
  orientationVectors.forEach((vec, idx) => {
    axisMapping.setComponent(
      idx,
      Math.abs(orientationVectors[idx].dot(axesIndices)),
    );
  });

  return axisMapping;
};

export const swapAxesForMetadata = (
  toSwap: number[],
  orientation: ITKMatrix,
) => {
  const axisMapping = getAxisMapping(orientation);
  const swappedMetadata = [
    toSwap[axisMapping.x],
    toSwap[axisMapping.y],
    toSwap[axisMapping.z],
  ];
  return swappedMetadata;
};

/**
 * The texture atlas generation expects the x- and y-axis to be inverted
 * and the z-axis to be non-inverted.
 */
export const defaultDirection = new Vector3(-1, -1, 1);

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
  const axesIndices = new Vector3(0, 1, 2);
  let axisMapping: Vector3;
  let direction: Vector3;

  if (dimensionality < 3) {
    axisMapping = axesIndices;
    direction = defaultDirection;
  } else {
    const orientationVectors: [Vector3, Vector3, Vector3] = [
      new Vector3(),
      new Vector3(),
      new Vector3(),
    ];

    new Matrix3()
      .fromArray(orientation.data)
      .extractBasis(...orientationVectors);

    orientationVectors.forEach((vec) => vec.round());

    // create new axis mapping from the given orientation
    axisMapping = new Vector3();
    orientationVectors.forEach((vec, idx) => {
      axisMapping.setComponent(
        idx,
        Math.abs(orientationVectors[idx].dot(axesIndices)),
      );
    });

    // calculate actual axes inversion, based on the expected direction for the texture atlas
    direction = new Vector3();
    const dotVec = new Vector3(1, 1, 1);
    orientationVectors.forEach((vec, idx) => {
      direction.setComponent(idx, orientationVectors[idx].dot(dotVec));
    });
    direction.multiply(defaultDirection);
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

  for (
    let thirdAxisIdx = 0;
    thirdAxisIdx < newSize[axisMapping.z];
    thirdAxisIdx++
  ) {
    const originalThirdAxisIdx = axisInversion.z
      ? newSize[axisMapping.z] - (thirdAxisIdx + 1)
      : thirdAxisIdx;

    const originalThirdAxisOffset =
      originalThirdAxisIdx * axisMultipliers[axisMapping.z];

    for (
      let secondAxisIndex = 0;
      secondAxisIndex < newSize[axisMapping.y];
      secondAxisIndex++
    ) {
      const originalSecondAxisIdx = axisInversion.y
        ? newSize[axisMapping.y] - (secondAxisIndex + 1)
        : secondAxisIndex;

      const originalSecondAxisOffset =
        originalSecondAxisIdx * axisMultipliers[axisMapping.y];

      for (
        let firstAxisIdx = 0;
        firstAxisIdx < newSize[axisMapping.x];
        firstAxisIdx++
      ) {
        const originalFirstAxisIdx = axisInversion.x
          ? newSize[axisMapping.x] - (firstAxisIdx + 1)
          : firstAxisIdx;

        const originalFirstAxisOffset =
          originalFirstAxisIdx * axisMultipliers[axisMapping.x];

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
