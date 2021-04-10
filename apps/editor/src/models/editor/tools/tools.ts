import { AbstractEventType } from "@visian/ui-shared";
import {
  getOrthogonalAxis,
  getPlaneAxes,
  ISerializable,
  Pixel,
} from "@visian/utils";
import { action, computed, makeObservable, observable } from "mobx";
import * as THREE from "three";

import { getPositionWithinPixel } from "../../../rendering";
import { StoreContext } from "../../types";
import { Editor } from "../editor";
import { ToolType } from "../types";
import { AtlasUndoRedoCommand, SliceUndoRedoCommand } from "../undo-redo";
import { Brush } from "./brush";
import { SmartBrush } from "./smart-brush";
import { DragPoint } from "./types";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EditorToolsSnapshot {}

export class EditorTools implements ISerializable<EditorToolsSnapshot> {
  public static readonly excludeFromSnapshotTracking = [
    "/editor",
    "/isCursorOverDrawableArea",
  ];

  public activeTool = ToolType.SmartBrush;

  public isCursorOverDrawableArea = false;

  public brushSizePixels = 0.5;

  public smartBrushNeighborThreshold = 6;
  public smartBrushSeedThreshold = 10;

  private brush?: Brush;
  private eraser?: Brush;
  private smartBrush?: SmartBrush;
  private smartEraser?: SmartBrush;

  /** A map of the tool types to their corresponding brushes. */
  private brushMap: Partial<Record<ToolType, Brush>>;
  /**
   * A map of the tool types to their corresponding alternative brushes.
   * This is used for e.g. right-click or back of pen interaction.
   */
  protected altBrushMap: Partial<Record<ToolType, Brush>>;

  constructor(protected editor: Editor, protected context?: StoreContext) {
    this.brush = new Brush(this.editor);
    this.eraser = new Brush(this.editor, 0);
    this.smartBrush = new SmartBrush(this.editor);
    this.smartEraser = new SmartBrush(this.editor, 0);

    this.brushMap = {
      [ToolType.Brush]: this.brush,
      [ToolType.Eraser]: this.eraser,
      [ToolType.SmartBrush]: this.smartBrush,
      [ToolType.SmartEraser]: this.smartEraser,
    };
    this.altBrushMap = {
      [ToolType.Brush]: this.eraser,
      [ToolType.Eraser]: this.brush,
      [ToolType.SmartBrush]: this.smartEraser,
      [ToolType.SmartEraser]: this.smartBrush,
    };

    makeObservable(this, {
      activeTool: observable,
      isCursorOverDrawableArea: observable,
      brushSizePixels: observable,
      smartBrushNeighborThreshold: observable,
      smartBrushSeedThreshold: observable,

      isBrushToolSelected: computed,

      applySnapshot: action,
      setActiveTool: action,
      setCursorOverDrawableArea: action,
      setBrushSizePixels: action,
      setSmartBrushSeedTreshold: action,
      setSmartBrushNeighborThreshold: action,
    });
  }

  public get isBrushToolSelected() {
    return [
      ToolType.Brush,
      ToolType.Eraser,
      ToolType.SmartBrush,
      ToolType.SmartEraser,
    ].includes(this.activeTool);
  }

  public setActiveTool(tool = ToolType.Brush) {
    this.activeTool = tool;
  }

  public setCursorOverDrawableArea(value = true) {
    this.isCursorOverDrawableArea = value;
  }

  public setBrushSizePixels(value = 5) {
    this.brushSizePixels = value;
  }

  public setSmartBrushSeedTreshold(value = 6) {
    this.smartBrushSeedThreshold = value;
  }

  public setSmartBrushNeighborThreshold(value = 10) {
    this.smartBrushNeighborThreshold = value;
  }

  public toJSON() {
    return {};
  }

  public async applySnapshot(_snapshot: EditorToolsSnapshot) {
    // Intentionally left blank
  }

