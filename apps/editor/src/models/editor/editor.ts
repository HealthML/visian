import isEqual from "lodash.isequal";
import { action, computed, makeObservable, observable } from "mobx";
import tc from "tinycolor2";

import { ViewType } from "../../slice-renderer";
import { maxZoom, minZoom } from "../../theme";
import { ISerializable, StoreContext } from "../types";
import { getZoomStep, Pixel } from "../utils";
import { Image, ImageSnapshot } from "./image";

export interface EditorSnapshot {
  backgroundColor: string;
  image?: ImageSnapshot;
  annotation?: ImageSnapshot;
}

export class Editor implements ISerializable<EditorSnapshot> {
  public backgroundColor = "#000";

  public image?: Image;
  public annotation?: Image;

  public brightness = 1;
  public contrast = 1;

  public mainView = ViewType.Transverse;

  public zoomLevel = 1;
  public offset: Pixel = new Pixel();

  constructor(protected context?: StoreContext) {
    makeObservable(this, {
      backgroundColor: observable,
      image: observable,
      annotation: observable,
      brightness: observable,
      contrast: observable,
      mainView: observable,
      zoomLevel: observable,
      offset: observable,
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
    this.mainView = value;
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
  }
}
