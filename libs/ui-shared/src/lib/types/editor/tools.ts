import * as THREE from "three";
import type { Voxel } from "@visian/utils";
import type { IconType } from "../../components";
import type { IParameter } from "./parameters";
import type { Reference, ViewMode } from "./types";

export interface DragPoint extends Voxel {
  /** Whether the cursor is on the right side of the pixel. */
  right: boolean;
  /** Whether the cursor is on the bottom half of the pixel. */
  bottom: boolean;
}

export interface ITool<N extends string> {
  /**
   * The tool's name.
   * A (locally) unique identifier.
   */
  name: N;

  /** The icon key to use for this tool. */
  icon: IconType;
  /**
   * The tool's label.
   * A user-facing display name.
   */
  label?: string;
  /**
   * The label's translation key.
   * If set, overrides the `label`.
   */
  labelTx?: string;

  /**
   * Indicates if the tool is a drawing tool, i.e., if it the user can use it
   * to paint (modify the values of a number of contiguous voxels).
   */
  isDrawingTool: boolean;

  /**
   * Indicates if the tool is a brush, i.e., if a brush cursor should be rendered
   * when it can be used.
   */
  isBrush: boolean;

  /** Indicates if the tool is a smart brush. */
  isSmartBrush: boolean;

  /**
   * The tool that is used as the alternative mode of this tool.
   * Typically, this is activated using the `alt` key or right mouse button.
   */
  altTool?: Reference<ITool<N>>;

  /**
   * An array of all view modes this tool can be used in.
   * If none is given, the tool can be activated in all view modes.
   */
  supportedViewModes?: ViewMode[];
  /**
   * An array of all layer kinds this tool can be used on.
   * If none is given, the tool can be activated on all kinds of layers.
   */
  supportedLayerKinds?: string[];

  /** This tool's parameters. */
  params: { [name: string]: IParameter };

  /** Returns `true` if the tool supports the current view mode & layer kind. */
  canActivate(): boolean;

  /**
   * Called when the tool becomes active.
   *
   * @param previousTool The previously active tool (if any).
   */
  activate(previousTool?: ITool<N>): void;

  /** Called when the user starts a drag interaction with this tool selected. */
  startAt(dragPoint: DragPoint): void;
  /** Called when the user moves their cursor with this tool selected. */
  moveTo(dragPoint: DragPoint): void;
  /** Called when the user ends a drag interaction with this tool selected. */
  endAt(dragPoint: DragPoint): void;
}

/** A class of similar tools, typically grouped in the UI. */
export interface IToolGroup<N extends string> {
  /**
   * The currently selected tool out of this group.
   * Typically, this is the one that is used to represent the group in, e.g.,
   * the toolbar.
   */
  activeTool: Reference<ITool<N>>;
  /** All tools that belong to this group. */
  tools: Reference<ITool<N>>[];

  setActiveTool(nameOrTool: N | ITool<N>): void;
}

/** The editor's tools and their settings for the document. */
export interface ITools<N extends string> {
  /** The currently selected tool. */
  activeTool?: Reference<ITool<N>>;
  /** All available tools and their settings. */
  tools: Record<N, ITool<N>>;
  /** The tool groups, typically use to populate the toolbar during rendering. */
  toolGroups: IToolGroup<N>[];

  /** The current brush size in pixels/voxels. */
  brushSize: number;
  /**
   * Indicates if the brush size should be adapted based on the current zoom
   * level.
   */
  useAdaptiveBrushSize: boolean;

  /** The threshold for all smart brushes. */
  smartBrushThreshold: number;

  /** The size of the bounded smart brush bounding boxes. */
  boundedSmartBrushRadius: number;

  /** Indicates if a brush stroke can be started this moment. */
  canDraw: boolean;

  /** Indicates if the current tool is in use this moment. */
  isToolInUse: boolean;
  /** Indicates if a tool is currently drawing. */
  isDrawing: boolean;

  layerMergeTextures: THREE.Texture[];

  setActiveTool(nameOrTool?: N | ITool<N>): void;

  setBrushSize(value?: number, showPreview?: boolean): void;
  incrementBrushSize(): void;
  decrementBrushSize(): void;

  setSmartBrushThreshold(value?: number): void;
  setBoundedSmartBrushRadius(value?: number): void;

  setIsCursorOverDrawableArea(value: boolean): void;
  setIsCursorOverFloatingUI(value: boolean): void;
  setIsNavigationDragged(value: boolean): void;
  setIsDrawing(value: boolean): void;
}
