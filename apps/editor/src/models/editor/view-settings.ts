import {
  getPlaneAxes,
  ISerializable,
  Pixel,
  Vector,
  ViewType,
} from "@visian/utils";
import { action, makeObservable, observable } from "mobx";

import { maxZoom, minZoom, zoomStep } from "../../constants";
import { StoreContext } from "../types";

import type { Editor } from "./editor";

export interface EditorViewSettingsSnapshot {
  mainViewType?: ViewType;
  selectedVoxel?: number[];
  shouldShowSideViews?: boolean;
  contrast?: number;
  brightness?: number;
}

export class EditorViewSettings
  implements ISerializable<EditorViewSettingsSnapshot> {
  public static readonly excludeFromSnapshotTracking = ["/editor"];

  public brightness = 1;
  public contrast = 1;

  public mainViewType = ViewType.Transverse;
  public shouldShowSideViews = true;

  public zoomLevel = 1;
  public offset = new Vector(2);

  public annotationColor = "#ff0000";
  public annotationOpacity = 0.5;

  public selectedVoxel = new Vector(3);

  constructor(protected editor: Editor, protected context?: StoreContext) {
    makeObservable(this, {
      brightness: observable,
      contrast: observable,
      mainViewType: observable,
      shouldShowSideViews: observable,
      zoomLevel: observable,
      offset: observable,
      annotationColor: observable,
      annotationOpacity: observable,
      selectedVoxel: observable,

      applySnapshot: action,
      setBrightness: action,
      setContrast: action,
      setMainViewType: action,
      toggleSideViews: action,
      setZoomLevel: action,
      zoomIn: action,
      zoomOut: action,
      setOffset: action,
      setAnnotationColor: action,
      setAnnotationOpacity: action,
      setSelectedVoxel: action,
      setSelectedSlice: action,
      stepSelectedSlice: action,
      moveCrosshair: action,
    });
  }
  public setBrightness(value = 1) {
    this.brightness = value;
  }

  public setContrast(value = 1) {
    this.contrast = value;
  }

  public setMainViewType = (value: ViewType) => {
    this.mainViewType =
      this.editor.image && this.editor.image.dimensionality > 2
        ? value
        : ViewType.Transverse;
  };

  public toggleSideViews = (value = !this.shouldShowSideViews) => {
    this.shouldShowSideViews =
      value &&
      Boolean(this.editor.image) &&
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.editor.image!.dimensionality > 2;
  };

  public setZoomLevel(value = 1) {
    this.zoomLevel = value;
  }
  public get zoomStep() {
    return zoomStep * Math.sqrt(this.zoomLevel);
  }

  public get pixelSize() {
    const image = this.editor.image;
    if (!image) return undefined;

    const [width, height] = getPlaneAxes(this.mainViewType);

    return new Vector(2).set(
      this.zoomLevel / image.voxelCount[width],
      this.zoomLevel / image.voxelCount[height],
    );
  }

  public zoomIn() {
    this.zoomLevel = Math.min(maxZoom, this.zoomLevel + this.zoomStep);
  }

  public zoomOut() {
    this.zoomLevel = Math.max(minZoom, this.zoomLevel - this.zoomStep);
  }

  public setOffset({ x = 0, y = 0 } = {}) {
    this.offset.set(x, y);
  }

  public setAnnotationColor(value: string) {
    this.annotationColor = value;
  }

  public setAnnotationOpacity(value = 0.5) {
    this.annotationOpacity = value;
  }

  public setSelectedVoxel(
    x = this.editor.image ? Math.floor(this.editor.image?.voxelCount.x / 2) : 0,
    y = this.editor.image ? Math.floor(this.editor.image?.voxelCount.y / 2) : 0,
    z = this.editor.image ? Math.floor(this.editor.image?.voxelCount.z / 2) : 0,
  ) {
    this.selectedVoxel.set(x, y, z);
  }

  public setSelectedSlice(value: number, viewType = this.mainViewType) {
    if (!this.editor.image) return;

    this.selectedVoxel.setFromView(
      viewType,
      Math.min(
        Math.max(Math.round(value), 0),
        this.editor.image.voxelCount.getComponent((viewType + 2) % 3) - 1,
      ),
    );
  }

  public getSelectedSlice(viewType = this.mainViewType) {
    return this.selectedVoxel.getFromView(viewType);
  }

  public getMaxSlice(viewType = this.mainViewType) {
    return this.editor.image?.voxelCount.getFromView(viewType);
  }

  public stepSelectedSlice(stepSize = 1, viewType = this.mainViewType) {
    this.setSelectedSlice(this.getSelectedSlice(viewType) + stepSize, viewType);
  }

  public moveCrosshair(screenPosition: Pixel, canvasId: string) {
    const sliceRenderer = this.editor.sliceRenderer;
    if (!sliceRenderer || !this.editor.image || !this.shouldShowSideViews)
      return;

    const intersection = sliceRenderer.raycaster.getIntersectionsFromPointer(
      screenPosition,
      canvasId,
    )[0];
    if (!intersection || !intersection.uv) return;

    const { viewType } = intersection.object.userData;
    const [widthAxis, heightAxis] = getPlaneAxes(viewType);

    this.selectedVoxel[widthAxis] = Math.floor(
      intersection.uv.x * this.editor.image.voxelCount[widthAxis],
    );
    this.selectedVoxel[heightAxis] = Math.floor(
      intersection.uv.y * this.editor.image.voxelCount[heightAxis],
    );
  }

  public reset = () => {
    this.setSelectedVoxel();
    this.toggleSideViews(this.shouldShowSideViews);
    if (this.editor.image && this.editor.image.dimensionality < 3) {
      this.setMainViewType(ViewType.Transverse);
    }
    this.setContrast();
    this.setBrightness();
  };

  public resetSettings = () => {
    this.toggleSideViews(true);
    this.setMainViewType(ViewType.Transverse);
    this.setContrast();
    this.setBrightness();
  };

  public toJSON() {
    return {
      mainViewType: this.mainViewType,
      selectedVoxel: this.selectedVoxel.toJSON(),
      shouldShowSideViews: this.shouldShowSideViews,

      contrast: this.contrast,
      brightness: this.brightness,
    };
  }

  public async applySnapshot(snapshot: EditorViewSettingsSnapshot) {
    this.setMainViewType(snapshot.mainViewType || ViewType.Transverse);
    if (snapshot.selectedVoxel) {
      this.selectedVoxel = Vector.fromArray(snapshot.selectedVoxel);
    } else {
      this.setSelectedVoxel();
    }
    this.toggleSideViews(Boolean(snapshot.shouldShowSideViews));

    this.setContrast(snapshot.contrast);
    this.setBrightness(snapshot.brightness);
  }
}
