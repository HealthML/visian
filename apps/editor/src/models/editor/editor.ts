import { getTheme } from "@visian/ui-shared";
import isEqual from "lodash.isequal";
import { action, computed, makeObservable, observable } from "mobx";
import tc from "tinycolor2";

import { ViewType } from "../../slice-renderer";
import { maxZoom, minZoom } from "../../constants";
import { ISerializable, StoreContext } from "../types";
import { getZoomStep, Pixel } from "../utils";
import { Voxel } from "../utils/voxel";
import { Image, ImageSnapshot } from "./image";

export interface EditorSnapshot {
  backgroundColor: string;
  image?: ImageSnapshot;
  annotation?: ImageSnapshot;
}

export class Editor implements ISerializable<EditorSnapshot> {
  public backgroundColor = getTheme("dark").colors.background;

  public image?: Image;
  public annotation?: Image;

  public brightness = 1;
  public contrast = 1;

  public mainViewType = ViewType.Transverse;
  public shouldShowSideViews = true;

  public zoomLevel = 1;
  public offset = new Pixel();

  public selectedVoxel = new Voxel();

  constructor(protected context?: StoreContext) {
    makeObservable(this, {
      backgroundColor: observable,
      image: observable,
      annotation: observable,
      brightness: observable,
      contrast: observable,
      mainViewType: observable,
      shouldShowSideViews: observable,
      zoomLevel: observable,
      offset: observable,
      selectedVoxel: observable,

      theme: computed,

      setBackgroundColor: action,
      setImage: action,
      setAnnotation: action,
      applySnapshot: action,
      setBrightness: action,
      setContrast: action,
      setMainView: action,
      setZoomLevel: action,
      zoomIn: action,
      zoomOut: action,
      setOffset: action,
      setSelectedVoxel: action,
      setSelectedSlice: action,
      stepSelectedSlice: action,
    });
  }

  public get theme(): "dark" | "light" {
    return tc(this.backgroundColor).getBrightness() / 255 > 0.5
      ? "light"
      : "dark";
  }

  public setBackgroundColor(backgroundColor: string) {
    this.backgroundColor = backgroundColor;
  }

  public setImage(image: Image) {
    this.annotation = undefined;
    this.image = image;
    this.context?.persistImmediately();

    this.setSelectedVoxel();
  }
  public async importImage(imageFile: File) {
    this.setImage(await Image.fromFile(imageFile));
  }

  public setAnnotation(image: Image) {
    if (!this.image) throw new Error("No image loaded.");
    if (!isEqual(image.voxelCount, this.image.voxelCount)) {
      throw new Error("Annotation does not match the original image's size.");
    }
    this.annotation = image;
    this.context?.persistImmediately();
  }
  public async importAnnotation(imageFile: File) {
    this.setAnnotation(await Image.fromFile(imageFile));
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

  public setOffset(x = 0, y = 0) {
    this.offset.set(x, y);
  }

  public setSelectedVoxel(
    x = this.image ? Math.round(this.image?.voxelCount[0] / 2) : 0,
    y = this.image ? Math.round(this.image?.voxelCount[1] / 2) : 0,
    z = this.image ? Math.round(this.image?.voxelCount[2] / 2) : 0,
  ) {
    this.selectedVoxel.set(x, y, z);
  }

  public setSelectedSlice(value: number, viewType = this.mainViewType) {
    if (!this.image) return;

    this.selectedVoxel.setFromView(
      viewType,
      Math.min(
        Math.max(Math.round(value), 0),
        // TODO: Adapt once voxelCount is a Voxel.
        this.image.voxelCount[(viewType + 2) % 3] - 1,
      ),
    );
  }

  public getSelectedSlice(viewType = this.mainViewType) {
    return this.selectedVoxel.getFromView(viewType);
  }

  public stepSelectedSlice(stepSize = 1, viewType = this.mainViewType) {
    this.setSelectedSlice(this.getSelectedSlice(viewType) + stepSize, viewType);
  }

  public toJSON() {
    return {
      backgroundColor: this.backgroundColor,
      image: this.image?.toJSON(),
      annotation: this.annotation?.toJSON(),
    };
  }

  public async applySnapshot(snapshot: EditorSnapshot) {
    this.backgroundColor = snapshot.backgroundColor;
    this.image = snapshot.image && new Image(snapshot.image);
    this.annotation = snapshot.annotation && new Image(snapshot.annotation);

    this.setSelectedVoxel();
  }
}
