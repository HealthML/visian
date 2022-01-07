import { ViewType } from "@visian/utils";

export interface GetEmptySlicesArgs {
  data: Uint8Array;
  voxelComponents: number;
  voxelCount: number[];
}
export type GetEmptySlicesReturn = boolean[][];

export interface IsSliceEmptyArgs {
  sliceData: Uint8Array;
}
export type IsSliceEmptyReturn = boolean;

export interface GetVolumeArgs {
  data: Uint8Array;
  voxelComponents: number;
  voxelCount: number[];
  voxelSpacing: number[];
}

export type GetVolumeReturn = number;

export interface GetAreaArgs extends GetVolumeArgs {
  viewType: ViewType;
  slice: number;
}
export type GetAreaReturn = number;
