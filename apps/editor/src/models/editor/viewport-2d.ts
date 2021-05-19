import { IDocument, IImageLayer, IViewport2D } from "@visian/ui-shared";
import {
  getPlaneAxes,
  ISerializable,
  Pixel,
  Vector,
  ViewType,
} from "@visian/utils";
import { action, makeObservable, observable } from "mobx";
import { maxZoom, minZoom, zoomStep } from "../../constants";

export interface Viewport2DSnapshot {
  mainViewType: ViewType;
  showSideViews: boolean;

  zoomLevel: number;
  offset: number[];
}

export class Viewport2D
  implements IViewport2D, ISerializable<Viewport2DSnapshot> {
  public static readonly excludeFromSnapshotTracking = ["/document"];

  public mainViewType!: ViewType;
  public showSideViews!: boolean;

  public zoomLevel!: number;
  public offset = new Vector(2);

  constructor(
    snapshot: Partial<Viewport2DSnapshot> | undefined,
    protected document: IDocument,
  ) {
    if (snapshot) {
      this.applySnapshot(snapshot);
    } else {
      this.reset();
    }

    makeObservable<this, "setOffset">(this, {
      mainViewType: observable,
      showSideViews: observable,
      zoomLevel: observable,
      offset: observable,

      setMainViewType: action,
      setShowSideViews: action,
      setZoomLevel: action,
      setOffset: action,
      reset: action,
      toggleSideViews: action,
      setSelectedSlice: action,
      moveCrosshair: action,
      zoomIn: action,
      zoomOut: action,
      applySnapshot: action,
    });
  }

  public get zoomStep() {
    return zoomStep * Math.sqrt(this.zoomLevel);
  }

  public setMainViewType = (value?: ViewType): void => {
    this.mainViewType = value || ViewType.Transverse;
  };

  public setShowSideViews(value?: boolean): void {
    this.showSideViews = value ?? true;
  }

  public setZoomLevel = (value?: number): void => {
    this.zoomLevel = value ?? 1;
  };

  protected setOffset(value?: Vector): void {
    this.offset = value || this.offset.setScalar(0);
  }

  public reset = (): void => {
    this.setMainViewType();
    this.setShowSideViews();
    this.setZoomLevel();
    this.setOffset();
  };

  // Special Accessors
  public toggleSideViews = (): void => {
    this.showSideViews = !this.showSideViews;
  };

  public getMaxSlice(viewType = this.mainViewType): number {
    // TODO: Do not rely on `layer[0]`
    const sliceCount = (this.document.layers[0] as
      | IImageLayer
      | undefined)?.voxelCount?.getFromView(viewType);
    return sliceCount ? sliceCount - 1 : 0;
  }

  public getSelectedSlice(viewType = this.mainViewType): number {
    return this.document.viewSettings.selectedVoxel.getFromView(viewType);
  }

  public setSelectedSlice(viewType = this.mainViewType, slice: number): void {
    this.document.viewSettings.selectedVoxel.setFromView(
      viewType,
      Math.min(Math.max(Math.round(slice)), this.getMaxSlice(viewType)),
    );
  }

  public stepSelectedSlice(viewType = this.mainViewType, stepSize = 1): void {
    this.setSelectedSlice(viewType, this.getSelectedSlice(viewType) + stepSize);
  }

  public moveCrosshair(
    viewType = this.mainViewType,
    slicePosition: Pixel,
  ): void {
    const [widthAxis, heightAxis] = getPlaneAxes(viewType);

    this.document.viewSettings.selectedVoxel[widthAxis] = slicePosition.x;
    this.document.viewSettings.selectedVoxel[heightAxis] = slicePosition.y;
  }

  public zoomIn() {
    this.zoomLevel = Math.min(maxZoom, this.zoomLevel + this.zoomStep);
  }

  public zoomOut() {
    this.zoomLevel = Math.max(minZoom, this.zoomLevel - this.zoomStep);
  }

  // Serialization
  public toJSON(): Viewport2DSnapshot {
    return {
      mainViewType: this.mainViewType,
      showSideViews: this.showSideViews,
      zoomLevel: this.zoomLevel,
      offset: this.offset.toJSON(),
    };
  }

  public applySnapshot(snapshot: Partial<Viewport2DSnapshot>): Promise<void> {
    this.setMainViewType(snapshot.mainViewType);
    this.setShowSideViews(snapshot.showSideViews);

    this.setZoomLevel(snapshot.zoomLevel);

    this.setOffset(
      snapshot.offset ? Vector.fromArray(snapshot.offset) : undefined,
    );

    return Promise.resolve();
  }
}
