import type { ViewType } from "@visian/utils";

export interface getNonEmptySlicesArgs {
  atlas: Uint8Array;
  voxelComponents: number;
  voxelCount: number[];
}
export type getNonEmptySlicesReturn = boolean[][];

export interface isSliceEmptyArgs {
  atlas: Uint8Array;
  voxelComponents: number;
  voxelCount: number[];
  sliceNumber: number;
  viewType: ViewType;
}
export type isSliceEmptyReturn = boolean;
