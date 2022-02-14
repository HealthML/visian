import {
  BlendGroup,
  BlendMode,
  IDocument,
  IImageLayer,
  ILayer,
  ILayerGroup,
} from "@visian/ui-shared";
import { ISerializable } from "@visian/utils";
import { action, computed, makeObservable, observable, toJS } from "mobx";

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

  protected blendMode?: BlendMode;

  constructor(
    snapshot: Partial<LayerGroupSnapshot> | undefined,
    protected document: IDocument,
  ) {
    super(snapshot, document);

    makeObservable<this, "layerIds" | "blendMode">(this, {
      layerIds: observable,
      blendMode: observable,

      blendGroup: computed,

      addLayer: action,
      removeLayer: action,
      setBlendMode: action,
    });
  }

  public get layers(): ILayer[] {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.layerIds.map((id) => this.document.getLayer(id)!);
  }

  public get blendGroup(): BlendGroup | undefined {
    if (!this.blendMode) return undefined;

    const imageLayers = this.layers.filter(
      (layer) => layer.kind === "image",
    ) as IImageLayer[];

    if (this.blendMode === "COMPARE") {
      if (imageLayers.length !== 2) return undefined;

      return {
        mode: "COMPARE",
        layers: imageLayers as [IImageLayer, IImageLayer],
      };
    }

    if (this.blendMode === "MAJORITY_VOTE") {
      return {
        mode: "MAJORITY_VOTE",
        layers: imageLayers,
        majority: Math.ceil(imageLayers.length / 2),
      };
    }

    return undefined;
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

  public setBlendMode = (value?: BlendMode) => {
    this.blendMode = value;
  };

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
