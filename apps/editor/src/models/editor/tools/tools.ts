import * as THREE from "three";
import {
  DilateErodeRenderer3D,
  RegionGrowingRenderer,
  RegionGrowingRenderer3D,
  ToolRenderer,
} from "@visian/rendering";
import {
  IDocument,
  IImageLayer,
  ITool,
  ITools,
  MergeFunction,
} from "@visian/ui-shared";
import { getPlaneAxes, IDisposable, ISerializable } from "@visian/utils";
import { action, computed, makeObservable, observable } from "mobx";
import { CircleBrush } from "./circle-brush";
import { ClearImageTool } from "./clear-image-tool";
import { ClearSliceTool } from "./clear-slice-tool";
import { SmartBrush } from "./smart-brush";
import { CrosshairTool } from "./crosshair-tool";
import { OutlineTool } from "./outline-tool";
import { Tool, ToolSnapshot } from "./tool";

import { ToolGroup, ToolGroupSnapshot } from "./tool-group";
import { BoundedSmartBrush } from "./bounded-smart-brush";
import { PlaneTool } from "./plane-tool";
import { SmartBrush3D } from "./smart-brush-3d";
import { DilateErodeTool } from "./dilate-erode-tool";
import { SelfDeactivatingTool } from "./self-deactivating-tool";
import { UndoableTool } from "./undoable-tool";
import { MeasurementTool } from "./measurement-tool";

export type ToolName =
  | "navigation-tool"
  | "crosshair-tool"
  | "pixel-brush"
  | "pixel-eraser"
  | "smart-brush"
  | "smart-brush-3d"
  | "smart-eraser"
  | "bounded-smart-brush"
  | "bounded-smart-eraser"
  | "outline-tool"
  | "outline-eraser"
  | "clear-slice"
  | "clear-image"
  | "dilate-erode"
  | "plane-tool"
  | "fly-tool"
  | "measurement-tool";

export interface ToolsSnapshot<N extends string> {
  activeToolName?: N;
  tools: ToolSnapshot<N>[];
  toolGroups: ToolGroupSnapshot<N>[];

  brushSize: number;
  lockedBrushSize?: number;
  smartBrushThreshold: number;
  boundedSmartBrushRadius: number;
}

