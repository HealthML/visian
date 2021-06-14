import { ToolRenderer } from "@visian/rendering";
import { IDocument, IImageLayer, ITool, ITools } from "@visian/ui-shared";
import { getPlaneAxes, ISerializable } from "@visian/utils";
import { action, computed, makeObservable, observable } from "mobx";
import { CircleBrush } from "./circle-brush";
import { ClearImageTool } from "./clear-image-tool";
import { ClearSliceTool } from "./clear-slice-tool";
import { SmartBrush } from "./cpu-brush";
import { CrosshairTool } from "./crosshair-tool";
import { OutlineTool } from "./outline-tool";
import { Tool, ToolSnapshot } from "./tool";

import { ToolGroup, ToolGroupSnapshot } from "./tool-group";

export type ToolName =
  | "navigation-tool"
  | "crosshair-tool"
  | "pixel-brush"
  | "pixel-eraser"
  | "smart-brush"
  | "smart-eraser"
  | "outline-tool"
  | "outline-eraser"
  | "clear-slice"
  | "clear-image"
  | "fly-tool";

export interface ToolsSnapshot<N extends string> {
  activeToolName?: N;
  tools: ToolSnapshot<N>[];
  toolGroups: ToolGroupSnapshot<N>[];

  brushSize: number;
  lockedBrushSize?: number;
}

