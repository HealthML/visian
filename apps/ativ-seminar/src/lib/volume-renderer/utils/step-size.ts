import type { TextureAtlas } from "../../texture-atlas";

export const getStepSize = (atlas: TextureAtlas) => {
  const volumeSpaceVoxelSize = atlas.voxelCount
    .toArray()
    .map((size) => 1 / size);
  // TODO: Tweak adaptively based on performance
  return Math.min(...volumeSpaceVoxelSize) / 2;
};
