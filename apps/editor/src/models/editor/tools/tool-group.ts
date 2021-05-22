import { IDocument, ITool, IToolGroup } from "@visian/ui-shared";
import { ISerializable } from "@visian/utils";
import { action, computed, makeObservable, observable } from "mobx";

export interface ToolGroupSnapshot {
  activeToolName: string;

  // As all other properties are typically not edited by the user and thus
  // expected to be handled by the application, we do not persist them
}

export interface ToolGroupConfig extends Partial<ToolGroupSnapshot> {
  toolNames: string[];
}

export class ToolGroup implements IToolGroup, ISerializable<ToolGroupSnapshot> {
  public readonly excludeFromSnapshotTracking = ["document"];

  protected activeToolName!: string;
  protected toolNames: string[];

  constructor(config: ToolGroupConfig, protected document: IDocument) {
    this.toolNames = config.toolNames;
    this.setActiveTool(config.activeToolName);

    makeObservable<this, "activeToolName" | "toolNames">(this, {
      activeToolName: observable,
      toolNames: observable,

      activeTool: computed,
      tools: computed,

      setActiveTool: action,
    });
  }

  public get activeTool(): ITool {
    return this.document.tools.tools[this.activeToolName];
  }

  public get tools(): ITool[] {
    return this.toolNames.map((name) => this.document.tools.tools[name]);
  }

  public setActiveTool(nameOrTool?: string | ITool): void {
    this.activeToolName = nameOrTool
      ? typeof nameOrTool === "string"
        ? nameOrTool
        : nameOrTool.name
      : this.toolNames[0];
  }

  // Serialization
  public toJSON(): ToolGroupSnapshot {
    return {
      activeToolName: this.activeToolName,
    };
  }

  public applySnapshot(snapshot: Partial<ToolGroupSnapshot>): Promise<void> {
    if (
      snapshot.activeToolName &&
      !this.toolNames.includes(snapshot.activeToolName)
    ) {
      this.setActiveTool();
    } else {
      this.setActiveTool(snapshot.activeToolName);
    }
    return Promise.resolve();
  }
}
