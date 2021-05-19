import { AbstractEventType } from "@visian/ui-shared";
import {
  getOrthogonalAxis,
  getPlaneAxes,
  ISerializable,
  Pixel,
  ViewType,
} from "@visian/utils";
import { action, computed, makeObservable, observable } from "mobx";
import {
  ToolType,
  Editor,
  StoreContext,
  SliceUndoRedoCommand,
  AtlasUndoRedoCommand,
} from "../../models";
import { RenderedImage } from "../rendered-image";
import { getPositionWithinPixel } from "../slice-renderer";
import { CircleBrush, OutlineTool, ToolRenderer } from "./gpu-tools";
import { SmartBrush } from "./cpu-brush";

import { DragPoint, DragTool } from "./types";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EditorToolsSnapshot {}

export class EditorTools implements ISerializable<EditorToolsSnapshot> {
  public static readonly excludeFromSnapshotTracking = [
    "/editor",
    "/isCursorOverDrawableArea",
    "/isCursorOverFloatingUI",
    "/isNavigationDragged",
    "/isDrawing",
  ];

  public activeTool = ToolType.Brush;

  public isCursorOverDrawableArea = false;
  public isCursorOverFloatingUI = false;
  public isNavigationDragged = false;
  public isDrawing = false;

  private brushWidthScreen = 0.02;
  private lockedBrushSizePixels?: number;

  public smartBrushNeighborThreshold = 6;
  public smartBrushSeedThreshold = 10;

  private toolRenderer: ToolRenderer;

  private brush?: CircleBrush;
  private eraser?: CircleBrush;
  private smartBrush?: SmartBrush;
  private smartEraser?: SmartBrush;
  private outlineTool?: OutlineTool;
  private outlineEraser?: OutlineTool;

  /** A map of the tool types to their corresponding brushes. */
  private toolMap: Partial<Record<ToolType, DragTool>>;
  /**
   * A map of the tool types to their corresponding alternative brushes.
   * This is used for e.g. right-click or back of pen interaction.
   */
  protected altToolMap: Partial<Record<ToolType, DragTool>>;

  constructor(protected editor: Editor, protected context?: StoreContext) {
    makeObservable<
      this,
      "brushWidthScreen" | "lockedBrushSizePixels" | "setIsDrawing"
    >(this, {
      activeTool: observable,
      isCursorOverDrawableArea: observable,
      isCursorOverFloatingUI: observable,
      isNavigationDragged: observable,
      isDrawing: observable,
      smartBrushNeighborThreshold: observable,
      smartBrushSeedThreshold: observable,
      brushWidthScreen: observable,
      lockedBrushSizePixels: observable,

      isBrushSizeLocked: computed,
      brushSizePixels: computed,

      applySnapshot: action,
      setActiveTool: action,
      setIsCursorOverDrawableArea: action,
      setIsCursorOverFloatingUI: action,
      setIsNavigationDragged: action,
      setIsDrawing: action,
      setBrushSizePixels: action,
      setSmartBrushSeedThreshold: action,
      setSmartBrushNeighborThreshold: action,
      lockBrushSize: action,
      resetBrushSize: action,
      resetSmartBrush: action,
    });

    this.toolRenderer = new ToolRenderer(editor);

    this.brush = new CircleBrush(editor, this.toolRenderer);
    this.eraser = new CircleBrush(editor, this.toolRenderer, 0);
    this.smartBrush = new SmartBrush(editor);
    this.smartEraser = new SmartBrush(editor, 0);
    this.outlineTool = new OutlineTool(editor, this.toolRenderer);
    this.outlineEraser = new OutlineTool(editor, this.toolRenderer, 0);

    this.toolMap = {
      [ToolType.Brush]: this.brush,
      [ToolType.Eraser]: this.eraser,
      [ToolType.SmartBrush]: this.smartBrush,
      [ToolType.SmartEraser]: this.smartEraser,
      [ToolType.Outline]: this.outlineTool,
      [ToolType.OutlineEraser]: this.outlineEraser,
    };
    this.altToolMap = {
      [ToolType.Brush]: this.eraser,
      [ToolType.Eraser]: this.brush,
      [ToolType.SmartBrush]: this.smartEraser,
      [ToolType.SmartEraser]: this.smartBrush,
      [ToolType.Outline]: this.outlineEraser,
      [ToolType.OutlineEraser]: this.outlineTool,
    };
  }

  public get canDraw() {
    return Boolean(
      this.isBrushToolSelected &&
        this.isCursorOverDrawableArea &&
        !this.isCursorOverFloatingUI &&
        this.editor.annotation &&
        this.editor.isAnnotationVisible,
    );
  }

  private get isBrushToolSelected() {
    return [
      ToolType.Brush,
      ToolType.Eraser,
      ToolType.SmartBrush,
      ToolType.SmartEraser,
    ].includes(this.activeTool);
  }

  private get isOutlineToolSelected() {
    return [ToolType.Outline, ToolType.OutlineEraser].includes(this.activeTool);
  }

