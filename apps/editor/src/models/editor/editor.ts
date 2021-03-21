import isEqual from "lodash.isequal";
import { action, computed, makeObservable, observable } from "mobx";
import tc from "tinycolor2";

import { ISerializable, StoreContext } from "../types";
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

  constructor(protected context?: StoreContext) {
    makeObservable(this, {
      backgroundColor: observable,
      image: observable,
      annotation: observable,
      theme: computed,
      setBackgroundColor: action,
      setImage: action,
      setAnnotation: action,
      applySnapshot: action,
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
