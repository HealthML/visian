export interface getNonEmptySlicesArgs {
  atlas: Uint8Array;
  voxelComponents: number;
  voxelCount: number[];
}
export type getNonEmptySlicesReturn = boolean[][];

export interface isSliceEmptyArgs {
  sliceData: Uint8Array;
}
export type isSliceEmptyReturn = boolean;
