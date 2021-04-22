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

  public activeTool = ToolType.Brush;

  public isCursorOverDrawableArea = false;
  public isNavigationDragged = false;
  public isDrawing = false;

  private brushWidthScreen = 0.02;
  private lockedBrushSizePixels?: number;

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

    makeObservable<
      this,
      "brushWidthScreen" | "lockedBrushSizePixels" | "setIsDrawing"
    >(this, {
      activeTool: observable,
      isCursorOverDrawableArea: observable,
      isNavigationDragged: observable,
      isDrawing: observable,
      smartBrushNeighborThreshold: observable,
      smartBrushSeedThreshold: observable,
      brushWidthScreen: observable,
      lockedBrushSizePixels: observable,

      isBrushToolSelected: computed,
      isBrushSizeLocked: computed,
      brushSizePixels: computed,

      applySnapshot: action,
      setActiveTool: action,
      setCursorOverDrawableArea: action,
      setIsNavigationDragged: action,
      setIsDrawing: action,
      setBrushSizePixels: action,
      setSmartBrushSeedThreshold: action,
      setSmartBrushNeighborThreshold: action,
      lockBrushSize: action,
      resetBrushSize: action,
      resetSmartBrush: action,
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

  public get isCrosshairAvailable() {
    return (
      this.editor.image &&
      this.editor.image.dimensionality > 2 &&
      this.editor.viewSettings.showSideViews
    );
  }

  public get isBrushSizeLocked() {
    return this.lockedBrushSizePixels !== undefined;
  }

  public get brushSizePixels() {
    if (this.lockedBrushSizePixels !== undefined) {
      return this.lockedBrushSizePixels;
    }

    const pixelWidth = this.editor.viewSettings.pixelSize?.x;

    // Size is rounded to the closest 0.5 step, to allow pixelSize 0.5 for the 2x2 brush.
    const size = pixelWidth
      ? Math.round((this.brushWidthScreen / pixelWidth - 0.5) * 2) / 2
      : 0;

    return Math.max(
      0,
      // This should only be an integer or 0.5.
      size > 1 ? Math.round(size) : size,
    );
  }

  public setActiveTool(tool = this.activeTool) {
    if (
      tool === ToolType.Crosshair &&
      this.editor.image &&
      this.editor.image.dimensionality < 3
    ) {
      if (this.activeTool === ToolType.Crosshair) {
        this.activeTool = ToolType.Brush;
      }
      return;
    }
    this.activeTool = tool;
  }

  public setCursorOverDrawableArea(value = true) {
    this.isCursorOverDrawableArea = value;
  }

  public setIsNavigationDragged(value = true) {
    this.isNavigationDragged = value;
  }

  public setIsDrawing(value = true) {
    this.isDrawing = value;
  }

  public setBrushSizePixels = (value = 5, showPreview = false) => {
    const clampedValue = Math.max(0, value);

    if (this.isBrushSizeLocked) {
      this.lockedBrushSizePixels =
        clampedValue < 1 && clampedValue > 0 ? 0.5 : Math.round(clampedValue);
    }

    const pixelWidth = this.editor.viewSettings.pixelSize?.x;

    if (!pixelWidth) return;

    this.brushWidthScreen = (clampedValue + 0.5) * pixelWidth;

    if (!showPreview) return;
    this.editor.sliceRenderer?.showBrushCursorPreview();
  };

  public setSmartBrushSeedThreshold = (value = 6) => {
    this.smartBrushSeedThreshold = value;
  };

  public setSmartBrushNeighborThreshold = (value = 10) => {
    this.smartBrushNeighborThreshold = value;
  };

  public lockBrushSize = (shouldLock = true) => {
    if (shouldLock) {
      this.lockedBrushSizePixels = this.brushSizePixels;
    } else {
      const previousValue = this.lockedBrushSizePixels;
      this.lockedBrushSizePixels = undefined;
      this.setBrushSizePixels(previousValue);
    }
  };

  public incrementBrushSize() {
    // Allow brush size 0.5.
    const increment = this.brushSizePixels < 1 ? 0.5 : 1;
    this.setBrushSizePixels(this.brushSizePixels + increment);
  }

  public decrementBrushSize() {
    // Allow brush size 0.5.
    const decrement = this.brushSizePixels <= 1 ? 0.5 : 1;
    this.setBrushSizePixels(this.brushSizePixels - decrement);
  }

  public resetBrushSize = () => {
    this.lockBrushSize(false);
    this.brushWidthScreen = 0.02;
  };

  public resetSmartBrush = () => {
    this.resetBrushSize();
    this.smartBrushNeighborThreshold = 6;
    this.smartBrushSeedThreshold = 10;
  };

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
    if (
      !eventType ||
      (!this.editor.isAnnotationVisible && this.isBrushToolSelected)
    ) {
      return;
    }

    const dragPoint = this.getDragPoint(intersection.uv);
    if (!dragPoint) return;

    const tool = (alt ? this.altBrushMap : this.brushMap)[this.activeTool];
    switch (eventType) {
      case "start":
        this.setIsDrawing(true);
        this.context?.setDirty();
        tool?.startAt(dragPoint);
        break;
      case "move":
        this.context?.setDirty();
        tool?.moveTo(dragPoint);
        break;
      case "end":
        this.setIsDrawing(false);
        tool?.endAt(dragPoint);
        break;
    }
  }

  public alignBrushCursor(
    uv: THREE.Vector2,
    viewType = this.editor.viewSettings.mainViewType,
    preview = false,
  ) {
    if (!this.editor.sliceRenderer || !this.editor.image) return;
    const { voxelCount } = this.editor.image;

    const [widthAxis, heightAxis] = getPlaneAxes(viewType);
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
      viewType,
      preview,
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
