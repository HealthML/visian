import { IDocument, ILayer, ILayerGroup } from "@visian/ui-shared";
import { ISerializable } from "@visian/utils";
import { action, makeObservable, observable, toJS } from "mobx";

import { Layer, LayerSnapshot } from "./layer";

export interface LayerGroupSnapshot extends LayerSnapshot {
  layerIds: string[];
}

export class LayerGroup
  extends Layer
  implements ILayerGroup, ISerializable<LayerGroupSnapshot> {
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public static readonly kind = "group";
  public readonly kind = "group";

  protected layerIds: string[] = [];

  constructor(
    snapshot: Partial<LayerGroupSnapshot> | undefined,
    protected document: IDocument,
  ) {
    super(snapshot, document);

    // TODO: Investigate why it has to be set here again
    this.layerIds = snapshot?.layerIds || [];

    makeObservable<this, "layerIds">(this, {
      layerIds: observable,

      addLayer: action,
      removeLayer: action,
    });
  }

  public get layers(): ILayer[] {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.layerIds.map((id) => this.document.getLayer(id)!);
  }

  public addLayer(idOrLayer: string | ILayer) {
    if (typeof idOrLayer === "string") {
      this.layerIds.push(idOrLayer);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.document.getLayer(idOrLayer)!.setParent(this.id);
      return;
    }

    this.layerIds.push(idOrLayer.id);
    idOrLayer.setParent(this.id);

    this.document.reorderLayersForGrouping(idOrLayer);
  }

  public removeLayer(idOrLayer: string | ILayer) {
    if (typeof idOrLayer === "string") {
      this.layerIds = this.layerIds.filter((id) => id !== idOrLayer);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.document.getLayer(idOrLayer)!.setParent();
      return;
    }

    this.layerIds = this.layerIds.filter((id) => id !== idOrLayer.id);
    idOrLayer.setParent();
  }

  public delete(): void {
    this.layers.forEach((layer) => {
      layer.delete();
    });
    super.delete();
  }

  // Serialization
  public toJSON(): LayerGroupSnapshot {
    return {
      ...super.toJSON(),
      layerIds: toJS(this.layerIds),
    };
  }

  public applySnapshot(snapshot: Partial<LayerGroupSnapshot>): Promise<void> {
    super.applySnapshot(snapshot);
    this.layerIds = snapshot.layerIds || [];

    return Promise.resolve();
  }
}
