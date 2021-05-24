import type { Pixel, Vector, ViewType, Voxel } from "@visian/utils";
import type { Matrix4 } from "three";
import { MarkerConfig } from "./markers";

import type { ViewMode } from "./types";

/** View settings affecting the whole document. */
export interface IViewSettings {
  /** The current viewport mode. */
  viewMode: ViewMode;

  /**
   * The currently selected voxel.
   * Determines the slice (and frame in time) that is displayed.
   */
  selectedVoxel: Voxel & Vector;

  /**
   * View brightness adjustment.
   * `1` is the original brightness.
   */
  brightness: number;
  /**
   * View contrast adjustment.
   * `1` is the original contrast.
   */
  contrast: number;

  /** The background color as as CSS color string. */
  backgroundColor: string;

  setSelectedVoxel(x?: number, y?: number, z?: number): void;
}

/** View settings for the 2D viewport. */
export interface IViewport2D {
  /** The main view's slicing plane. */
  mainViewType: ViewType;
  /** Indicates if the side views should be open. */
  showSideViews: boolean;

  /**
   * The current zoom level.
   * `1` is the default zoom (typically zoom to fit).
   */
  zoomLevel: number;
  /** The 2D navigation offset by which the visible image is moved. */
  offset: Pixel;

  /**
   * All slice markers, aggregated for the document and current main view type.
   */
  markers: MarkerConfig[];

  /**
   * Returns the selected slice for the given `ViewType`.
   * This should be derived from the `ViewSettings`' `selectedVoxel` attribute.
   *
   * @param viewType The `ViewType` to read the slice from.
   * Defaults to the current `mainViewType`.
   */
  getSelectedSlice(viewType?: ViewType): number;
  /**
   * Sets the selected slice for the given `ViewType`.
   * The slice value should be written into the `ViewSettings`' `selectedVoxel`
   * attribute.
   *
   * @param viewType The `ViewType` to write the slice to.
   * Defaults to the current `mainViewType`.
   * @param slice The slice number.
   */
  setSelectedSlice(viewType: ViewType | undefined, slice: number): void;
  /**
   * Sets crosshair position for the given `ViewType`.
   * The new position should be written into the `ViewSettings`'
   * `selectedVoxel` attribute.
   *
   * @param viewType The `ViewType` to set the crosshair position for.
   * Defaults to the current `mainViewType`.
   * @param slicePosition The pixel position the the slice as seen from the
   * passed `viewType`.
   */
  moveCrosshair(viewType: ViewType | undefined, slicePosition: Pixel): void;

  /** Increases the current `zoomLevel` by adding the current `zoomStep`. */
  zoomIn(): void;
  /** Decreases the current `zoomLevel` by subtracting the current `zoomStep`. */
  zoomOut(): void;
}

/** View settings for the 3D viewport. */
export interface IViewport3D {
  /** The 3D camera's world matrix. */
  cameraMatrix: Matrix4;
}
