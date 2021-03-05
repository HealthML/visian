import TextureAtlas from "./texture-atlas";

export const getStepSize = (atlas: TextureAtlas) => {
  const volumeSpaceVoxelSize = atlas.voxelCount
    .toArray()
    .map((size) => 1 / size);
  return Math.min(...volumeSpaceVoxelSize) / 1.5;
};
