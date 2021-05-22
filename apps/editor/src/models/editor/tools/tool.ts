import { DragPoint, IDocument, ITool, ViewMode } from "@visian/ui-shared";
import { ISerializable } from "@visian/utils";

import { Parameter, ParameterSnapshot } from "../parameters";

export interface ToolSnapshot {
  name: string;
  params: ParameterSnapshot[];

  // As all other properties are typically not edited by the user and thus
  // expected to be handled by the application, we do not persist them
}

export interface ToolConfig {
  name: string;

  label?: string;
  labelTx?: string;

  isDrawingTool?: boolean;
  isBrush?: boolean;

  altToolName?: string;

  supportedViewModes: ViewMode[];
  supportedLayerKinds: string[];

  params?: Parameter[];
}

export class Tool implements ITool, ISerializable<ToolSnapshot> {
  public readonly name: string;

  public label?: string;
  public labelTx?: string;

  public isDrawingTool: boolean;
  public isBrush: boolean;

  public altToolName?: string;

  public supportedViewModes: ViewMode[];
  public supportedLayerKinds: string[];

  public params: { [name: string]: Parameter };

  constructor(config: ToolConfig, protected document: IDocument) {
    this.name = config.name;
    this.label = config.label;
    this.labelTx = config.labelTx;
    this.isDrawingTool = Boolean(config.isDrawingTool);
    this.isBrush = Boolean(config.isBrush);
    this.altToolName = config.altToolName;
    this.supportedViewModes = config.supportedViewModes;
    this.supportedLayerKinds = config.supportedLayerKinds;
    this.params = {};
    config.params?.forEach((param) => {
      this.params[param.name] = param;
    });
  }

  public activate(): void {
    // Intentionally left blank
  }

  public startAt(_dragPoint: DragPoint): void {
    // Intentionally left blank
  }

  public moveTo(_dragPoint: DragPoint): void {
    // Intentionally left blank
  }

  public endAt(_dragPoint: DragPoint): void {
    // Intentionally left blank
  }

  // Serialization
  public toJSON(): ToolSnapshot {
    return {
      name: this.name,
      params: Object.values(this.params).map((param) => param.toJSON()),
    };
  }

  public applySnapshot(snapshot: Partial<ToolSnapshot>): Promise<void> {
    if (snapshot.name && snapshot.name !== this.name) {
      throw new Error("Tool names do not match");
    }

    snapshot.params?.forEach((paramSnapshot) => {
      const param = this.params[paramSnapshot.name];
      if (param) param.applySnapshot(paramSnapshot);
    });
    return Promise.resolve();
  }
}
