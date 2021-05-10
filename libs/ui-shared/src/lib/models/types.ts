import type { Vector, ViewType, Voxel } from "@visian/utils";
import type React from "react";
import type { Matrix } from "three";
import type { Theme } from "../theme";

// `name` is a (locally) unique identifier
// `title` is a (user-facing) display name for an entity
// `label` is a display name for an attribute

// Preset as layer configurations:
// Choosing a preset built for less layers than present prompts the user to
// select the fitting input layers

export type ViewMode = "2D" | "3D";

export interface IParameter<T = unknown> {
  kind: string;

  name: string;
  label?: string;
  labelTx?: string;

  value: T;
  setValue: (value: T) => void;
}

export interface INumberParameter extends IParameter<number> {
  kind: "number";
  min: number;
  max: number;
  extendBeyondMinMax?: boolean;
}

// TODO: More parameter types

export interface ILayer {
  kind: string;
  title: string;

  blendMode?: string;
  color?: string;
  isVisible: boolean;
  opacity?: string;

  transformation?: Matrix;
}

export interface IImageLayer extends ILayer {
  kind: "image";

  contrast: number;
  brightness: number;
  // TODO
}

export interface ILayerGroup extends ILayer {
  kind: "group";

  subLayers: ILayer[];
}

export interface IHistory {
  canUndo: boolean;
  canRedo: boolean;

  undo(): void;
  redo(): void;

  addCommand: (command: unknown) => void; // TODO
  clear(): void;
}

export interface DragPoint extends Voxel {
  /** Whether the cursor is on the right side of the pixel. */
  right: boolean;
  /** Whether the cursor is on the bottom half of the pixel. */
  bottom: boolean;
}
export interface ITool {
  name: string;
  label?: string;
  labelTx?: string;

  /** Key of the alternative mode of this tool. */
  alternativeTool?: string;

  supportedViewModes: ViewMode[];

  params: IParameter[];

  startAt: (dragPoint: DragPoint) => void;
  moveTo: (dragPoint: DragPoint) => void;
  endAt: (dragPoint: DragPoint) => void;
}

export interface ITools {
  /** Key of the active tool. */
  activeTool: string;

  tools: {
    [name: string]: ITool;
  };

  brushSizePixels: number;
  useAdaptiveBrushSize: boolean;

  isBrushSelected: boolean;
  canDraw: boolean;
  isDrawing: boolean; // TODO: isToolInUse?
}

export interface IViewSettings {
  viewMode: ViewMode;

  selectedVoxel: Vector;

  contrast: number;
  brightness: number;

  backgroundColor: string;
}

export interface IViewport2D {
  mainViewType: ViewType;
  showSideViews: boolean;

  zoomLevel: number;
  offset: Vector;
  rotation: number;
}

export interface IViewport3D {
  cameraMatrix: Matrix;
}

export interface IDocument {
  layers: ILayer[];
  history: IHistory;

  viewSettings: IViewSettings;
  viewport2D: IViewport2D;
  viewport3D: IViewport3D;

  /** Proxy for the root store refs. */
  refs: { [name: string]: React.RefObject<HTMLElement> };

  /** Proxy for the root store theme. */
  theme: Theme;
}

export interface IEditor {
  activeDocument?: IDocument;

  tools: ITools;
}
