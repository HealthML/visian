import type { Voxel } from "@visian/utils";
import type { IParameter } from "./parameters";
import type { Reference, ViewMode } from "./types";

export interface DragPoint extends Voxel {
  /** Whether the cursor is on the right side of the pixel. */
  right: boolean;
  /** Whether the cursor is on the bottom half of the pixel. */
  bottom: boolean;
}

export interface ITool {
  /**
   * The tool's name.
   * A (locally) unique identifier.
   */
  name: string;

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
   * The tool that is used as the alternative mode of this tool.
   * Typically, this is activated using the `alt` key or right mouse button.
   */
  altTool?: Reference<ITool>;

  /** An array of all view modes this tool can be used in. */
  supportedViewModes: ViewMode[];
  /** An array of all layer kinds this tool can be used on. */
  supportedLayerKinds: string[];

  /** This tool's parameters. */
  params: { [name: string]: IParameter };

  /** Called when the tool becomes active. */
  activate(): void;

  /** Called when the user starts a drag interaction with this tool selected. */
  startAt(dragPoint: DragPoint): void;
  /** Called when the user moves their cursor with this tool selected. */
  moveTo(dragPoint: DragPoint): void;
  /** Called when the user ends a drag interaction with this tool selected. */
  endAt(dragPoint: DragPoint): void;

  /** Called when the tool becomes inactive. */
  deactivate(): void;
}

/** A class of similar tools, typically grouped in the UI. */
export interface IToolGroup {
  /**
   * The currently selected tool out of this group.
   * Typically, this is the one that is used to represent the group in, e.g.,
   * the toolbar.
   */
  activeTool: Reference<ITool>;
  /** All tools that belong to this group. */
  tools: Reference<ITool>[];

  setActiveTool(nameOrTool: string | ITool): void;
}

/** The editor's tools and their settings for the document. */
export interface ITools {
  /** The currently selected tool. */
  activeTool?: Reference<ITool>;
  /** All available tools and their settings. */
  tools: {
    [name: string]: ITool;
  };
  /** The tool groups, typically use to populate the toolbar during rendering. */
  toolGroups: IToolGroup[];

  /** The current brush size in pixels/voxels. */
  brushSize: number;
  /**
   * Indicates if the brush size should be adapted based on the current zoom
   * level.
   */
  useAdaptiveBrushSize: boolean;

  /** Indicates if a brush stroke can be started this moment. */
  canDraw: boolean;

  /** Indicates if the current tool is in use this moment. */
  isToolInUse: boolean;

  setActiveTool(nameOrTool?: string | ITool): void;
}
