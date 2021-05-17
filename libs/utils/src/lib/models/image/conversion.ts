import { TypedArray } from "itk/Image";
import { Vector3, Matrix3 } from "three";

import { ITKMatrix } from "../../io";

const axesIndices = new Vector3(0, 1, 2);

const getOrientationVecs = (orientation: ITKMatrix) => {
  const orientationVectors: [Vector3, Vector3, Vector3] = [
    new Vector3(),
    new Vector3(),
    new Vector3(),
  ];

  new Matrix3().fromArray(orientation.data).extractBasis(...orientationVectors);

  orientationVectors.forEach((vec) => vec.round());

  return orientationVectors;
};

const getAxisMapping = (orientationVecs: [Vector3, Vector3, Vector3]) => {
  // create new axis mapping from the given orientation
  const axisMapping = new Vector3();
  orientationVecs.forEach((vec, idx) => {
    axisMapping.setComponent(idx, Math.abs(vec.dot(axesIndices)));
  });

  return axisMapping;
};

export const swapAxesForMetadata = (
  toSwap: number[],
  orientation: ITKMatrix,
) => {
  const orientationVecs = getOrientationVecs(orientation);
  const axisMapping = getAxisMapping(orientationVecs);
  const swappedMetadata = [
    toSwap[axisMapping.x],
    toSwap[axisMapping.y],
    toSwap[axisMapping.z],
  ];
  return swappedMetadata;
};

export const calculateNewOrientation = (orientation: ITKMatrix) => {
  const newOrientation = new Matrix3().fromArray(orientation.data).transpose();
  const itkMatrix = new ITKMatrix(3, 3);
  itkMatrix.data = newOrientation.toArray();
  return itkMatrix;
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
  fromITK = true,
) => {
  let axisMapping: Vector3;
  let direction: Vector3;

  if (dimensionality < 3) {
    axisMapping = axesIndices;
    direction = defaultDirection;
  } else {
    const orientationVectors = getOrientationVecs(orientation);

    axisMapping = getAxisMapping(orientationVectors);

    // calculate actual axes inversion, based on the expected direction for the texture atlas
    direction = new Vector3();
    if (fromITK) {
      const dotVec = new Vector3(1, 1, 1);
      orientationVectors.forEach((vec, idx) => {
        direction.setComponent(idx, vec.dot(dotVec));
      });
      direction.multiply(defaultDirection);
    } else {
      const originalDirection = new Vector3();
      orientationVectors.forEach((vec) => originalDirection.add(vec));
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
