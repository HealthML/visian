import { IDocument, IViewport2D, MarkerConfig } from "@visian/ui-shared";
import { ISerializable, Vector, ViewType } from "@visian/utils";
import { action, computed, makeObservable, observable } from "mobx";

import { maxZoom, minZoom, zoomStep } from "../../../constants";

export interface Viewport2DSnapshot {
  mainViewType: ViewType;
  showSideViews: boolean;

  zoomLevel: number;
  offset: number[];
}

export class Viewport2D
  implements IViewport2D, ISerializable<Viewport2DSnapshot> {
  public readonly excludeFromSnapshotTracking = ["document"];

  public mainViewType!: ViewType;
  public showSideViews!: boolean;

  public zoomLevel!: number;
  public offset = new Vector(2);

  public isVoxelHovered = false;
  public hoveredVoxel = new Vector(3);
  public hoveredValue = 0;

  constructor(
    snapshot: Partial<Viewport2DSnapshot> | undefined,
    protected document: IDocument,
  ) {
    if (snapshot) {
      this.applySnapshot(snapshot);
    } else {
      this.reset();
    }

    makeObservable(this, {
      mainViewType: observable,
      showSideViews: observable,
      zoomLevel: observable,
      offset: observable,
      isVoxelHovered: observable,
      hoveredVoxel: observable,
      hoveredValue: observable,

      sliceMarkers: computed,

      setMainViewType: action,
      setShowSideViews: action,
      setZoomLevel: action,
      setOffset: action,
      reset: action,
      toggleSideViews: action,
      setSelectedSlice: action,
      zoomIn: action,
      zoomOut: action,
      setIsVoxelHovered: action,
      setHoveredVoxel: action,
      setHoveredValue: action,
      applySnapshot: action,
    });
  }

  public get sliceMarkers(): MarkerConfig[] {
    return this.document.markers.getSliceMarkers(this.mainViewType);
  }

  /**
   * The current additive amount by which the the zoom level is incremented.
   * This is typically dependent on the current `zoomLevel`.
   */
  protected get zoomStep() {
    return zoomStep * Math.sqrt(this.zoomLevel);
  }

  public setMainViewType = (value?: ViewType): void => {
    if (!this.document.has3DLayers) {
      this.mainViewType = ViewType.Transverse;
      return;
    }

    this.mainViewType = value || ViewType.Transverse;
  };

  public setShowSideViews(value?: boolean): void {
    this.showSideViews = value ?? true;
  }

  public setZoomLevel = (value?: number): void => {
    this.zoomLevel = value ?? 1;
  };

  public setOffset(value?: Vector): void {
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
    const sliceCount = this.document.baseImageLayer?.image?.voxelCount.getFromView(
      viewType,
    );
    return sliceCount ? sliceCount - 1 : 0;
  }

  public getSelectedSlice(viewType = this.mainViewType): number {
    return this.document.viewSettings.selectedVoxel.getFromView(viewType);
  }

  public setSelectedSlice(viewType = this.mainViewType, slice: number): void {
    this.document.viewSettings.selectedVoxel.setFromView(
      viewType,
      Math.min(Math.max(0, Math.round(slice)), this.getMaxSlice(viewType)),
    );
  }

  public stepSelectedSlice(viewType = this.mainViewType, stepSize = 1): void {
    this.setSelectedSlice(viewType, this.getSelectedSlice(viewType) + stepSize);
  }

  public zoomIn() {
    this.zoomLevel = Math.min(maxZoom, this.zoomLevel + this.zoomStep);
  }

  public zoomOut() {
    this.zoomLevel = Math.max(minZoom, this.zoomLevel - this.zoomStep);
  }

  // Hovered Voxel
  public setIsVoxelHovered(value = false): void {
    this.isVoxelHovered = value;
  }

  public setHoveredVoxel(voxel: Vector): void {
    this.hoveredVoxel.copy(voxel);
    this.setIsVoxelHovered(true);
  }

  public setHoveredValue(value: number): void {
    this.hoveredValue = value;
    this.setIsVoxelHovered(true);
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
