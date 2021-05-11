import type { Vector, ViewType } from "@visian/utils";
import type { Matrix } from "three";

import type { ViewMode } from "./types";

/** View settings affecting the whole document. */
export interface IViewSettings {
  /** The current viewport mode. */
  viewMode: ViewMode;

  /**
   * The currently selected voxel.
   * Determines the slice (and frame in time) that is displayed.
   */
  selectedVoxel: Vector;

  /**
   * View contrast adjustment.
   * `1` is the original contrast.
   */
  contrast: number;
  /**
   * View brightness adjustment.
   * `1` is the original brightness.
   */
  brightness: number;

  /** The background color as as CSS color string. */
  backgroundColor: string;
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
  offset: Vector;
}

/** View settings for the 3D viewport. */
export interface IViewport3D {
  /** The 3D camera's world matrix. */
  cameraMatrix: Matrix;
}
