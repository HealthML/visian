import {
  BlendMode,
  color,
  IAnnotationGroup,
  IDocument,
  ILayer,
  LayerSnapshot,
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

export class Layer implements ILayer, ISerializable<LayerSnapshot> {
  public excludeFromSnapshotTracking = ["document"];

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public static readonly kind: string = "none";
  public readonly kind: string = "none";
  public isAnnotation!: boolean;

  public id!: string;
  protected titleOverride?: string;

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

    makeObservable<this, "titleOverride" | "opacityOverride" | "metadata">(
      this,
      {
        isAnnotation: observable,
        id: observable,
        titleOverride: observable,
        blendMode: observable,
        color: observable,
        isVisible: observable,
        opacityOverride: observable,
        transformation: observable.ref,
        metadata: observable,

        opacity: computed,
        title: computed,
        annotationGroup: computed,
        isActive: computed,

        setAnnotationGroup: action,
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
      },
    );
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
  public get isActive(): boolean {
    return this.document.activeLayer === this;
  }

  public getSliceMarkers(_viewType: ViewType): MarkerConfig[] {
    return [];
  }

  public get annotationGroup(): IAnnotationGroup | undefined {
    return this.document.annotationGroups?.find((group) =>
      group.layers.includes(this),
    );
  }

  public setAnnotationGroup(id?: string, index?: number): void {
    if (!id) {
      this.annotationGroup?.removeLayer(this.id, index);
      this.document.addLayer(this, index);
      return;
    }
    const newGroup = this.document.getAnnotationGroup(id);
    newGroup?.addLayer(this.id, index);
  }

  public getAnnotationGroupLayers(): ILayer[] {
    return (
      this.annotationGroup?.layers ?? this.document.getOrphanAnnotationLayers()
    );
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
    this.annotationGroup?.removeLayer?.(this.id);
    if (this.document.layers.includes(this)) {
      this.document.deleteLayer(this.id);
    }
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
      blendMode: this.blendMode,
      color: this.color,
      isVisible: this.isVisible,
      opacityOverride: this.opacityOverride,
      transformation: this.transformation?.toArray(),
      metadata: this.metadata ? { ...this.metadata } : undefined,
    };
  }

  public applySnapshot(snapshot?: Partial<LayerSnapshot>): Promise<void> {
    if (snapshot?.id && snapshot?.id !== this.id) {
      throw new Error("Layer ids do not match");
    }
    this.setIsAnnotation(snapshot?.isAnnotation);
    this.setTitle(snapshot?.titleOverride);
    this.setBlendMode(snapshot?.blendMode);
    this.setColor(snapshot?.color);
    this.setIsVisible(snapshot?.isVisible);
    this.setOpacity(snapshot?.opacityOverride);
    this.setTransformation(
      snapshot?.transformation
        ? new Matrix4().fromArray(snapshot.transformation)
        : undefined,
    );
    this.setMetadata(snapshot?.metadata);

    return Promise.resolve();
  }
}
