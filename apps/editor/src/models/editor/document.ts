import { IDocument, ILayer } from "@visian/ui-shared";
import { ISerializable } from "@visian/utils";
import { action, computed, makeObservable, observable } from "mobx";
import { v4 as uuidv4 } from "uuid";

import { History, HistorySnapshot } from "./history";
import { Tools, ToolsSnapshot } from "./tools";
import { ViewSettings, ViewSettingsSnapshot } from "./view-settings";
import { Viewport2D, Viewport2DSnapshot } from "./viewport-2d";
import { Viewport3D, Viewport3DSnapshot } from "./viewport-3d";

export interface DocumentSnapshot {
  id: string;
  titleOverride?: string;

  activeLayerId?: string;
  // TODO: layers: LayerSnapshot[];

  history: HistorySnapshot;

  viewSettings: ViewSettingsSnapshot;
  viewport2D: Viewport2DSnapshot;
  viewport3D: Viewport3DSnapshot;

  tools: ToolsSnapshot;
}

export class Document implements IDocument, ISerializable<DocumentSnapshot> {
  public static readonly excludeFromSnapshotTracking = [];

  public id: string;
  protected titleOverride?: string;

  protected activeLayerId?: string;
  public layers: ILayer[] = [];

  public history: History;

  public viewSettings: ViewSettings;
  public viewport2D: Viewport2D;
  public viewport3D: Viewport3D;

  public tools: Tools;

  constructor(snapshot?: DocumentSnapshot) {
    this.id = snapshot?.id || uuidv4();
    this.titleOverride = snapshot?.titleOverride;
    this.activeLayerId = snapshot?.activeLayerId;
    // TODO: Create new layers for all layers in the snapshot
    this.history = new History(snapshot?.history, this);
    this.viewSettings = new ViewSettings(snapshot?.viewSettings, this);
    this.viewport2D = new Viewport2D(snapshot?.viewport2D, this);
    this.viewport3D = new Viewport3D(snapshot?.viewport3D, this);

    this.tools = new Tools(snapshot?.tools, this);

    makeObservable<this, "titleOverride" | "activeLayerId">(this, {
      id: observable,
      titleOverride: observable,
      activeLayerId: observable,
      layers: observable,
      history: observable,
      viewSettings: observable,
      viewport2D: observable,
      viewport3D: observable,

      title: computed,
      activeLayer: computed,

      setTitle: action,
      setActiveLayer: action,
      addLayer: action,
      deleteLayer: action,
      applySnapshot: action,
    });
  }

  public get title(): string {
    if (this.titleOverride) return this.titleOverride;
    const { length } = this.layers;
    if (!length) return "Untitled Document";
    return this.layers[length - 1].title;
  }

  public setTitle = (value?: string): void => {
    this.titleOverride = value;
  };

  // Layer Management
  public get activeLayer(): ILayer | undefined {
    return this.layers.find((layer) => layer.id === this.activeLayerId);
  }

  public getLayer(id: string): ILayer | undefined {
    return this.layers.find((layer) => layer.id === id);
  }

  public setActiveLayer = (idOrLayer?: string | ILayer): void => {
    this.activeLayerId = idOrLayer
      ? typeof idOrLayer === "string"
        ? idOrLayer
        : idOrLayer.id
      : undefined;
  };

  public addLayer = (layer: ILayer): void => {
    this.layers.push(layer);
  };

  public deleteLayer = (idOrLayer: string | ILayer): void => {
    this.layers = this.layers.filter((layer) =>
      typeof idOrLayer === "string"
        ? layer.id === idOrLayer
        : layer === idOrLayer,
    );
  };

  // Serialization
  public toJSON(): DocumentSnapshot {
    return {
      id: this.id,
      titleOverride: this.titleOverride,
      activeLayerId: this.activeLayerId,
      history: this.history.toJSON(),
      viewSettings: this.viewSettings.toJSON(),
      viewport2D: this.viewport2D.toJSON(),
      viewport3D: this.viewport3D.toJSON(),
      tools: this.tools.toJSON(),
    };
  }

  public async applySnapshot(
    snapshot: Partial<DocumentSnapshot>,
  ): Promise<void> {
    if (snapshot.id && snapshot.id !== this.id) {
      throw new Error("The document ids do not match");
    }

    throw new Error(
      "This is a noop. To load a document from storage, create a new instance",
    );
  }
}
