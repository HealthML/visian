import { AbstractEventType } from "@visian/ui-shared";
import { ISerializable, ViewType } from "@visian/utils";
import { action, makeObservable, observable } from "mobx";
import * as THREE from "three";

import { Brush } from "../../annotating";
import { getPositionWithinPixel, SliceRenderer } from "../../rendering";
import { StoreContext } from "../types";
import { Tool } from "./types";

import type { Editor } from "./editor";
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EditorToolsSnapshot {}

export class EditorTools implements ISerializable<EditorToolsSnapshot> {
  public static readonly excludeFromSnapshotTracking = ["/editor"];

  public activeTool = Tool.Crosshair;

  public brushSizePixels = 0;

  private sliceRenderer?: SliceRenderer;

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
    makeObservable(this, {
      activeTool: observable,
      brushSizePixels: observable,

      applySnapshot: action,
      setActiveTool: action,
      setBrushSizePixels: action,
    });
  }

  public setActiveTool(tool = Tool.Brush) {
    this.activeTool = tool;
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

  public setSliceRenderer(sliceRenderer?: SliceRenderer) {
    this.sliceRenderer = sliceRenderer;

    if (sliceRenderer) {
      this.brush = new Brush(this.editor, sliceRenderer.lazyRender);
      this.eraser = new Brush(this.editor, sliceRenderer.lazyRender, 0);

      this.brushMap = {
        [Tool.Brush]: this.brush,
        [Tool.Eraser]: this.eraser,
      };
      this.altBrushMap = {
        [Tool.Brush]: this.eraser,
        [Tool.Eraser]: this.brush,
      };
    } else {
      this.brush = undefined;
      this.eraser = undefined;

      this.brushMap = undefined;
      this.altBrushMap = undefined;
    }
  }

  public handleEvent(
    eventType: AbstractEventType,
    screenPosition: { x: number; y: number },
    alt = false,
  ) {
    if (!this.sliceRenderer || !this.brushMap || !this.altBrushMap) return;

    const intersection = this.sliceRenderer.raycaster.getIntersectionsFromPointer(
      screenPosition,
    )[0];
    if (!intersection || !intersection.uv) return;

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

  private getDragPoint(uv: THREE.Vector2) {
    if (!this.editor.annotation) return undefined;

    const scanWidth =
      this.editor.viewSettings.mainViewType === ViewType.Sagittal
        ? this.editor.annotation.voxelCount.y
        : this.editor.annotation.voxelCount.x;
    const scanHeight =
      this.editor.viewSettings.mainViewType === ViewType.Transverse
        ? this.editor.annotation.voxelCount.y
        : this.editor.annotation.voxelCount.z;

    const [left, bottom] = getPositionWithinPixel(uv, scanWidth, scanHeight);

    switch (this.editor.viewSettings.mainViewType) {
      case ViewType.Transverse:
        return {
          x: Math.floor(uv.x * this.editor.annotation.voxelCount.x),
          y: Math.floor(uv.y * this.editor.annotation.voxelCount.y),
          z: this.editor.viewSettings.selectedVoxel.z,
          left,
          bottom,
        };
      case ViewType.Sagittal:
        return {
          x:
            this.editor.annotation.voxelCount.x -
            1 -
            this.editor.viewSettings.selectedVoxel.x,
          y:
            this.editor.annotation.voxelCount.y -
            1 -
            Math.floor(uv.x * this.editor.annotation.voxelCount.y),
          z: Math.floor(uv.y * this.editor.annotation.voxelCount.z),
          left,
          bottom,
        };
      case ViewType.Coronal:
        return {
          x: Math.floor(uv.x * this.editor.annotation.voxelCount.x),
          y: this.editor.viewSettings.selectedVoxel.y,
          z: Math.floor(uv.y * this.editor.annotation.voxelCount.z),
          left,
          bottom,
        };
    }
  }
}
