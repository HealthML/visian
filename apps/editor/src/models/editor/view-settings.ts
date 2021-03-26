import { action, makeObservable, observable } from "mobx";
import * as THREE from "three";

import { maxZoom, minZoom } from "../../constants";
import { getPlaneAxes, ViewType } from "../../rendering";
import { ISerializable, StoreContext } from "../types";
import { getZoomStep, Pixel } from "../utils";
import { Voxel } from "../utils/voxel";

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
  public offset = new Pixel();

  public annotationColor = "#ff0000";
  public annotationOpacity = 0.5;

  public selectedVoxel = new Voxel();

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
    x = this.editor.image
      ? Math.round(this.editor.image?.voxelCount[0] / 2)
      : 0,
    y = this.editor.image
      ? Math.round(this.editor.image?.voxelCount[1] / 2)
      : 0,
    z = this.editor.image
      ? Math.round(this.editor.image?.voxelCount[2] / 2)
      : 0,
  ) {
    this.selectedVoxel.set(x, y, z);
  }

  public setSelectedSlice(value: number, viewType = this.mainViewType) {
    if (!this.editor.image) return;

    this.selectedVoxel.setFromView(
      viewType,
      Math.min(
        Math.max(Math.round(value), 0),
        // TODO: Adapt once voxelCount is a Voxel.
        this.editor.image.voxelCount[(viewType + 2) % 3] - 1,
      ),
    );
  }

  public getSelectedSlice(viewType = this.mainViewType) {
    return this.selectedVoxel.getFromView(viewType);
  }

  public stepSelectedSlice(stepSize = 1, viewType = this.mainViewType) {
    this.setSelectedSlice(this.getSelectedSlice(viewType) + stepSize, viewType);
  }

  public moveCrosshair(screenPosition: { x: number; y: number }) {
    const sliceRenderer = this.editor.sliceRenderer;
    if (!sliceRenderer || !this.editor.image) return;

    const intersection = sliceRenderer.raycaster.getIntersectionsFromPointer(
      screenPosition,
    )[0];
    if (!intersection || !intersection.uv) return;

    const { viewType } = intersection.object.userData;
    const [widthAxis, heightAxis] = getPlaneAxes(viewType);

    // TODO: Adapt once voxelCount is a Voxel or Vector3.
    const voxelCount = new THREE.Vector3().fromArray(
      this.editor.image.voxelCount,
    );

    this.selectedVoxel.setComponent(
      widthAxis,
      Math.floor((1 - intersection.uv.x) * voxelCount[widthAxis]),
    );
    this.selectedVoxel.setComponent(
      heightAxis,
      Math.floor(intersection.uv.y * voxelCount[heightAxis]),
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
