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
import { Tool } from "../types";
import { Brush } from "./brush";
import { DragPoint } from "./types";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EditorToolsSnapshot {}

export class EditorTools implements ISerializable<EditorToolsSnapshot> {
  public static readonly excludeFromSnapshotTracking = ["/editor"];

  public activeTool = Tool.Brush;
  public isCursorOverDrawableArea = false;

  public brushSizePixels = 0.5;

  private brush?: Brush;
  private eraser?: Brush;

  /** A map of the tool types to their corresponding brushes. */
  private brushMap?: Partial<Record<Tool, Brush>>;
  /**
   * A map of the tool types to their corresponding alternative brushes.
   * This is used for e.g. right-click or back of pen interaction.
   */
  protected altBrushMap?: Partial<Record<Tool, Brush>>;

  constructor(protected editor: Editor, protected context?: StoreContext) {
    this.brush = new Brush(this.editor);
    this.eraser = new Brush(this.editor, 0);

    this.brushMap = {
      [Tool.Brush]: this.brush,
      [Tool.Eraser]: this.eraser,
    };
    this.altBrushMap = {
      [Tool.Brush]: this.eraser,
      [Tool.Eraser]: this.brush,
    };

    makeObservable(this, {
      activeTool: observable,
      isCursorOverDrawableArea: observable,
      brushSizePixels: observable,

      isBrushToolSelected: computed,

      applySnapshot: action,
      setActiveTool: action,
      setCursorOverDrawableArea: action,
      setBrushSizePixels: action,
    });
  }

  public get isBrushToolSelected() {
    return [Tool.Brush, Tool.Eraser].includes(this.activeTool);
  }

  public setActiveTool(tool = Tool.Brush) {
    this.activeTool = tool;
  }

  public setCursorOverDrawableArea(value = true) {
    this.isCursorOverDrawableArea = value;
  }

  public setBrushSizePixels(value = 5) {
    this.brushSizePixels = value;
  }

  public toJSON() {
    return {};
  }

  public async applySnapshot(snapshot: EditorToolsSnapshot) {
    // Intentionally left blank
  }

  public handleEvent(
    screenPosition: Pixel,
    eventType?: AbstractEventType,
    alt = false,
  ) {
    if (!this.editor.sliceRenderer || !this.brushMap || !this.altBrushMap)
      return;

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
    if (!this.editor.sliceRenderer || !this.editor.annotation) return;
    const annotation = this.editor.annotation;

    const [widthAxis, heightAxis] = getPlaneAxes(
      this.editor.viewSettings.mainViewType,
    );
    const scanWidth = annotation.voxelCount[widthAxis];
    const scanHeight = annotation.voxelCount[heightAxis];

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
}
