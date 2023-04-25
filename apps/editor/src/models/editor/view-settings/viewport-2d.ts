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
  VoxelInfoMode,
} from "@visian/utils";
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";

import { maxZoom, minZoom, voxelInfoDelay, zoomStep } from "../../../constants";
import { OutlineTool } from "../tools";

export interface Viewport2DSnapshot {
  mainViewType: ViewType;
  showSideViews: boolean;

  voxelInfoMode: VoxelInfoMode;

  zoomLevel: number;
  offset: number[];
}

export class Viewport2D
  implements IViewport2D, ISerializable<Viewport2DSnapshot>
{
  public readonly excludeFromSnapshotTracking = [
    "document",
    "hoveredScreenCoordinates",
    "hoveredViewType",
    "mouseMoveTimeout",
    "hasMouseRecentlyMoved",
  ];

  public mainViewType!: ViewType;
  public showSideViews!: boolean;

  public zoomLevel!: number;
  public offset = new Vector(2);
  public rotationT = 0;
  public rotationS = 0;
  public rotationC = 0;

  public window: Vector = new Vector([0, 1]);

  public hoveredScreenCoordinates: Pixel = { x: 0, y: 0 };
  public hoveredViewType = ViewType.Transverse;

  public voxelInfoMode!: VoxelInfoMode;
  private hasMouseRecentlyMoved = true;
  private mouseMoveTimeout?: NodeJS.Timer;

  constructor(
    snapshot: Partial<Viewport2DSnapshot> | undefined,
    protected document: IDocument,
  ) {
    if (snapshot) {
      this.applySnapshot(snapshot);
    } else {
      this.reset();
    }

    makeObservable<
      this,
      "hoveredScreenCoordinates" | "hoveredViewType" | "hasMouseRecentlyMoved"
    >(this, {
      mainViewType: observable,
      showSideViews: observable,
      zoomLevel: observable,
      offset: observable,
      rotationT: observable,
      rotationS: observable,
      rotationC: observable,
      window: observable,
      hoveredScreenCoordinates: observable,
      hoveredViewType: observable,
      voxelInfoMode: observable,
      hasMouseRecentlyMoved: observable,

      showVoxelInfo: computed,
      sliceMarkers: computed,
      hoveredUV: computed,
      hoveredDragPoint: computed,
      hoveredVoxel: computed,
      hoveredValue: computed,
      isVoxelHovered: computed,

      setMainViewType: action,
      setShowSideViews: action,
      setVoxelInfoMode: action,
      setZoomLevel: action,
      setOffset: action,
      resetRotation: action,
      rotateBy90Degrees: action,
      setWindow: action,
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
    return (
      this.document.mainImageLayer?.image.defaultViewType ?? ViewType.Transverse
    );
  }

  public get showVoxelInfo() {
    return (
      this.voxelInfoMode === "on" ||
      (this.voxelInfoMode === "delay" && !this.hasMouseRecentlyMoved)
    );
  }

  public setMainViewType = (value?: ViewType): void => {
    if (!this.document.has3DLayers) {
      this.mainViewType = this.defaultViewType;
      return;
    }

    this.mainViewType = value ?? this.defaultViewType;
    this.hoveredViewType = this.mainViewType;
  };

  public resetRotation = (): void => {
    this.rotationT = 0;
    this.rotationS = 0;
    this.rotationC = 0;
  };

  public rotateBy90Degrees = (clockwise = true) => {
    const rotationAngle = clockwise ? Math.PI / 2 : -Math.PI / 2;
    switch (this.mainViewType) {
      case ViewType.Transverse:
        this.rotationT += rotationAngle;
        break;
      case ViewType.Sagittal:
        this.rotationS += rotationAngle;
        break;
      case ViewType.Coronal:
        this.rotationC += rotationAngle;
        break;
    }
  };

  public setShowSideViews(value?: boolean): void {
    this.showSideViews = value ?? true;
  }

  private onMouseMove = () => {
    if (this.mouseMoveTimeout !== undefined) {
      clearTimeout(this.mouseMoveTimeout);
    }

    if (!this.hasMouseRecentlyMoved) {
      // Marking the whole function as an action still resulted in a MobX warning when
      // it was called by the event listener. Using `runInAction` works.
      runInAction(() => {
        this.hasMouseRecentlyMoved = true;
      });
    }

    this.mouseMoveTimeout = setTimeout(() => {
      // Here we need to use `runInAction` because it is called in the timeout.
      runInAction(() => {
        this.hasMouseRecentlyMoved = false;
      });
    }, voxelInfoDelay);
  };

  public setVoxelInfoMode = (value?: VoxelInfoMode) => {
    this.voxelInfoMode = value ?? "off";

    if (this.voxelInfoMode === "delay") {
      window.addEventListener("mousemove", this.onMouseMove);

      if (!this.hasMouseRecentlyMoved) {
        this.hasMouseRecentlyMoved = true;
      }
    } else {
      window.removeEventListener("mousemove", this.onMouseMove);
      if (this.mouseMoveTimeout !== undefined) {
        clearTimeout(this.mouseMoveTimeout);
      }
    }
  };

  public setZoomLevel = (value?: number): void => {
    this.zoomLevel = value ?? 1;
  };

  public setOffset(value?: Vector): void {
    this.offset = value || this.offset.setScalar(0);
  }

  public setWindow = (value?: [number, number]): void => {
    this.window.set(...(value ?? [0, 1]));
  };

  public reset = (): void => {
    this.setMainViewType();
    this.setShowSideViews();
    this.setVoxelInfoMode();
    this.setZoomLevel();
    this.setOffset();
    this.resetRotation();
  };

  // Special Accessors
  public toggleSideViews = (): void => {
    this.showSideViews = !this.showSideViews;
  };

  public getMaxSlice(viewType = this.mainViewType): number {
    const sliceCount =
      this.document.mainImageLayer?.image?.voxelCount.getFromView(viewType);
    return sliceCount ? sliceCount - 1 : 0;
  }

  public getSelectedSlice(viewType = this.mainViewType): number {
    return this.document.viewSettings.selectedVoxel.getFromView(viewType);
  }

  // eslint-disable-next-line default-param-last
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

    if (!this.document.mainImageLayer) return dragPoint;

    const [widthAxis, heightAxis] = getPlaneAxes(this.hoveredViewType);
    const orthogonalAxis = getOrthogonalAxis(this.hoveredViewType);

    dragPoint[orthogonalAxis] =
      this.document.viewSettings.selectedVoxel[orthogonalAxis];
    dragPoint[widthAxis] =
      this.hoveredUV.x *
      this.document.mainImageLayer.image.voxelCount[widthAxis];
    dragPoint[heightAxis] =
      this.hoveredUV.y *
      this.document.mainImageLayer.image.voxelCount[heightAxis];

    if (!(this.document.tools.activeTool instanceof OutlineTool)) {
      dragPoint[widthAxis] = Math.floor(dragPoint[widthAxis]);
      dragPoint[heightAxis] = Math.floor(dragPoint[heightAxis]);
    }

    const scanWidth = this.document.mainImageLayer.image.voxelCount[widthAxis];
    const scanHeight =
      this.document.mainImageLayer.image.voxelCount[heightAxis];

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
        : this.document.mainImageLayer;

    if (!layer) return new Vector([0], false);

    return layer.image.getVoxelData(this.hoveredVoxel);
  }

  public get isVoxelHovered() {
    return Boolean(
      this.document.mainImageLayer &&
        this.hoveredVoxel.x >= 0 &&
        this.hoveredVoxel.y >= 0 &&
        this.hoveredVoxel.z >= 0 &&
        this.hoveredVoxel.x < this.document.mainImageLayer.image.voxelCount.x &&
        this.hoveredVoxel.y < this.document.mainImageLayer.image.voxelCount.y &&
        this.hoveredVoxel.z < this.document.mainImageLayer.image.voxelCount.z,
    );
  }

  // Serialization
  public toJSON(): Viewport2DSnapshot {
    return {
      mainViewType: this.mainViewType,
      showSideViews: this.showSideViews,
      voxelInfoMode: this.voxelInfoMode,
      zoomLevel: this.zoomLevel,
      offset: this.offset.toJSON(),
    };
  }

  public applySnapshot(snapshot: Partial<Viewport2DSnapshot>): Promise<void> {
    this.setMainViewType(snapshot.mainViewType);
    this.setShowSideViews(snapshot.showSideViews);
    this.setVoxelInfoMode(snapshot.voxelInfoMode);

    this.setZoomLevel(snapshot.zoomLevel);

    this.setOffset(
      snapshot.offset ? Vector.fromArray(snapshot.offset) : undefined,
    );

    return Promise.resolve();
  }
}
