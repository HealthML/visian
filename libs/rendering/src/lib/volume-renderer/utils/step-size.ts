import { Image } from "@visian/utils";

export const getStepSize = (image: Image) => {
  const volumeSpaceVoxelSize = image.voxelCount
    .toArray()
    .map((size) => 1 / size);
  // TODO: Tweak adaptively based on performance
  return Math.min(...volumeSpaceVoxelSize) / 2;
};

export const getMaxSteps = (image: Image) =>
  Math.ceil(Math.sqrt(3) / getStepSize(image)); // `Math.sqrt(3)` is the unit cube diagonal.