  public clearSlice = (
    image = this.editor.annotation,
    viewType = this.editor.viewSettings.mainViewType,
    slice = this.editor.viewSettings.getSelectedSlice(),
  ) => {
    if (!image) return;

    const oldSliceData = image.getSlice(slice, viewType);
    image.setSlice(viewType, slice);
    this.editor.sliceRenderer?.lazyRender();

    this.editor.undoRedo.addCommand(
      new SliceUndoRedoCommand(image, viewType, slice, oldSliceData),
    );
  };

  public clearImage(image = this.editor.annotation) {
    if (!image) return;

    const oldAtlas = new Uint8Array(image.getAtlas());

    const emptyAtlas = new Uint8Array(oldAtlas.length);
    image.setAtlas(emptyAtlas);
    this.editor.sliceRenderer?.lazyRender();

    this.editor.undoRedo.addCommand(
      new AtlasUndoRedoCommand(image, oldAtlas, emptyAtlas),
    );
  }

  public handleEvent(
    screenPosition: Pixel,
    eventType?: AbstractEventType,
    alt = false,
  ) {
    if (!this.editor.sliceRenderer) {
      this.setCursorOverDrawableArea(false);
      return;
    }

    const intersection = this.editor.sliceRenderer.raycaster.getIntersectionsFromPointer(
      screenPosition,
    )[0];
    if (!intersection || !intersection.uv) {
      this.setCursorOverDrawableArea(false);
      return;
    }

    this.setCursorOverDrawableArea();

    this.alignBrushCursor(intersection.uv);
    if (!eventType) return;

    const dragPoint = this.getDragPoint(intersection.uv);
    if (!dragPoint) return;

    const tool = (alt ? this.altBrushMap : this.brushMap)[this.activeTool];
    switch (eventType) {
      case "start":
        tool?.startAt(dragPoint);
        break;
      case "move":
        tool?.moveTo(dragPoint);
        break;
      case "end":
        tool?.endAt(dragPoint);
        break;
    }
  }

  private alignBrushCursor(uv: THREE.Vector2) {
    if (!this.editor.sliceRenderer || !this.editor.image) return;
    const { voxelCount } = this.editor.image;

    const [widthAxis, heightAxis] = getPlaneAxes(
      this.editor.viewSettings.mainViewType,
    );
    const scanWidth = voxelCount[widthAxis];
    const scanHeight = voxelCount[heightAxis];

    let right = false;
    let bottom = false;
    if (this.brushSizePixels === 0.5) {
      [right, bottom] = getPositionWithinPixel(uv, scanWidth, scanHeight);
    }

    const xOffset = this.brushSizePixels === 0.5 ? (right ? 1 : 2) : 0.5;
    const yOffset = this.brushSizePixels === 0.5 ? (bottom ? -1 : 0) : 0.5;

    const brushCursor = this.editor.sliceRenderer.getBrushCursor(
      this.editor.viewSettings.mainViewType,
    );

    brushCursor.setUVTarget(
      (Math.floor(uv.x * scanWidth) + xOffset) / scanWidth,
      (Math.floor(uv.y * scanHeight) + yOffset) / scanHeight,
    );
  }

  private getDragPoint(uv: THREE.Vector2) {
    if (!this.editor.annotation) return undefined;

    const annotation = this.editor.annotation;

    const dragPoint: DragPoint = {
      x: 0,
      y: 0,
      z: 0,
      right: true,
      bottom: false,
    };

    const [widthAxis, heightAxis] = getPlaneAxes(
      this.editor.viewSettings.mainViewType,
    );
    const orthogonalAxis = getOrthogonalAxis(
      this.editor.viewSettings.mainViewType,
    );

    dragPoint[orthogonalAxis] = this.editor.viewSettings.selectedVoxel[
      orthogonalAxis
    ];
    dragPoint[widthAxis] = Math.floor(uv.x * annotation.voxelCount[widthAxis]);
    dragPoint[heightAxis] = Math.floor(
      uv.y * annotation.voxelCount[heightAxis],
    );

    const scanWidth = annotation.voxelCount[widthAxis];
    const scanHeight = annotation.voxelCount[heightAxis];

    [dragPoint.right, dragPoint.bottom] = getPositionWithinPixel(
      uv,
      scanWidth,
      scanHeight,
    );

    return dragPoint;
  }

  public finishStroke() {
    this.context?.persist();
  }
}
