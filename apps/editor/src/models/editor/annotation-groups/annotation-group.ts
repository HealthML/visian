import {
  AnnotationGroupSnapshot,
  IAnnotationGroup,
  ILayer,
} from "@visian/ui-shared";
import {
  BackendMetadata,
  ISerializable,
  isMiaAnnotationMetadata,
} from "@visian/utils";
import {
  action,
  computed,
  makeObservable,
  observable,
  transaction,
} from "mobx";
import { v4 as uuidv4 } from "uuid";

import { Document } from "../document";
import { ImageLayer } from "../layers";

export class AnnotationGroup
  implements IAnnotationGroup, ISerializable<AnnotationGroupSnapshot>
{
  public layerIds: string[] = [];
  public excludeFromSnapshotTracking = ["document"];
  public title = "";
  public id!: string;
  public collapsed?: boolean;
  public metadata?: BackendMetadata;

  constructor(
    snapshot: Partial<AnnotationGroupSnapshot> | undefined,
    protected document: Document,
  ) {
    this.applySnapshot(snapshot);

    makeObservable<this, "layerIds" | "metadata">(this, {
      layerIds: observable,
      collapsed: observable,
      title: observable,
      isActive: computed,
      metadata: observable,

      setCollapsed: action,
      setLayerIds: action,
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

  public setCollapsed(value: boolean) {
    this.collapsed = value;
  }

  public setLayerIds(ids: string[]) {
    this.layerIds = ids;
  }

  public addLayer(layer: ILayer) {
    if (!layer.isAnnotation) return;
    transaction(() => {
      this.setLayerIds([...this.layerIds, layer.id]);
      // In case the layer was in the document layer list (i.e. not in a group)
      // we also remove it from there:
      this.document.removeLayerFromRootList(layer);
    });
  }

  public removeLayer(layer: ILayer) {
    this.setLayerIds(this.layerIds.filter((layerId) => layerId !== layer.id));
  }

  public get isActive() {
    if (this.document.activeLayer) {
      return this.layers.includes(this.document.activeLayer);
    }
    return false;
  }

  public toJSON(): AnnotationGroupSnapshot {
    return {
      id: this.id,
      title: this.title,
      metadata: this.metadata ? { ...this.metadata } : undefined,
      layerIds: [...this.layerIds],
    };
  }

  public async applySnapshot(
    snapshot: Partial<AnnotationGroupSnapshot> | undefined,
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
