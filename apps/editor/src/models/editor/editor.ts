import { getTheme } from "@visian/ui-shared";
import { Image, ImageSnapshot, ISerializable } from "@visian/utils";
import isEqual from "lodash.isequal";
import { action, computed, makeObservable, observable } from "mobx";
import tc from "tinycolor2";

import { StoreContext } from "../types";
import { EditorViewSettings } from "./view-settings";

import type { SliceRenderer } from "../../rendering";
export interface EditorSnapshot {
  backgroundColor: string;
  image?: ImageSnapshot;
  annotation?: ImageSnapshot;
}

export class Editor implements ISerializable<EditorSnapshot> {
  public static readonly excludeFromSnapshotTracking = [
    ...EditorViewSettings.excludeFromSnapshotTracking.map(
      (path) => `/viewSettings${path}`,
    ),
    "/sliceRenderer",
  ];

  public sliceRenderer?: SliceRenderer;

  // Layers
  public foregroundColor = "#ffffff";
  public annotation?: Image;
  public image?: Image;
  public backgroundColor = getTheme("dark").colors.background;

  public viewSettings: EditorViewSettings;

  constructor(protected context?: StoreContext) {
    this.viewSettings = new EditorViewSettings(this, context);

    makeObservable(this, {
      sliceRenderer: observable,
      foregroundColor: observable,
      image: observable,
      annotation: observable,
      backgroundColor: observable,

      theme: computed,

      setSliceRenderer: action,
      setForegroundColor: action,
      setImage: action,
      setAnnotation: action,
      setBackgroundColor: action,
      applySnapshot: action,
    });
  }

  public get theme(): "dark" | "light" {
    return tc(this.backgroundColor).getBrightness() / 255 > 0.5
      ? "light"
      : "dark";
  }

  public setSliceRenderer(sliceRenderer?: SliceRenderer) {
    this.sliceRenderer = sliceRenderer;
  }

  public setForegroundColor(foregroundColor: string) {
    this.foregroundColor = foregroundColor;
  }

  public setImage(image: Image) {
    this.annotation = undefined;
    this.image = image;
    this.context?.persistImmediately();

    this.viewSettings.reset();
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

  public setBackgroundColor(backgroundColor: string) {
    this.backgroundColor = backgroundColor;
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

    this.viewSettings.reset();
  }
}
