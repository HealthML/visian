import { action, computed, makeObservable, observable } from "mobx";
import tc from "tinycolor2";

import { ISerializable } from "../types";
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

  constructor() {
    makeObservable(this, {
      backgroundColor: observable,
      image: observable,
      annotation: observable,
      theme: computed,
      setBackgroundColor: action,
      setImage: action,
      setAnnotation: action,
      rehydrate: action,
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
  }
  public async importImage(imageFile: File) {
    this.setImage(await Image.fromFile(imageFile));
  }

  public setAnnotation(image: Image) {
    this.annotation = image;
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

  public async rehydrate(snapshot: EditorSnapshot) {
    this.backgroundColor = snapshot.backgroundColor;
    this.image = snapshot.image && new Image(snapshot.image);
    this.annotation = snapshot.annotation && new Image(snapshot.annotation);
  }
}
