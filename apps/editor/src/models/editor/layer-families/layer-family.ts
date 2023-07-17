import { IDocument, ILayer, ILayerFamily } from "@visian/ui-shared";
import { action, computed, makeObservable, observable } from "mobx";
import { v4 as uuidv4 } from "uuid";

import { FileMetadata } from "../../../types";
import { ImageLayer } from "../layers";

export class LayerFamily implements ILayerFamily {
  public excludeFromSnapshotTracking = ["document"];
  protected layerIds: string[] = [];
  public title = "";
  public id!: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public metaData?: FileMetadata;
  public collapsed?: boolean;

  constructor(
    protected document: IDocument,
    title?: string | undefined,
    layerIds?: string[] | undefined,
  ) {
    this.id = uuidv4();
    this.title = title || "";
    this.layerIds = layerIds || [];

    makeObservable<this, "layerIds" | "metaData">(this, {
      layerIds: observable,
      collapsed: observable,
      title: observable,
      isActive: computed,
      metaData: observable,

      addLayer: action,
      removeLayer: action,
    });
  }

  public get layers(): ILayer[] {
    return this.layerIds.map((id) => this.document.getLayer(id)!);
  }

  public get hasChanges() {
    return this.layers.some(
      (layer) => layer.kind === "image" && (layer as ImageLayer).hasChanges,
    );
  }

  public addLayer(id: string, index?: number) {
    const layer = this.document.getLayer(id);
    if (!layer) return;
    if (layer.family !== this) {
      layer.family?.removeLayer(layer.id);
    }
    const oldIndex = this.layerIds.indexOf(layer.id);
    if (oldIndex < 0 && index !== undefined) {
      this.layerIds.splice(index, 0, layer.id);
    } else if (oldIndex < 0 && index === undefined) {
      this.layerIds.push(id);
    } else if (index !== undefined && oldIndex !== index) {
      this.layerIds.splice(index, 0, this.layerIds.splice(oldIndex, 1)[0]);
    }
    this.document.addLayer(layer, index);
  }

  public removeLayer(id: string, index?: number) {
    if (!this.layerIds.includes(id)) return;
    this.layerIds = this.layerIds.filter((layerId) => layerId !== id);
    const layer = this.document.getLayer(id);
    if (!layer) return;
    this.document.addLayer(layer, index);
  }

  public get isActive() {
    if (this.document.activeLayer) {
      return this.layers.includes(this.document.activeLayer);
    }
    return false;
  }
}
