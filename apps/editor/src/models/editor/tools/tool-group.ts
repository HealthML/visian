import { IDocument, ITool, IToolGroup } from "@visian/ui-shared";
import { ISerializable } from "@visian/utils";
import { action, computed, makeObservable, observable } from "mobx";

export interface ToolGroupSnapshot<N extends string> {
  activeToolName: N;

  // As all other properties are typically not edited by the user and thus
  // expected to be handled by the application, we do not persist them
}

export interface ToolGroupConfig<N extends string>
  extends Partial<ToolGroupSnapshot<N>> {
  toolNames: N[];
}

export class ToolGroup<N extends string>
  implements IToolGroup<N>, ISerializable<ToolGroupSnapshot<N>> {
  public readonly excludeFromSnapshotTracking = ["document"];

  protected activeToolName!: N;
  protected toolNames: N[];

  constructor(config: ToolGroupConfig<N>, protected document: IDocument) {
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

  public get activeTool(): ITool<N> {
    return this.document.tools.tools[this.activeToolName];
  }

  public get tools(): ITool<N>[] {
    return this.toolNames.map((name) => this.document.tools.tools[name]);
  }

  public setActiveTool(
    nameOrTool?: N | ITool<N>,
    setAsGlobalActiveTool = true,
  ): void {
    this.activeToolName = nameOrTool
      ? typeof nameOrTool === "string"
        ? nameOrTool
        : nameOrTool.name
      : this.toolNames[0];
    if (setAsGlobalActiveTool) this.document.tools?.setActiveTool(nameOrTool);
  }

  // Serialization
  public toJSON(): ToolGroupSnapshot<N> {
    return {
      activeToolName: this.activeToolName,
    };
  }

  public applySnapshot(snapshot: Partial<ToolGroupSnapshot<N>>): Promise<void> {
    if (
      snapshot.activeToolName &&
      !this.toolNames.includes(snapshot.activeToolName)
    ) {
      this.setActiveTool(undefined, false);
    } else {
      this.setActiveTool(snapshot.activeToolName, false);
    }
    return Promise.resolve();
  }
}
