import {
  DragPoint,
  IconType,
  IDocument,
  ITool,
  ViewMode,
} from "@visian/ui-shared";
import { ISerializable } from "@visian/utils";
import { makeObservable, observable } from "mobx";

import { Parameter, ParameterSnapshot } from "../parameters";

export interface ToolSnapshot<N extends string> {
  name: N;
  params: ParameterSnapshot[];

  // As all other properties are typically not edited by the user and thus
  // expected to be handled by the application, we do not persist them
}

export interface ToolConfig<N extends string> {
  name: N;

  icon: IconType;
  label?: string;
  labelTx?: string;

  infoTx?: string;

  isDrawingTool?: boolean;
  isBrush?: boolean;
  isSmartBrush?: boolean;

  altToolName?: N;

  supportedViewModes?: ViewMode[];
  supportedLayerKinds?: string[];
  supportAnnotationsOnly?: boolean;

  params?: Parameter[];
}

export class Tool<N extends string>
  implements ITool<N>, ISerializable<ToolSnapshot<N>> {
  public readonly excludeFromSnapshotTracking = ["document"];

  public readonly name: N;

  public icon: IconType;
  public label?: string;
  public labelTx?: string;

  public infoTx?: string;

  public isDrawingTool: boolean;
  public isBrush: boolean;
  public isSmartBrush: boolean;

  public altToolName?: string;

  public supportedViewModes?: ViewMode[];
  public supportedLayerKinds?: string[];
  public supportAnnotationsOnly?: boolean;

  public params: { [name: string]: Parameter };

  constructor(config: ToolConfig<N>, protected document: IDocument) {
    this.name = config.name;
    this.icon = config.icon;
    this.label = config.label;
    this.labelTx = config.labelTx || config.name;
    this.infoTx = config.infoTx;
    this.isDrawingTool = Boolean(config.isDrawingTool);
    this.isBrush = Boolean(config.isBrush);
    this.isSmartBrush = Boolean(config.isSmartBrush);
    this.altToolName = config.altToolName;
    this.supportedViewModes = config.supportedViewModes;
    this.supportedLayerKinds = config.supportedLayerKinds;
    this.supportAnnotationsOnly = config.supportAnnotationsOnly;
    this.params = {};
    config.params?.forEach((param) => {
      this.params[param.name] = param;
    });

    makeObservable(this, { params: observable });
  }

  public get altTool() {
    return this.altToolName
      ? this.document.tools.tools[this.altToolName]
      : undefined;
  }

  public canActivate(): boolean {
    return Boolean(
      (!this.supportedViewModes ||
        this.supportedViewModes.includes(
          this.document.viewSettings.viewMode,
        )) &&
        (!this.supportedLayerKinds ||
          (this.document.activeLayer &&
            this.supportedLayerKinds.includes(
              this.document.activeLayer.kind,
            ))) &&
        (!this.supportAnnotationsOnly ||
          this.document.activeLayer?.isAnnotation),
    );
  }

  public activate(_previousTool?: ITool<N>): void {
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

  public deactivate(_nextTool?: ITool<N>): void {
    // Intentionally left blank
  }

  // Serialization
  public toJSON(): ToolSnapshot<N> {
    return {
      name: this.name,
      params: Object.values(this.params).map((param) => param.toJSON()),
    };
  }

  public applySnapshot(snapshot: Partial<ToolSnapshot<N>>): Promise<void> {
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
