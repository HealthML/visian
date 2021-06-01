import type { Pixel, Vector, ViewType, Voxel } from "@visian/utils";
import type { Matrix4 } from "three";
import { IParameter } from "./parameters";
import { MarkerConfig } from "./markers";

import type { Reference, ViewMode } from "./types";

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
  sliceMarkers: MarkerConfig[];

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

export type ShadingMode = "none" | "phong" | "lao";

export interface ITransferFunction<N extends string> {
  /**
   * The transfer function's name.
   * A (locally) unique identifier.
   */
  name: N;

  /**
   * The transfer function's label.
   * A user-facing display name.
   */
  label?: string;
  /**
   * The label's translation key.
   * If set, overrides the `label`.
   */
  labelTx?: string;

  /** This transfer function's parameters. */
  params: { [name: string]: IParameter };
}

/** View settings for the 3D viewport. */
export interface IViewport3D<N extends string> {
  /** Indicates if the user is currently in AR or VR. */
  isInXR: boolean;

  /** The 3D camera's world matrix. */
  cameraMatrix: Matrix4;

  /** The volumetric rendering opacity, scales the density of every voxel. */
  opacity: number;
  shadingMode: ShadingMode;

  activeTransferFunction?: Reference<ITransferFunction<N>>;
  transferFunctions: Record<N, ITransferFunction<N>>;

  setIsInXR(value?: boolean): void;
  setCameraMatrix(value?: Matrix4): void;
  setOpacity(value?: number): void;
  setShadingMode(value?: ShadingMode): void;
  setActiveTransferFunction(
    nameOrTransferFunction?: N | ITransferFunction<N>,
  ): void;
}
