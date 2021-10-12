import { getPositionWithinPixel } from "@visian/rendering";
import {
  DragPoint,
  IDocument,
  IImageLayer,
  IViewport2D,
  MarkerConfig,
} from "@visian/ui-shared";
import {
  getOrthogonalAxis,
  getPlaneAxes,
  ISerializable,
  Pixel,
  Vector,
  ViewType,
} from "@visian/utils";
import { action, computed, makeObservable, observable } from "mobx";

import {
  maxZoom,
  minZoom,
  viewTypeDepthThreshold,
  zoomStep,
} from "../../../constants";
import { OutlineTool } from "../tools";

export interface Viewport2DSnapshot {
  mainViewType: ViewType;
  showSideViews: boolean;
  showVoxelInfo: boolean;

  zoomLevel: number;
  offset: number[];
}

export class Viewport2D
  implements IViewport2D, ISerializable<Viewport2DSnapshot> {
  public readonly excludeFromSnapshotTracking = [
    "document",
    "hoveredScreenCoordinates",
    "hoveredViewType",
  ];

  public mainViewType!: ViewType;
  public showSideViews!: boolean;
  public showVoxelInfo = false;

  public zoomLevel!: number;
  public offset = new Vector(2);

  private hoveredScreenCoordinates: Pixel = { x: 0, y: 0 };
  public hoveredViewType = ViewType.Transverse;

  constructor(
    snapshot: Partial<Viewport2DSnapshot> | undefined,
    protected document: IDocument,
  ) {
    if (snapshot) {
      this.applySnapshot(snapshot);
    } else {
      this.reset();
    }

    makeObservable<this, "hoveredScreenCoordinates" | "hoveredViewType">(this, {
      mainViewType: observable,
      showSideViews: observable,
      showVoxelInfo: observable,
      zoomLevel: observable,
      offset: observable,
      hoveredScreenCoordinates: observable,
      hoveredViewType: observable,

      sliceMarkers: computed,
      hoveredUV: computed,
      hoveredDragPoint: computed,
      hoveredVoxel: computed,
      hoveredValue: computed,
      isVoxelHovered: computed,

      setMainViewType: action,
      setShowSideViews: action,
      setShowVoxelInfo: action,
      setZoomLevel: action,
      setOffset: action,
      reset: action,
      toggleSideViews: action,
      setSelectedSlice: action,
      zoomIn: action,
      zoomOut: action,
      setHoveredScreenCoordinates: action,
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

  public get defaultViewType() {
    if (!this.document.has3DLayers) return ViewType.Transverse;

    const voxelSpacing = this.document.baseImageLayer?.image.voxelSpacing;
    if (!voxelSpacing) return ViewType.Transverse;

    let bestViewType = ViewType.Transverse;
    let bestViewTypeDepth = voxelSpacing.getFromView(bestViewType);

    [ViewType.Sagittal, ViewType.Coronal].forEach((viewType) => {
      const viewTypeDepth = voxelSpacing.getFromView(viewType);
      if (viewTypeDepth - bestViewTypeDepth > viewTypeDepthThreshold) {
        bestViewType = viewType;
        bestViewTypeDepth = viewTypeDepth;
      }
    });
    return bestViewType;
  }

  public setMainViewType = (value?: ViewType): void => {
    if (!this.document.has3DLayers) {
      this.mainViewType = ViewType.Transverse;
      return;
    }

    this.mainViewType = value ?? this.defaultViewType;
    this.hoveredViewType = this.mainViewType;
  };

  public setShowSideViews(value?: boolean): void {
    this.showSideViews = value ?? true;
  }

  public setShowVoxelInfo = (value?: boolean) => {
    this.showVoxelInfo = value ?? false;
  };

  public setZoomLevel = (value?: number): void => {
    this.zoomLevel = value ?? 1;
  };

  public setOffset(value?: Vector): void {
    this.offset = value || this.offset.setScalar(0);
  }

  public reset = (): void => {
    this.setMainViewType();
    this.setShowSideViews();
    this.setShowVoxelInfo();
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
  public setHoveredScreenCoordinates(
    coordinates: Pixel,
    viewType = this.mainViewType,
  ) {
    this.hoveredScreenCoordinates = coordinates;
    this.hoveredViewType = viewType;
  }

  public get hoveredUV(): Pixel {
    return (
      this.document.sliceRenderer?.getVirtualUVs(
        this.hoveredScreenCoordinates,
        this.hoveredViewType,
      ) || { x: 0, y: 0 }
    );
  }

  public get hoveredDragPoint() {
    const dragPoint: DragPoint = {
      x: 0,
      y: 0,
      z: 0,
      right: true,
      bottom: false,
    };

    if (!this.document.baseImageLayer) return dragPoint;

    const [widthAxis, heightAxis] = getPlaneAxes(this.hoveredViewType);
    const orthogonalAxis = getOrthogonalAxis(this.hoveredViewType);

    dragPoint[orthogonalAxis] = this.document.viewSettings.selectedVoxel[
      orthogonalAxis
    ];
    dragPoint[widthAxis] =
      this.hoveredUV.x *
      this.document.baseImageLayer.image.voxelCount[widthAxis];
    dragPoint[heightAxis] =
      this.hoveredUV.y *
      this.document.baseImageLayer.image.voxelCount[heightAxis];

    if (!(this.document.tools.activeTool instanceof OutlineTool)) {
      dragPoint[widthAxis] = Math.floor(dragPoint[widthAxis]);
      dragPoint[heightAxis] = Math.floor(dragPoint[heightAxis]);
    }

    const scanWidth = this.document.baseImageLayer.image.voxelCount[widthAxis];
    const scanHeight = this.document.baseImageLayer.image.voxelCount[
      heightAxis
    ];

    [dragPoint.right, dragPoint.bottom] = getPositionWithinPixel(
      this.hoveredUV,
      scanWidth,
      scanHeight,
    );

    return dragPoint;
  }

  public get hoveredVoxel() {
    return {
      x: Math.floor(this.hoveredDragPoint.x),
      y: Math.floor(this.hoveredDragPoint.y),
      z: Math.floor(this.hoveredDragPoint.z),
    };
  }

  public get hoveredValue() {
    const { activeLayer } = this.document;
    const layer =
      activeLayer &&
      !activeLayer.isAnnotation &&
      activeLayer.kind === "image" &&
      activeLayer.isVisible
        ? (activeLayer as IImageLayer)
        : this.document.baseImageLayer;

    if (!layer) return new Vector([0], false);

    return layer.image.getVoxelData(this.hoveredVoxel);
  }

  public get isVoxelHovered() {
    return Boolean(
      this.document.baseImageLayer &&
        this.hoveredVoxel.x >= 0 &&
        this.hoveredVoxel.y >= 0 &&
        this.hoveredVoxel.z >= 0 &&
        this.hoveredVoxel.x < this.document.baseImageLayer.image.voxelCount.x &&
        this.hoveredVoxel.y < this.document.baseImageLayer.image.voxelCount.y &&
        this.hoveredVoxel.z < this.document.baseImageLayer.image.voxelCount.z,
    );
  }

  // Serialization
  public toJSON(): Viewport2DSnapshot {
    return {
      mainViewType: this.mainViewType,
      showSideViews: this.showSideViews,
      showVoxelInfo: this.showVoxelInfo,
      zoomLevel: this.zoomLevel,
      offset: this.offset.toJSON(),
    };
  }

  public applySnapshot(snapshot: Partial<Viewport2DSnapshot>): Promise<void> {
    this.setMainViewType(snapshot.mainViewType);
    this.setShowSideViews(snapshot.showSideViews);
    this.setShowVoxelInfo(snapshot.showVoxelInfo);

    this.setZoomLevel(snapshot.zoomLevel);

    this.setOffset(
      snapshot.offset ? Vector.fromArray(snapshot.offset) : undefined,
    );

    return Promise.resolve();
  }
}
