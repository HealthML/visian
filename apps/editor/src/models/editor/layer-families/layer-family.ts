import { ILayer, ILayerFamily } from "@visian/ui-shared";
import {
  BackendMetadata,
  ISerializable,
  isMiaAnnotationMetadata,
} from "@visian/utils";
import { action, makeObservable, observable } from "mobx";
import { v4 as uuidv4 } from "uuid";

import { Document } from "../document";
import { ImageLayer } from "../layers";

export interface LayerFamilySnapshot {
  id: string;
  title: string;
  metadata?: BackendMetadata;
  layerIds: string[];
}

export class LayerFamily
  implements ILayerFamily, ISerializable<LayerFamilySnapshot>
{
  public excludeFromSnapshotTracking = ["document"];
  protected layerIds: string[] = [];
  public title = "";
  public id!: string;
  public metadata?: BackendMetadata;

  constructor(
    snapshot: Partial<LayerFamilySnapshot> | undefined,
    protected document: Document,
  ) {
    this.applySnapshot(snapshot);

    makeObservable<this, "layerIds" | "metadata">(this, {
      layerIds: observable,
      metadata: observable,

      addLayer: action,
      removeLayer: action,
      trySetIsVerified: action,
    });
  }

  public get layers(): ILayer[] {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.layerIds.map((id) => this.document.getLayer(id)!);
  }

  public get hasChanges() {
    return this.layers.some(
      (layer) => layer.kind === "image" && (layer as ImageLayer).hasChanges,
    );
  }

  public addLayer(id: string) {
    const layer = this.document.getLayer(id);
    if (!this.layerIds.includes(id) && layer) {
      this.layerIds.push(id);
      layer.setFamily(this.id);
    }
  }

  public removeLayer(id: string) {
    this.layerIds = this.layerIds.filter((layerId) => layerId !== id);
    const layer = this.document.getLayer(id);
    if (layer?.family === this) {
      layer.setFamily(undefined);
    }
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
