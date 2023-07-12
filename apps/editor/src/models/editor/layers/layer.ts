import {
  BlendMode,
  color,
  IDocument,
  ILayer,
  ILayerFamily,
  MarkerConfig,
} from "@visian/ui-shared";
import { BackendMetadata, ISerializable, ViewType } from "@visian/utils";
import { action, computed, makeObservable, observable } from "mobx";
import { Matrix4 } from "three";
import tc from "tinycolor2";
import { v4 as uuidv4 } from "uuid";

import {
  defaultAnnotationColor,
  defaultAnnotationOpacity,
  defaultImageColor,
} from "../../../constants";
import { LayerGroup } from "./layer-group";

export interface LayerSnapshot {
  kind: string;
  isAnnotation: boolean;

  id: string;
  titleOverride?: string;
  parentId?: string;
  familyId?: string;

  blendMode: BlendMode;
  color?: string;
  isVisible: boolean;
  opacityOverride?: number;

  transformation: number[];
}

export class Layer implements ILayer, ISerializable<LayerSnapshot> {
  public excludeFromSnapshotTracking = ["document"];

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public static readonly kind: string = "none";
  public readonly kind: string = "none";
  public isAnnotation!: boolean;

  public id!: string;
  protected titleOverride?: string;
  protected parentId?: string;
  protected familyId?: string;

  public blendMode!: BlendMode;
  public color?: string;
  public isVisible!: boolean;
  protected opacityOverride?: number;

  public transformation!: Matrix4;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public metadata?: BackendMetadata;

  constructor(
    snapshot: Partial<LayerSnapshot> | undefined,
    protected document: IDocument,
    isCalledByChild?: boolean,
  ) {
    this.id = snapshot?.id || uuidv4();
    if (!isCalledByChild) this.applySnapshot(snapshot);

    makeObservable<
      this,
      "titleOverride" | "parentId" | "familyId" | "opacityOverride" | "metadata"
    >(this, {
      isAnnotation: observable,
      id: observable,
      titleOverride: observable,
      parentId: observable,
      familyId: observable,
      blendMode: observable,
      color: observable,
      isVisible: observable,
      opacityOverride: observable,
      transformation: observable.ref,
      metadata: observable,

      opacity: computed,
      parent: computed,
      title: computed,
      family: computed,

      setParent: action,
      setFamily: action,
      setIsAnnotation: action,
      setTitle: action,
      setBlendMode: action,
      setColor: action,
      setIsVisible: action,
      setOpacity: action,
      setMetadata: action,
      resetSettings: action,
      setTransformation: action,
      delete: action,
      applySnapshot: action,
    });
  }

  public setIsAnnotation(value?: boolean): void {
    this.isAnnotation = Boolean(value);
  }

  public get is3DLayer(): boolean {
    return false;
  }

  public get title(): string | undefined {
    return this.titleOverride;
  }

  public setTitle = (value?: string): void => {
    this.titleOverride = value;
  };

  public get parent(): ILayer | undefined {
    return this.parentId ? this.document.getLayer(this.parentId) : undefined;
  }

  public getSliceMarkers(_viewType: ViewType): MarkerConfig[] {
    return [];
  }

  public setParent(idOrLayer?: string | ILayer): void {
    this.parentId = idOrLayer
      ? typeof idOrLayer === "string"
        ? idOrLayer
        : idOrLayer.id
      : undefined;
  }

  public get family(): ILayerFamily | undefined {
    return this.familyId
      ? this.document.getLayerFamily(this.familyId)
      : undefined;
  }

  public setFamily(id: string | undefined): void {
    if (!id) {
      if (this.family?.layers.includes(this)) {
        this.family?.removeLayer(this.id);
      }
      this.familyId = undefined;
      return;
    }
    const family = this.document.getLayerFamily(id);
    if (family) {
      this.familyId = id;
    }
  }

  public getOrphanAnnotationLayers(): ILayer[] {
    const orphanAnnotationLayers = this.document.layers.filter(
      (l) => l.isAnnotation && !l.family,
    );
    return orphanAnnotationLayers ?? [];
  }

  public getFamilyLayers(): ILayer[] {
    return this.family?.layers ?? this.getOrphanAnnotationLayers();
  }

  public setBlendMode = (value?: BlendMode): void => {
    this.blendMode = value || "NORMAL";
  };

  public setColor = (value?: string): void => {
    this.color = value;
  };

  public tryToggleIsVisible = (): void => {
    if (
      !this.isVisible &&
      this.document.imageLayers.length >= this.document.maxVisibleLayers
    )
      return;
    this.setIsVisible(!this.isVisible);
  };

  public setIsVisible = (value?: boolean): void => {
    this.isVisible = value ?? true;
  };

  public get opacity(): number {
    return (
      this.opacityOverride ?? (this.isAnnotation ? defaultAnnotationOpacity : 1)
    );
  }

  public setOpacity = (value?: number): void => {
    this.opacityOverride = value;
  };

  public resetSettings = (): void => {
    this.setBlendMode();
    this.setColor(this.isAnnotation ? defaultAnnotationColor : undefined);
    this.setOpacity();
  };

  public setTransformation = (value?: Matrix4): void => {
    this.transformation = value || new Matrix4();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public setMetadata = (value?: BackendMetadata): void => {
    this.metadata = value;
  };

  /**
   * Adjusts `this.color` if the color lookup returns an invalid color.
   * Mainly used for backwards compatibility when a color is removed.
   */
  public fixPotentiallyBadColor() {
    if (this.color) {
      const colorString = color(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.color as any,
      )({ theme: this.document.theme });

      if (tc(colorString).isValid()) return;
    }

    this.setColor(
      this.isAnnotation
        ? this.document.getFirstUnusedColor()
        : defaultImageColor,
    );
  }

  public delete() {
    (this.parent as LayerGroup)?.removeLayer?.(this.id);
    this.family?.removeLayer?.(this.id);
    this.document.deleteLayer(this.id);
  }

  public async toFile(): Promise<File | undefined> {
    return undefined;
  }

  // Serialization
  public toJSON(): LayerSnapshot {
    return {
      kind: this.kind,
      isAnnotation: this.isAnnotation,
      id: this.id,
      titleOverride: this.titleOverride,
      parentId: this.parentId,
      blendMode: this.blendMode,
      color: this.color,
      isVisible: this.isVisible,
      opacityOverride: this.opacityOverride,
      transformation: this.transformation?.toArray(),
    };
  }

  public applySnapshot(snapshot?: Partial<LayerSnapshot>): Promise<void> {
    if (snapshot?.id && snapshot?.id !== this.id) {
      throw new Error("Layer ids do not match");
    }

    this.setIsAnnotation(snapshot?.isAnnotation);
    this.setTitle(snapshot?.titleOverride);
    this.setParent(snapshot?.parentId);
    this.setBlendMode(snapshot?.blendMode);
    this.setColor(snapshot?.color);
    this.setIsVisible(snapshot?.isVisible);
    this.setOpacity(snapshot?.opacityOverride);
    this.setTransformation(
      snapshot?.transformation
        ? new Matrix4().fromArray(snapshot.transformation)
        : undefined,
    );

    return Promise.resolve();
  }
}
