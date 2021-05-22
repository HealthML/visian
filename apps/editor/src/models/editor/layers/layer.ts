import { BlendMode, IDocument, ILayer } from "@visian/ui-shared";
import { ISerializable } from "@visian/utils";
import { action, computed, makeObservable, observable } from "mobx";
import { Matrix4 } from "three";
import { v4 as uuidv4 } from "uuid";

export interface LayerSnapshot {
  kind: string;
  isAnnotation: boolean;

  id: string;
  titleOverride?: string;
  parentId?: string;

  blendMode: BlendMode;
  color?: string;
  isVisible: boolean;
  opacityOverride?: number;

  transformation: number[];
}

export class Layer implements ILayer, ISerializable<LayerSnapshot> {
  public readonly excludeFromSnapshotTracking = ["document"];

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public static readonly kind: string = "none";
  public readonly kind: string = "none";
  public isAnnotation!: boolean;

  public id!: string;
  protected titleOverride?: string;
  protected parentId?: string;

  public blendMode!: BlendMode;
  public color?: string;
  public isVisible!: boolean;
  protected opacityOverride?: number;

  public transformation!: Matrix4;

  constructor(
    snapshot: Partial<LayerSnapshot> | undefined,
    protected document: IDocument,
  ) {
    this.applySnapshot(snapshot);
    if (!this.id) this.id = uuidv4();

    makeObservable<this, "titleOverride" | "parentId" | "opacityOverride">(
      this,
      {
        isAnnotation: observable,
        id: observable,
        titleOverride: observable,
        parentId: observable,
        blendMode: observable,
        color: observable,
        isVisible: observable,
        opacityOverride: observable,
        transformation: observable.ref,

        opacity: computed,
        parent: computed,
        title: computed,

        setParent: action,
        setIsAnnotation: action,
        setTitle: action,
        setBlendMode: action,
        setColor: action,
        setIsVisible: action,
        setOpacity: action,
        setTransformation: action,
        applySnapshot: action,
      },
    );
  }

  public setIsAnnotation = (value?: boolean): void => {
    this.isAnnotation = Boolean(value);
  };

  public get title(): string {
    return this.titleOverride || "Untitled Layer";
  }

  public setTitle = (value?: string): void => {
    this.titleOverride = value;
  };

  public get parent(): ILayer | undefined {
    return this.parentId ? this.document.getLayer(this.parentId) : undefined;
  }

  public setParent(idOrLayer?: string | ILayer): void {
    this.parentId = idOrLayer
      ? typeof idOrLayer === "string"
        ? idOrLayer
        : idOrLayer.id
      : undefined;
  }

  public setBlendMode = (value?: BlendMode): void => {
    this.blendMode = value || "NORMAL";
  };

  public setColor = (value?: string): void => {
    this.color = value;
  };

  public setIsVisible = (value?: boolean): void => {
    this.isVisible = value ?? true;
  };

  public get opacity(): number {
    // TODO: The annotation opacity should probably be extracted to the theme
    return this.opacityOverride ?? this.isAnnotation ? 0.5 : 1;
  }

  public setOpacity = (value?: number): void => {
    this.opacityOverride = value;
  };

  public setTransformation = (value?: Matrix4): void => {
    this.transformation = value || new Matrix4();
  };

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
      transformation: this.transformation.toArray(),
    };
  }

  public applySnapshot(snapshot?: Partial<LayerSnapshot>): Promise<void> {
    if (snapshot?.id && snapshot?.id !== this.id)
      throw new Error("Layer ids do not match");

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
