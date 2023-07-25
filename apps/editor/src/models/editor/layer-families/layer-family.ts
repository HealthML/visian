import { ILayer, ILayerFamily, LayerFamilySnapshot } from "@visian/ui-shared";
import {
  BackendMetadata,
  ISerializable,
  isMiaAnnotationMetadata,
} from "@visian/utils";
import { action, computed, makeObservable, observable } from "mobx";
import { v4 as uuidv4 } from "uuid";

import { Document } from "../document";
import { ImageLayer } from "../layers";

export class LayerFamily
  implements ILayerFamily, ISerializable<LayerFamilySnapshot>
{
  public excludeFromSnapshotTracking = ["document"];
  protected layerIds: string[] = [];
  public title = "";
  public id!: string;
  public collapsed?: boolean;
  public metadata?: BackendMetadata;

  constructor(
    snapshot: Partial<LayerFamilySnapshot> | undefined,
    protected document: Document,
  ) {
    this.applySnapshot(snapshot);

    makeObservable<this, "layerIds" | "metadata">(this, {
      layerIds: observable,
      collapsed: observable,
      title: observable,
      isActive: computed,
      metadata: observable,

      addLayer: action,
      removeLayer: action,
      trySetIsVerified: action,
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

  public toJSON(): LayerFamilySnapshot {
    return {
      id: this.id,
      title: this.title,
      metadata: this.metadata ? { ...this.metadata } : undefined,
      layerIds: [...this.layerIds],
    };
  }

  public async applySnapshot(
    snapshot: Partial<LayerFamilySnapshot> | undefined,
  ) {
    if (!snapshot) return;
    this.id = snapshot.id || uuidv4();
    this.title = snapshot.title || "";
    this.metadata = snapshot.metadata ? { ...snapshot.metadata } : undefined;
    this.layerIds = snapshot.layerIds || [];
  }

  public trySetIsVerified(value: boolean) {
    if (isMiaAnnotationMetadata(this.metadata)) {
      this.metadata = {
        ...this.metadata,
        verified: value,
      };
    }
  }
}
