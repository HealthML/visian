import { IDocument, ILayer, ILayerFamily } from "@visian/ui-shared";
import { action, makeObservable, observable } from "mobx";
import { v4 as uuidv4 } from "uuid";

import { FileMetadata } from "../../../types";
import { ImageLayer } from "../layers";

export class LayerFamily implements ILayerFamily {
  protected layerIds: string[] = [];
  public title = "";
  public id!: string;
  public metaData?: FileMetadata;

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
      metaData: observable,

      addLayer: action,
      removeLayer: action,
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
}
