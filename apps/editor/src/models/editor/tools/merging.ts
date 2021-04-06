import { AnnotationVoxel } from "./types";

export type MergingFunction = (
  newVoxel: AnnotationVoxel,
  oldVoxel: AnnotationVoxel,
) => AnnotationVoxel;

export const replaceMerge: MergingFunction = (
  newVoxel: AnnotationVoxel,
  oldVoxel: AnnotationVoxel,
) => {
  return AnnotationVoxel.fromVoxelAndValue(newVoxel, newVoxel.value);
};
