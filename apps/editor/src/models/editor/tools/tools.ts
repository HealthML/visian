import { IDocument, IImageLayer, ITool, ITools } from "@visian/ui-shared";
import { getPlaneAxes, ISerializable } from "@visian/utils";
import { action, computed, makeObservable, observable } from "mobx";
import { Tool, ToolSnapshot } from "./tool";

import { ToolGroup, ToolGroupSnapshot } from "./tool-group";

export interface ToolsSnapshot {
  activeToolName?: string;
  tools: ToolSnapshot[];
  toolGroups: ToolGroupSnapshot[];

  brushSize: number;
  useAdaptiveBrushSize: boolean;
}

export class Tools implements ITools, ISerializable<ToolsSnapshot> {
  public readonly excludeFromSnapshotTracking = ["document"];

  protected activeToolName?: string;
  public tools: { [name: string]: Tool } = {};
  public toolGroups: ToolGroup[] = [];

  private screenSpaceBrushSize = 0.02;
  public useAdaptiveBrushSize!: boolean;
  private lockedBrushSize?: number;

  protected isCursorOverDrawableArea = false;
  protected isCursorOverFloatingUI = false;
  protected isNavigationDragged = false;
  protected isDrawing = false;

  constructor(
    snapshot: Partial<ToolsSnapshot> | undefined,
    protected document: IDocument,
  ) {
    makeObservable<
      this,
      | "activeToolName"
      | "pixelWidth"
      | "screenSpaceBrushSize"
      | "lockedBrushSize"
      | "isCursorOverDrawableArea"
      | "isCursorOverFloatingUI"
      | "isNavigationDragged"
      | "isDrawing"
    >(this, {
      activeToolName: observable,
      tools: observable,
      toolGroups: observable,
      screenSpaceBrushSize: observable,
      useAdaptiveBrushSize: observable,
      lockedBrushSize: observable,
      isCursorOverDrawableArea: observable,
      isCursorOverFloatingUI: observable,
      isNavigationDragged: observable,
      isDrawing: observable,

      activeTool: computed,
      pixelWidth: computed,
      brushSize: computed,
      canDraw: computed,
      isToolInUse: computed,

      setActiveTool: action,
      setBrushSize: action,
      setUseAdaptiveBrushSize: action,
      setIsCursorOverDrawableArea: action,
      setIsCursorOverFloatingUI: action,
      setIsNavigationDragged: action,
      setIsDrawing: action,
      applySnapshot: action,
    });

    // TODO: The tools & tool groups should be populated here
    if (snapshot) this.applySnapshot(snapshot);
  }

  public get activeTool(): ITool | undefined {
    return this.activeToolName ? this.tools[this.activeToolName] : undefined;
  }

  private get pixelWidth() {
    const { activeLayer } = this.document;
    if (!activeLayer || activeLayer.kind !== "image") return undefined;

    const [width] = getPlaneAxes(this.document.viewport2D.mainViewType);

    return (
      this.document.viewport2D.zoomLevel /
      (activeLayer as IImageLayer).image.voxelCount[width]
    );
  }

  public get brushSize() {
    if (this.lockedBrushSize !== undefined) {
      return this.lockedBrushSize;
    }

    // Size is rounded to the closest 0.5 step, to allow pixelSize 0.5 for the 2x2 brush.
    const size = this.pixelWidth
      ? Math.round((this.screenSpaceBrushSize / this.pixelWidth - 0.5) * 2) / 2
      : 0;

    return Math.max(
      0,
      // This should only be an integer or 0.5.
      size > 1 ? Math.round(size) : size,
    );
  }

  public get canDraw(): boolean {
    return Boolean(
      this.activeTool?.isBrush &&
        this.isCursorOverDrawableArea &&
        !this.isCursorOverFloatingUI &&
        this.document.activeLayer?.isAnnotation &&
        this.document.activeLayer.isVisible,
    );
  }

  public get isToolInUse(): boolean {
    return (
      (this.activeToolName === "move" && this.isNavigationDragged) ||
      this.isDrawing
    );
  }

  public setActiveTool(nameOrTool?: string | ITool): void {
    const previouslyActiveTool = this.activeTool;
    this.activeToolName = nameOrTool
      ? typeof nameOrTool === "string"
        ? nameOrTool
        : nameOrTool.name
      : undefined;
    this.activeTool?.activate(previouslyActiveTool);
  }

  public setBrushSize(value = 5, showPreview = false): void {
    if (this.isDrawing) return;

    const clampedValue = Math.max(0, value);

    if (!this.useAdaptiveBrushSize) {
      this.lockedBrushSize =
        clampedValue < 1 && clampedValue > 0 ? 0.5 : Math.round(clampedValue);
    }

    if (!this.pixelWidth) return;

    this.screenSpaceBrushSize = (clampedValue + 0.5) * this.pixelWidth;

    if (!showPreview) return;
    this.document.sliceRenderer?.showBrushCursorPreview();
  }

  public setUseAdaptiveBrushSize(value?: boolean): void {
    if (value) {
      const previousValue = this.lockedBrushSize;
      this.lockedBrushSize = undefined;
      this.setBrushSize(previousValue);
    } else {
      this.lockedBrushSize = this.brushSize;
    }
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

  // Serialization
  public toJSON(): ToolsSnapshot {
    return {
      activeToolName: this.activeToolName,
      tools: Object.values(this.tools).map((tool) => tool.toJSON()),
      toolGroups: this.toolGroups.map((toolGroup) => toolGroup.toJSON()),
      brushSize: this.brushSize,
      useAdaptiveBrushSize: this.useAdaptiveBrushSize,
    };
  }

  public applySnapshot(snapshot: Partial<ToolsSnapshot>): Promise<void> {
    this.setActiveTool(snapshot.activeToolName);
    snapshot.tools?.forEach((toolSnapshot) => {
      const tool = this.tools[toolSnapshot.name];
      if (tool) tool.applySnapshot(toolSnapshot);
    });
    this.toolGroups.forEach((toolGroup, index) => {
      const toolGroupSnapshot = snapshot.toolGroups?.[index];
      if (toolGroupSnapshot) toolGroup.applySnapshot(toolGroupSnapshot);
    });

    this.setBrushSize(snapshot.brushSize);
    this.setUseAdaptiveBrushSize(snapshot.useAdaptiveBrushSize);

    return Promise.resolve();
  }
}
