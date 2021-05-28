import { ViewType } from "@visian/utils";

export type MarkerConfig =
  | number
  | [number, number]
  | { context?: string; color?: string; value: number | [number, number] };

export interface IMarkers {
  /**
   * Returns all slice markers, aggregated for the document and given view
   * type.
   */
  getSliceMarkers(viewType: ViewType): MarkerConfig[];
}
