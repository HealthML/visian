export interface GetNonEmptySlicesArgs {
  atlas: Uint8Array;
  voxelComponents: number;
  voxelCount: number[];
}
export type GetNonEmptySlicesReturn = boolean[][];

export interface IsSliceEmptyArgs {
  sliceData: Uint8Array;
}
export type IsSliceEmptyReturn = boolean;