export class Tools
  implements
    ITools<ToolName>,
    ISerializable<ToolsSnapshot<ToolName>>,
    IDisposable {
  public readonly excludeFromSnapshotTracking = [
    "document",
    "isCursorOverDrawableArea",
    "isCursorOverFloatingUI",
    "isNavigationDragged",
    "isDrawing",
    "regionGrowingRenderer",
    "regionGrowingRenderer3D",
    "dilateErodeRenderer3D",
  ];

  protected activeToolName?: ToolName;
  public tools: Record<ToolName, Tool<ToolName>>;
  public toolGroups: ToolGroup<ToolName>[] = [];

  private screenSpaceBrushSize = 0.02;
  private lockedBrushSize?: number;

  public smartBrushThreshold = 5;
  public boundedSmartBrushRadius = 7;

  public isCursorOverFloatingUI = false;
  protected isNavigationDragged = false;
  public isDrawing = false;

  public toolRenderer: ToolRenderer;
  public regionGrowingRenderer: RegionGrowingRenderer;
  public regionGrowingRenderer3D: RegionGrowingRenderer3D;
  public dilateErodeRenderer3D: DilateErodeRenderer3D;

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
      | "isNavigationDragged"
      | "resetBrushSettings"
    >(this, {
      activeToolName: observable,
      tools: observable,
      toolGroups: observable,
      screenSpaceBrushSize: observable,
      lockedBrushSize: observable,
      smartBrushThreshold: observable,
      boundedSmartBrushRadius: observable,
      isCursorOverFloatingUI: observable,
      isNavigationDragged: observable,
      isDrawing: observable,

      activeTool: computed,
      pixelWidth: computed,
      brushSize: computed,
      isCursorOverDrawableArea: computed,
      canDraw: computed,
      isToolInUse: computed,
      useAdaptiveBrushSize: computed,
      layerPreviewTexture: computed,
      slicePreviewTexture: computed,
      slicePreviewMergeFunction: computed,

      setActiveTool: action,
      setBrushSize: action,
      setUseAdaptiveBrushSize: action,
      setSmartBrushThreshold: action,
      setBoundedSmartBrushRadius: action,
      setIsCursorOverFloatingUI: action,
      setIsNavigationDragged: action,
      setIsDrawing: action,
      resetBrushSettings: action,
      resetActiveToolSetings: action,
      applySnapshot: action,
    });

    this.toolRenderer = new ToolRenderer(document);
    this.regionGrowingRenderer = new RegionGrowingRenderer(document);
    this.regionGrowingRenderer3D = new RegionGrowingRenderer3D(document);
    this.dilateErodeRenderer3D = new DilateErodeRenderer3D(document);

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
      "pixel-eraser": new CircleBrush(document, this.toolRenderer, false),
      "smart-brush": new SmartBrush(document, this.regionGrowingRenderer),
      "smart-eraser": new SmartBrush(
        document,
        this.regionGrowingRenderer,
        false,
      ),
      "bounded-smart-brush": new BoundedSmartBrush(
        document,
        this.regionGrowingRenderer,
      ),
      "bounded-smart-eraser": new BoundedSmartBrush(
        document,
        this.regionGrowingRenderer,
        false,
      ),
      "smart-brush-3d": new SmartBrush3D(
        document,
        this.regionGrowingRenderer3D,
      ),
      "outline-tool": new OutlineTool(document, this.toolRenderer),
      "outline-eraser": new OutlineTool(document, this.toolRenderer, false),
      "clear-slice": new ClearSliceTool(document, this.toolRenderer),
      "clear-image": new ClearImageTool(document, this.toolRenderer),
      "dilate-erode": new DilateErodeTool(document, this.dilateErodeRenderer3D),
      "plane-tool": new PlaneTool(document),
      "fly-tool": new Tool(
        {
          name: "fly-tool",
          icon: "crosshairPointer",
          labelTx: "fly-tool",
          supportedViewModes: ["3D"],
        },
        document,
      ),
      "measurement-tool": new MeasurementTool(document),
    };

    this.toolGroups.push(
      new ToolGroup({ toolNames: ["navigation-tool"] }, document),
      new ToolGroup({ toolNames: ["crosshair-tool"] }, document),
      new ToolGroup({ toolNames: ["pixel-brush"] }, document),
      new ToolGroup({ toolNames: ["smart-brush", "smart-eraser"] }, document),
      new ToolGroup(
        { toolNames: ["bounded-smart-brush", "bounded-smart-eraser"] },
        document,
      ),
      new ToolGroup({ toolNames: ["smart-brush-3d"] }, document),
      new ToolGroup(
        { toolNames: ["outline-tool", "outline-eraser"] },
        document,
      ),
      new ToolGroup(
        { toolNames: ["pixel-eraser", "smart-eraser", "outline-eraser"] },
        document,
      ),
      new ToolGroup({ toolNames: ["clear-slice", "clear-image"] }, document),
      new ToolGroup({ toolNames: ["dilate-erode"] }, document),
      new ToolGroup({ toolNames: ["plane-tool"] }, document),
      new ToolGroup({ toolNames: ["fly-tool"] }, document),
      new ToolGroup({ toolNames: ["measurement-tool"] }, document),
    );

    if (snapshot) this.applySnapshot(snapshot);
  }

  public dispose() {
    this.toolRenderer.dispose();
    this.regionGrowingRenderer.dispose();
    this.regionGrowingRenderer3D.dispose();
    this.dilateErodeRenderer3D.dispose();
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
      previouslyActiveTool?.deactivate(this.tools[this.activeToolName]);
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

  protected get isCursorOverDrawableArea() {
    return (
      this.document.viewport2D.hoveredViewType ===
        this.document.viewport2D.mainViewType &&
      this.document.viewport2D.hoveredUV.x <= 1 &&
      this.document.viewport2D.hoveredUV.x >= 0 &&
      this.document.viewport2D.hoveredUV.y <= 1 &&
      this.document.viewport2D.hoveredUV.y >= 0
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

  public get layerPreviewTexture(): THREE.Texture {
    return this.regionGrowingRenderer3D.outputTexture;
  }

  public get slicePreviewTexture(): THREE.Texture | undefined {
    if (!(this.activeTool instanceof UndoableTool)) return undefined;

    return this.activeTool.toolRenderer.texture;
  }

  public get slicePreviewMergeFunction(): MergeFunction | undefined {
    if (!(this.activeTool instanceof UndoableTool)) return undefined;

    return this.activeTool.toolRenderer.mergeFunction;
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
    if (
      this.activeTool?.name === "bounded-smart-brush" ||
      this.activeTool?.name === "bounded-smart-eraser"
    ) {
      this.setBoundedSmartBrushRadius(this.boundedSmartBrushRadius + 1);
      return;
    }

    // Allow brush size 0.5.
    const increment = this.brushSize < 1 ? 0.5 : 1;
    this.setBrushSize(this.brushSize + increment);
  }

  public decrementBrushSize() {
    if (
      this.activeTool?.name === "bounded-smart-brush" ||
      this.activeTool?.name === "bounded-smart-eraser"
    ) {
      this.setBoundedSmartBrushRadius(this.boundedSmartBrushRadius - 1);
      return;
    }

    // Allow brush size 0.5.
    const decrement = this.brushSize <= 1 ? 0.5 : 1;
    this.setBrushSize(this.brushSize - decrement);
  }

  public setSmartBrushThreshold(value = 5) {
    this.smartBrushThreshold = Math.max(0, value);
  }

  public setBoundedSmartBrushRadius(value = 7, showPreview = false) {
    this.boundedSmartBrushRadius = Math.min(40, Math.max(3, value));

    if (!showPreview) return;
    this.document.sliceRenderer?.showBrushCursorPreview();
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

  protected resetBrushSettings(): void {
    this.setUseAdaptiveBrushSize();
    this.setBrushSize();
  }

  public resetActiveToolSetings = (): void => {
    const { activeTool } = this;
    if (!activeTool) return;
    if (
      activeTool.isBrush &&
      !(
        this.activeTool?.name === "bounded-smart-brush" ||
        this.activeTool?.name === "bounded-smart-eraser"
      )
    ) {
      this.resetBrushSettings();
    }
    if (activeTool.isSmartBrush) this.setSmartBrushThreshold();
    if (
      this.activeTool?.name === "bounded-smart-brush" ||
      this.activeTool?.name === "bounded-smart-eraser"
    )
      this.setBoundedSmartBrushRadius();
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
      smartBrushThreshold: this.smartBrushThreshold,
      boundedSmartBrushRadius: this.boundedSmartBrushRadius,
    };
  }

  public applySnapshot(
    snapshot: Partial<ToolsSnapshot<ToolName>>,
  ): Promise<void> {
    snapshot.tools?.forEach((toolSnapshot) => {
      const tool = this.tools[toolSnapshot.name];
      if (tool) tool.applySnapshot(toolSnapshot);
    });
    this.setActiveTool(
      !snapshot.activeToolName ||
        !(this.tools[snapshot.activeToolName] as SelfDeactivatingTool<ToolName>)
          ?.isSelfDeactivating
        ? snapshot.activeToolName
        : undefined,
    );
    this.toolGroups.forEach((toolGroup, index) => {
      const toolGroupSnapshot = snapshot.toolGroups?.[index];
      if (toolGroupSnapshot) toolGroup.applySnapshot(toolGroupSnapshot);
    });

    this.setBrushSize(snapshot.brushSize);
    this.lockedBrushSize = snapshot.lockedBrushSize;
    this.setSmartBrushThreshold(snapshot.smartBrushThreshold);
    this.setBoundedSmartBrushRadius(snapshot.boundedSmartBrushRadius);

    return Promise.resolve();
  }
}
