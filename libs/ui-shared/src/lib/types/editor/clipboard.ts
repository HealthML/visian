import { MergeFunction } from "./types";

export interface IClipboard {
  copy(): void;
  paste(mergeFunction?: MergeFunction): void;
}