export class Tools
  implements ITools<ToolName>, ISerializable<ToolsSnapshot<ToolName>> {
  public readonly excludeFromSnapshotTracking = [
    "document",
    "isCursorOverDrawableArea",
    "isCursorOverFloatingUI",
    "isNavigationDragged",
    "isDrawing",
  ];

  protected activeToolName?: ToolName;
  public tools: Record<ToolName, Tool<ToolName>>;
  public toolGroups: ToolGroup<ToolName>[] = [];

  private screenSpaceBrushSize = 0.02;
  private lockedBrushSize?: number;

  protected isCursorOverDrawableArea = false;
  protected isCursorOverFloatingUI = false;
  protected isNavigationDragged = false;
  public isDrawing = false;

  public toolRenderer: ToolRenderer;

  constructor(
    snapshot: Partial<ToolsSnapshot<ToolName>> | undefined,
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
      | "resetBrushSettings"
    >(this, {
      activeToolName: observable,
      tools: observable,
      toolGroups: observable,
      screenSpaceBrushSize: observable,
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
      useAdaptiveBrushSize: computed,

      setActiveTool: action,
      setBrushSize: action,
      setUseAdaptiveBrushSize: action,
      setIsCursorOverDrawableArea: action,
      setIsCursorOverFloatingUI: action,
      setIsNavigationDragged: action,
      setIsDrawing: action,
      resetBrushSettings: action,
      resetActiveToolSetings: action,
      applySnapshot: action,
    });

    this.toolRenderer = new ToolRenderer(document);

    this.tools = {
      "navigation-tool": new Tool(
        {
          name: "navigation-tool",
          icon: "navigationTool",
          labelTx: "navigation-tool",
          supportedViewModes: ["2D", "3D"],
        },
        this.document,
      ),
      "crosshair-tool": new CrosshairTool(document),
      "pixel-brush": new CircleBrush(document, this.toolRenderer),
      "pixel-eraser": new CircleBrush(document, this.toolRenderer, 0),
      "smart-brush": new SmartBrush(document),
      "smart-eraser": new SmartBrush(document, 0),
      "outline-tool": new OutlineTool(document, this.toolRenderer),
      "outline-eraser": new OutlineTool(document, this.toolRenderer, 0),
      "clear-slice": new ClearSliceTool(document, this.toolRenderer),
      "clear-image": new ClearImageTool(document, this.toolRenderer),
      "fly-tool": new Tool(
        {
          name: "fly-tool",
          icon: "crosshairPointer",
          labelTx: "fly-tool",
          supportedViewModes: ["3D"],
        },
        this.document,
      ),
    };

    this.toolGroups.push(
      new ToolGroup({ toolNames: ["navigation-tool"] }, document),
      new ToolGroup({ toolNames: ["crosshair-tool"] }, document),
      new ToolGroup({ toolNames: ["pixel-brush"] }, document),
      new ToolGroup({ toolNames: ["smart-brush", "smart-eraser"] }, document),
      new ToolGroup(
        { toolNames: ["outline-tool", "outline-eraser"] },
        document,
      ),
      new ToolGroup(
        { toolNames: ["pixel-eraser", "smart-eraser", "outline-eraser"] },
        document,
      ),
      new ToolGroup({ toolNames: ["clear-slice", "clear-image"] }, document),
      new ToolGroup({ toolNames: ["fly-tool"] }, document),
    );

    this.applySnapshot(snapshot);
  }

  protected getDefaultToolName(): ToolName {
    return "navigation-tool";
  }

  public get activeTool(): ITool<ToolName> | undefined {
    const toolName =
      this.activeToolName === "crosshair-tool" && !this.document?.has3DLayers
        ? "pixel-brush"
        : this.activeToolName;
    const tool = toolName ? this.tools[toolName] : undefined;

    return tool && !tool.canActivate()
      ? this.tools[this.getDefaultToolName()]
      : tool;
  }

  public setActiveTool(nameOrTool?: ToolName | ITool<ToolName>): void {
    if (this.isDrawing) return;

    const previouslyActiveTool = this.activeTool;

    this.activeToolName = nameOrTool
      ? typeof nameOrTool === "string"
        ? nameOrTool
        : nameOrTool.name
      : "pixel-brush";

    if (this.activeTool?.canActivate()) {
      this.activeTool.activate(previouslyActiveTool);
    }
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
        this.document.activeLayer?.isVisible,
    );
  }

  public get isToolInUse(): boolean {
    return (
      (this.activeToolName === "navigation-tool" && this.isNavigationDragged) ||
      this.isDrawing
    );
  }

  public get useAdaptiveBrushSize(): boolean {
    return this.lockedBrushSize === undefined;
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

  public setUseAdaptiveBrushSize = (value?: boolean): void => {
    if (value) {
      const previousValue = this.lockedBrushSize;
      this.lockedBrushSize = undefined;
      this.setBrushSize(previousValue);
    } else {
      this.lockedBrushSize = this.brushSize;
    }
  };

  public incrementBrushSize() {
    // Allow brush size 0.5.
    const increment = this.brushSize < 1 ? 0.5 : 1;
    this.setBrushSize(this.brushSize + increment);
  }

  public decrementBrushSize() {
    // Allow brush size 0.5.
    const decrement = this.brushSize <= 1 ? 0.5 : 1;
    this.setBrushSize(this.brushSize - decrement);
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

  public handleCurrentSliceChanged() {
    this.toolRenderer.handleCurrentSliceChanged();
  }

  protected resetBrushSettings(): void {
    this.setUseAdaptiveBrushSize();
    this.setBrushSize();
  }

  public resetActiveToolSetings = (): void => {
    const { activeTool } = this;
    if (!activeTool) return;
    if (activeTool.isBrush) this.resetBrushSettings();
    Object.values(activeTool.params).forEach((param) => {
      param.reset();
    });
  };

  // Serialization
  public toJSON(): ToolsSnapshot<ToolName> {
    return {
      activeToolName: this.activeToolName,
      tools: Object.values(this.tools).map((tool) => tool.toJSON()),
      toolGroups: this.toolGroups.map((toolGroup) => toolGroup.toJSON()),
      brushSize: this.brushSize,
      lockedBrushSize: this.lockedBrushSize,
    };
  }

  public applySnapshot(
    snapshot?: Partial<ToolsSnapshot<ToolName>>,
  ): Promise<void> {
    this.setActiveTool(snapshot?.activeToolName);
    snapshot?.tools?.forEach((toolSnapshot) => {
      const tool = this.tools[toolSnapshot.name];
      if (tool) tool.applySnapshot(toolSnapshot);
    });
    this.toolGroups.forEach((toolGroup, index) => {
      const toolGroupSnapshot = snapshot?.toolGroups?.[index];
      if (toolGroupSnapshot) toolGroup.applySnapshot(toolGroupSnapshot);
    });

    this.setBrushSize(snapshot?.brushSize);
    this.lockedBrushSize = snapshot?.lockedBrushSize;

    return Promise.resolve();
  }
}
