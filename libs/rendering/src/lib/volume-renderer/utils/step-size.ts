import { Image } from "@visian/utils";

export const getStepSize = (atlas: Image) => {
  const volumeSpaceVoxelSize = atlas.voxelCount
    .toArray()
    .map((size) => 1 / size);
  // TODO: Tweak adaptively based on performance
  return Math.min(...volumeSpaceVoxelSize) / 2;
};
