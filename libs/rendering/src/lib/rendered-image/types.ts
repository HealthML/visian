import { ViewType } from "@visian/utils";

export enum MergeFunction {
  Replace = 0,
  Add = 1,
  Subtract = 2,
}

export interface OrientedSlice {
  slice: number;
  viewType: ViewType;
}
