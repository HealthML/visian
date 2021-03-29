import { action, makeObservable, observable } from "mobx";

import { maxZoom, minZoom } from "../../constants";
import { getPlaneAxes, ViewType } from "../../rendering";
import { ISerializable, StoreContext } from "../types";
import { getZoomStep, Vector } from "../utils";

import type { Editor } from "./editor";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EditorViewSettingsSnapshot {}

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
      setMainView: action,
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

  public setMainView(value: ViewType) {
    this.mainViewType = value;
  }

  public toggleSideViews(value = !this.shouldShowSideViews) {
    this.shouldShowSideViews = value;
  }

  public setZoomLevel(value = 1) {
    this.zoomLevel = value;
  }

  public zoomIn() {
    this.zoomLevel = Math.min(
      maxZoom,
      this.zoomLevel + getZoomStep(this.zoomLevel),
    );
  }

  public zoomOut() {
    this.zoomLevel = Math.max(
      minZoom,
      this.zoomLevel - getZoomStep(this.zoomLevel),
    );
  }

  public setOffset({ x = 0, y = 0 }) {
    this.offset.set(x, y);
  }

  public setAnnotationColor(value: string) {
    this.annotationColor = value;
  }

  public setAnnotationOpacity(value = 0.5) {
    this.annotationOpacity = value;
  }

  public setSelectedVoxel(
    x = this.editor.image ? Math.round(this.editor.image?.voxelCount.x / 2) : 0,
    y = this.editor.image ? Math.round(this.editor.image?.voxelCount.y / 2) : 0,
    z = this.editor.image ? Math.round(this.editor.image?.voxelCount.z / 2) : 0,
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

  public stepSelectedSlice(stepSize = 1, viewType = this.mainViewType) {
    this.setSelectedSlice(this.getSelectedSlice(viewType) + stepSize, viewType);
  }

  public moveCrosshair(
    screenPosition: { x: number; y: number },
    canvasId: string,
  ) {
    const sliceRenderer = this.editor.sliceRenderer;
    if (!sliceRenderer || !this.editor.image) return;

    const intersection = sliceRenderer.raycaster.getIntersectionsFromPointer(
      screenPosition,
      canvasId,
    )[0];
    if (!intersection || !intersection.uv) return;

    const { viewType } = intersection.object.userData;
    const [widthAxis, heightAxis] = getPlaneAxes(viewType);

    this.selectedVoxel[widthAxis] = Math.floor(
      (1 - intersection.uv.x) * this.editor.image.voxelCount[widthAxis],
    );
    this.selectedVoxel[heightAxis] = Math.floor(
      intersection.uv.y * this.editor.image.voxelCount[heightAxis],
    );
  }

  public reset() {
    this.setSelectedVoxel();
  }

  public toJSON() {
    return {};
  }

  public async applySnapshot(snapshot: EditorViewSettingsSnapshot) {
    // Intentionally left blank
  }
}
