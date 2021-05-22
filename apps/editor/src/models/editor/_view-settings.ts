// DEPRECATED

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
  showSideViews?: boolean;

  annotationColor?: string;
  contrast?: number;
  brightness?: number;
}

export class EditorViewSettings
  implements ISerializable<EditorViewSettingsSnapshot> {
  public static readonly excludeFromSnapshotTracking = ["/editor"];

  public brightness = 1;
  public contrast = 1;

  public mainViewType = ViewType.Transverse;
  public showSideViews = true;

  public zoomLevel = 1;
  public offset = new Vector(2);

  public annotationColor!: string;
  public annotationOpacity = 0.5;

  public selectedVoxel = new Vector(3);

  constructor(protected editor: Editor, protected context?: StoreContext) {
    this.setAnnotationColor();

    makeObservable(this, {
      brightness: observable,
      contrast: observable,
      mainViewType: observable,
      showSideViews: observable,
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
    if (this.editor.tools.isDrawing) return;

    this.mainViewType = this.editor.isIn3DMode ? value : ViewType.Transverse;
  };

  public toggleSideViews = (value = !this.showSideViews) => {
    this.showSideViews = value;
  };

  public setZoomLevel(value = 1) {
    if (this.editor.tools.isDrawing) return;

    this.zoomLevel = value;
  }
  public get zoomStep() {
    return zoomStep * Math.sqrt(this.zoomLevel);
  }

  public get pixelSize() {
    const { image } = this.editor;
    if (!image) return undefined;

    const [width, height] = getPlaneAxes(this.mainViewType);

    return new Vector(2).set(
      this.zoomLevel / image.voxelCount[width],
      this.zoomLevel / image.voxelCount[height],
    );
  }

  public zoomIn() {
    if (this.editor.tools.isDrawing) return;

    this.zoomLevel = Math.min(maxZoom, this.zoomLevel + this.zoomStep);
  }

  public zoomOut() {
    if (this.editor.tools.isDrawing) return;

    this.zoomLevel = Math.max(minZoom, this.zoomLevel - this.zoomStep);
  }

  public setOffset({ x = 0, y = 0 } = {}) {
    if (this.editor.tools.isDrawing) return;

    this.offset.set(x, y);
  }

  public setAnnotationColor(
    value = this.context?.getTheme().colors["Salient Safran"] || "#ff0000",
  ) {
    this.annotationColor = value;
  }

  public setAnnotationOpacity(value = 0.5) {
    this.annotationOpacity = value;
  }

  public setSelectedVoxel(
    x = this.editor.image ? Math.floor(this.editor.image?.voxelCount.x / 2) : 0,
    y = this.editor.image ? Math.floor(this.editor.image?.voxelCount.y / 2) : 0,
    z = this.editor.image ? Math.floor(this.editor.image?.voxelCount.z / 2) : 0,
    forceUpdate?: boolean,
  ) {
    if (this.editor.tools.isDrawing && !forceUpdate) return;
    this.selectedVoxel.set(x, y, z);
  }

  public setSelectedSlice(value: number, viewType = this.mainViewType) {
    if (!this.editor.image || this.editor.tools.isDrawing) {
      return;
    }

    this.selectedVoxel.setFromView(
      viewType,
      Math.min(
        Math.max(Math.round(value), 0),
        this.editor.image.voxelCount.getFromView(viewType) - 1,
      ),
    );
  }

  public getSelectedSlice(viewType = this.mainViewType) {
    return this.selectedVoxel.getFromView(viewType);
  }

  public getMaxSlice(viewType = this.mainViewType) {
    const sliceCount = this.editor.image?.voxelCount.getFromView(viewType);
    return sliceCount ? sliceCount - 1 : 0;
  }

  public stepSelectedSlice(stepSize = 1, viewType = this.mainViewType) {
    this.setSelectedSlice(this.getSelectedSlice(viewType) + stepSize, viewType);
  }

  public moveCrosshair(_screenPosition: Pixel, _canvasId: string) {
    // if (this.editor.tools.isDrawing) return;
    // const { sliceRenderer } = this.editor;
    // if (!sliceRenderer || !this.editor.image || !this.showSideViews) return;
    // const intersection = sliceRenderer.raycaster.getIntersectionsFromPointer(
    //   screenPosition,
    //   canvasId,
    // )[0];
    // if (!intersection || !intersection.uv) return;
    // const { viewType } = intersection.object.userData;
    // const [widthAxis, heightAxis] = getPlaneAxes(viewType);
    // this.selectedVoxel[widthAxis] = Math.floor(
    //   intersection.uv.x * this.editor.image.voxelCount[widthAxis],
    // );
    // this.selectedVoxel[heightAxis] = Math.floor(
    //   intersection.uv.y * this.editor.image.voxelCount[heightAxis],
    // );
  }

  public reset = () => {
    this.setSelectedVoxel();
    if (!this.editor.isIn3DMode) this.setMainViewType(ViewType.Transverse);
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
      showSideViews: this.showSideViews,

      annotationColor: this.annotationColor,
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
    this.toggleSideViews(Boolean(snapshot.showSideViews));

    this.setAnnotationColor(snapshot.annotationColor);
    this.setContrast(snapshot.contrast);
    this.setBrightness(snapshot.brightness);
  }
}
