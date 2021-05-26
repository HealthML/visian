import {
  IDocument,
  IEditor,
  ILayer,
  ISliceRenderer,
  ValueType,
} from "@visian/ui-shared";
import { ISerializable, readMedicalImage } from "@visian/utils";
import isEqual from "lodash.isequal";
import { action, computed, makeObservable, observable, toJS } from "mobx";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";

import { defaultAnnotationColor } from "../../constants";
import { History, HistorySnapshot } from "./history";
import { ImageLayer, Layer, LayerSnapshot } from "./layers";
import * as layers from "./layers";
import { Markers } from "./markers";
import { ToolName, Tools, ToolsSnapshot } from "./tools";
import { ViewSettings, ViewSettingsSnapshot } from "./view-settings";
import { Viewport2D, Viewport2DSnapshot } from "./viewport-2d";
import { Viewport3D, Viewport3DSnapshot } from "./viewport-3d";
import { StoreContext } from "../types";

export const layerMap: {
  [kind: string]: ValueType<typeof layers>;
} = {};
Object.values(layers).forEach((command) => {
  layerMap[command.kind] = command;
});

export interface DocumentSnapshot {
  id: string;
  titleOverride?: string;

  activeLayerId?: string;
  layerMap: LayerSnapshot[];
  layerIds: string[];

  history: HistorySnapshot;

  viewSettings: ViewSettingsSnapshot;
  viewport2D: Viewport2DSnapshot;
  viewport3D: Viewport3DSnapshot;

  tools: ToolsSnapshot<ToolName>;
}

export class Document implements IDocument, ISerializable<DocumentSnapshot> {
  public readonly excludeFromSnapshotTracking = ["editor"];

  public id: string;
  protected titleOverride?: string;

  protected activeLayerId?: string;
  protected layerMap: { [key: string]: Layer };
  protected layerIds: string[];

  public history: History;

  public viewSettings: ViewSettings;
  public viewport2D: Viewport2D;
  public viewport3D: Viewport3D;

  public tools: Tools;

  public markers: Markers = new Markers(this);

  constructor(
    snapshot: DocumentSnapshot | undefined,
    protected editor: IEditor,
    protected context?: StoreContext,
  ) {
    this.id = snapshot?.id || uuidv4();
    this.titleOverride = snapshot?.titleOverride;
    this.activeLayerId = snapshot?.activeLayerId;
    this.layerMap = {};
    snapshot?.layerMap.forEach((layer) => {
      const LayerKind = layerMap[layer.kind];
      if (!LayerKind) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.layerMap[layer.id] = new LayerKind(layer as any, this);
    });
    this.layerIds = snapshot?.layerIds || [];
    this.history = new History(snapshot?.history, this);
    this.viewSettings = new ViewSettings(snapshot?.viewSettings, this);
    this.viewport2D = new Viewport2D(snapshot?.viewport2D, this);
    this.viewport3D = new Viewport3D(snapshot?.viewport3D, this);

    makeObservable<
      this,
      "titleOverride" | "activeLayerId" | "layerMap" | "layerIds"
    >(this, {
      id: observable,
      titleOverride: observable,
      activeLayerId: observable,
      layerMap: observable,
      layerIds: observable,
      history: observable,
      viewSettings: observable,
      viewport2D: observable,
      viewport3D: observable,
      tools: observable,

      title: computed,
      activeLayer: computed,

      setTitle: action,
      setActiveLayer: action,
      addLayer: action,
      deleteLayer: action,
      importImage: action,
      importAnnotation: action,
      applySnapshot: action,
    });

    this.tools = new Tools(snapshot?.tools, this);
  }

  public get title(): string | undefined {
    if (this.titleOverride) return this.titleOverride;
    const { length } = this.layerIds;
    return length ? this.getLayer(this.layerIds[length - 1])?.title : undefined;
  }

  public setTitle = (value?: string): void => {
    this.titleOverride = value;
  };

  // Layer Management
  public get layers(): ILayer[] {
    return this.layerIds.map((id) => this.layerMap[id]);
  }

  public get activeLayer(): ILayer | undefined {
    return Object.values(this.layerMap).find(
      (layer) => layer.id === this.activeLayerId,
    );
  }

  public getLayer(id: string): ILayer | undefined {
    return this.layerMap[id];
  }

  public setActiveLayer = (idOrLayer?: string | ILayer): void => {
    this.activeLayerId = idOrLayer
      ? typeof idOrLayer === "string"
        ? idOrLayer
        : idOrLayer.id
      : undefined;
  };

  public addLayer = (layer: Layer): void => {
    this.layerMap[layer.id] = layer;
    this.layerIds.unshift(layer.id);
  };

  public deleteLayer = (idOrLayer: string | ILayer): void => {
    this.layerIds = this.layerIds.filter((id) =>
      typeof idOrLayer === "string" ? id !== idOrLayer : id !== idOrLayer.id,
    );
    delete this.layerMap[
      typeof idOrLayer === "string" ? idOrLayer : idOrLayer.id
    ];
  };

  public get has3DLayers(): boolean {
    return Object.values(this.layerMap).some((layer) => layer.is3DLayer);
  }

  // I/O (DEPRECATED)
  public async importImage(file: File | File[], name?: string) {
    this.layerIds = [];
    this.layerMap = {};

    const image = await readMedicalImage(file);
    image.name =
      name || (Array.isArray(file) ? file[0]?.name || "" : file.name);
    const imageLayer = ImageLayer.fromITKImage(image, this);

    this.addLayer(imageLayer);

    const annotationLayer = ImageLayer.fromNewAnnotationForImage(
      imageLayer.image,
      this,
    );
    this.addLayer(annotationLayer);
    this.setActiveLayer(annotationLayer);
  }

  public async importAnnotation(file: File | File[], name?: string) {
    if (!this.layerIds.length) throw new Error("no-image-error");

    const image = await readMedicalImage(file);
    image.name =
      name || (Array.isArray(file) ? file[0]?.name || "" : file.name);
    const annotationLayer = ImageLayer.fromITKImage(image, this);
    annotationLayer.setIsAnnotation(true);
    annotationLayer.setColor(defaultAnnotationColor);
    if (
      !isEqual(
        (this.layerMap[this.layerIds[0]] as ImageLayer)?.image?.voxelCount,
        annotationLayer.image.voxelCount,
      )
    ) {
      throw new Error("annotation-mismatch-error");
    }

    // Replace old annotation (if any)
    if (this.layerIds.length > 1) this.deleteLayer(this.layerIds[0]);
    this.addLayer(annotationLayer);
    this.setActiveLayer(annotationLayer);
  }

  // I/O
  public async save(): Promise<void> {
    return this.context?.persistImmediately();
  }

  public async requestSave(): Promise<void> {
    return this.context?.persist();
  }

  // Proxies
  public get sliceRenderer(): ISliceRenderer | undefined {
    return this.editor.sliceRenderer;
  }

  public get renderers(): THREE.WebGLRenderer[] | undefined {
    return this.editor.renderers;
  }

  // Serialization
  public toJSON(): DocumentSnapshot {
    return {
      id: this.id,
      titleOverride: this.titleOverride,
      activeLayerId: this.activeLayerId,
      layerMap: Object.values(this.layerMap).map((layer) => layer.toJSON()),
      layerIds: toJS(this.layerIds),
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
