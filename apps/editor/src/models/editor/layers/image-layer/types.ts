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
