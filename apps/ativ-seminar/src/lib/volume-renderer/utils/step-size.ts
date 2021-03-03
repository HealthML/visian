import { ITKImage } from "@visian/util";

export const getStepSize = (image: ITKImage) => {
  const volumeSpaceVoxelSize = image.size.map((size) => 1 / size);
  return Math.min(...volumeSpaceVoxelSize) / 1.5;
};
