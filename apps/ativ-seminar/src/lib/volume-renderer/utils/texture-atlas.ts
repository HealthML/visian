import { ITKImage, TypedArray } from "@visian/util";
import * as THREE from "three";

/**
 * Returns the optimal number of slices in x/y direction in the texture atlas.
 *
 * @param voxelCount The number of voxels in each direction.
 */
export const getAtlasGrid = (voxelCount: THREE.Vector3) => {
  const atlasGridX = Math.ceil(
    Math.sqrt((voxelCount.z * voxelCount.y) / voxelCount.x),
  );
  return new THREE.Vector2(atlasGridX, Math.ceil(voxelCount.z / atlasGridX));
};

/** Returns a 2D texture atlas based on the given image. */
export const generateTextureAtlas = (image: ITKImage) => {
  if (image.size.length !== 3) {
    throw new Error("Only 3D volumetric images are supported");
  }
  const voxelCount = new THREE.Vector3().fromArray(image.size);
  const atlasGrid = getAtlasGrid(voxelCount);

  const atlasSize = new THREE.Vector2(voxelCount.x, voxelCount.y).multiply(
    atlasGrid,
  );

  const atlas = new (image.data.constructor as new (
    size: number,
  ) => TypedArray)(atlasSize.x * atlasSize.y);

  const sliceSize = voxelCount.x * voxelCount.y;

  for (let sliceNumber = 0; sliceNumber < voxelCount.z; sliceNumber++) {
    const sliceData = image.data.subarray(
      sliceNumber * sliceSize,
      (sliceNumber + 1) * sliceSize,
    );
    const sliceOffset = new THREE.Vector2(
      (sliceNumber % atlasGrid.x) * voxelCount.x,
      Math.floor(sliceNumber / atlasGrid.x) * voxelCount.y,
    );

    for (let sliceY = 0; sliceY < voxelCount.y; sliceY++) {
      for (let sliceX = 0; sliceX < voxelCount.x; sliceX++) {
        atlas[(sliceOffset.y + sliceY) * atlasSize.x + sliceOffset.x + sliceX] =
          sliceData[sliceY * voxelCount.x + sliceX];
      }
    }
  }
  return atlas;
};
