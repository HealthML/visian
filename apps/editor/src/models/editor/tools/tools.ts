import { IDocument, ITool, IToolGroup, ITools } from "@visian/ui-shared";
import { ISerializable } from "@visian/utils";
import { action, computed, makeObservable, observable } from "mobx";

export interface ToolsSnapshot {
  activeToolName?: string;

  brushSize: number;
  useAdaptiveBrushSize: boolean;
}

export class Tools implements ITools, ISerializable<ToolsSnapshot> {
  public static readonly excludeFromSnapshotTracking = ["/document"];

  protected activeToolName?: string;
  public tools: { [name: string]: ITool } = {};
  public toolGroups: IToolGroup[] = [];

  public brushSize!: number;
  public useAdaptiveBrushSize!: boolean;

  constructor(
    snapshot: Partial<ToolsSnapshot> | undefined,
    protected document: IDocument,
  ) {
    if (snapshot) this.applySnapshot(snapshot);

    makeObservable<this, "activeToolName">(this, {
      activeToolName: observable,
      tools: observable,
      toolGroups: observable,
      brushSize: observable,
      useAdaptiveBrushSize: observable,

      activeTool: computed,

      setActiveTool: action,
      setBrushSize: action,
      setUseAdaptiveBrushSize: action,
      applySnapshot: action,
    });
  }

  public get activeTool(): ITool | undefined {
    return this.activeToolName ? this.tools[this.activeToolName] : undefined;
  }

  public get canDraw(): boolean {
    // TODO
    return false;
  }

  public get isToolInUse(): boolean {
    // TODO
    return false;
  }

  public setActiveTool(nameOrTool?: string | ITool): void {
    this.activeToolName = nameOrTool
      ? typeof nameOrTool === "string"
        ? nameOrTool
        : nameOrTool.name
      : undefined;
  }

  public setBrushSize(value?: number): void {
    // TODO: What is a reasonable default here?
    this.brushSize = value ?? 3;
  }

  public setUseAdaptiveBrushSize(value?: boolean): void {
    this.useAdaptiveBrushSize = value ?? true;
  }

  // Serialization
  public toJSON(): ToolsSnapshot {
    return {
      activeToolName: this.activeToolName,
      brushSize: this.brushSize,
      useAdaptiveBrushSize: this.useAdaptiveBrushSize,
    };
  }

  public applySnapshot(snapshot: Partial<ToolsSnapshot>): Promise<void> {
    this.setActiveTool(snapshot.activeToolName);

    this.setBrushSize(snapshot.brushSize);
    this.setUseAdaptiveBrushSize(snapshot.useAdaptiveBrushSize);

    return Promise.resolve();
  }
}