  private get isDrawingToolSelected() {
    return this.isBrushToolSelected || this.isOutlineToolSelected;
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

  public render() {
    this.toolRenderer.render();
  }

  public setActiveTool(tool = this.activeTool) {
    if (this.isDrawing) return;

    // Temporary fix so that brush & eraser don't overwrite smart brush edits.
    if ([ToolType.Brush, ToolType.Eraser].includes(tool)) {
      this.toolRenderer.readCurrentSlice();
    }

    if (tool === ToolType.Crosshair && !this.editor.isIn3DMode) {
      if (this.activeTool === ToolType.Crosshair) {
        this.activeTool = ToolType.Brush;
      }
      return;
    }
    this.activeTool = tool;
  }

  public setIsCursorOverDrawableArea(value = true) {
    this.isCursorOverDrawableArea = value;
  }

  public setIsCursorOverFloatingUI(value = true) {
    this.isCursorOverFloatingUI = value;
  }

  public setIsNavigationDragged(value = true) {
    this.isNavigationDragged = value;
  }

  public setIsDrawing(value = true) {
    this.isDrawing = value;
  }

  public setBrushSizePixels = (value = 5, showPreview = false) => {
    if (this.isDrawing) return;

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

    this.onSliceChanged();

    this.editor.markers.inferAnnotatedSlice(image, slice, viewType, true);
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

    this.onSliceChanged();

    this.editor.markers.clear();
  }

  public onSliceChanged() {
    this.toolRenderer.readCurrentSlice();
  }

  public handleEvent(
    screenPosition: Pixel,
    eventType?: AbstractEventType,
    alt = false,
  ) {
    if (!this.editor.sliceRenderer) {
      this.setIsCursorOverDrawableArea(false);
      return;
    }

    const uv = this.editor.sliceRenderer.getVirtualMainViewUV(screenPosition);

    if (uv.x > 1 || uv.x < 0 || uv.y > 1 || uv.y < 0) {
      this.setIsCursorOverDrawableArea(false);
    } else {
      this.setIsCursorOverDrawableArea();
      this.alignBrushCursor(uv);
    }

    if (
      !eventType ||
      (!this.editor.isAnnotationVisible && this.isDrawingToolSelected)
    ) {
      return;
    }

    const dragPoint = this.getDragPoint(uv, !this.isOutlineToolSelected);
    if (!dragPoint) return;

    const tool = (alt ? this.altToolMap : this.toolMap)[this.activeTool];
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

    this.editor.sliceRenderer.lazyRender();
  }

  public alignBrushCursor(
    uv: Pixel,
    viewType = this.editor.viewSettings.mainViewType,
    preview = false,
  ) {
    if (!this.editor.sliceRenderer || !this.editor.image) return;
    const { voxelCount } = this.editor.image;

    const [widthAxis, heightAxis] = getPlaneAxes(viewType);
    const scanWidth = voxelCount[widthAxis];
    const scanHeight = voxelCount[heightAxis];

    let isRight = false;
    let isBottom = false;
    if (this.brushSizePixels === 0.5) {
      [isRight, isBottom] = getPositionWithinPixel(uv, scanWidth, scanHeight);
    }

    const xOffset = this.brushSizePixels === 0.5 ? (isRight ? 1 : 2) : 0.5;
    const yOffset = this.brushSizePixels === 0.5 ? (isBottom ? -1 : 0) : 0.5;

    const brushCursor = this.editor.sliceRenderer.getBrushCursor(
      viewType,
      preview,
    );

    brushCursor.setUVTarget(
      (Math.floor(uv.x * scanWidth) + xOffset) / scanWidth,
      (Math.floor(uv.y * scanHeight) + yOffset) / scanHeight,
    );
  }

  private getDragPoint(uv: Pixel, floored = true) {
    if (!this.editor.annotation) return undefined;

    const { annotation } = this.editor;

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
    dragPoint[widthAxis] = uv.x * annotation.voxelCount[widthAxis];
    dragPoint[heightAxis] = uv.y * annotation.voxelCount[heightAxis];

    if (floored) {
      dragPoint[widthAxis] = Math.floor(dragPoint[widthAxis]);
      dragPoint[heightAxis] = Math.floor(dragPoint[heightAxis]);
    }

    const scanWidth = annotation.voxelCount[widthAxis];
    const scanHeight = annotation.voxelCount[heightAxis];

    [dragPoint.right, dragPoint.bottom] = getPositionWithinPixel(
      uv,
      scanWidth,
      scanHeight,
    );

    return dragPoint;
  }

  public finishStroke(
    annotation: RenderedImage | undefined,
    slice: number | undefined,
    viewType: ViewType,
    isDeleteOperation?: boolean,
  ) {
    if (slice !== undefined) {
      this.editor.markers.inferAnnotatedSlice(
        annotation,
        slice,
        viewType,
        isDeleteOperation,
      );
    }
    this.context?.persist();
  }
}
