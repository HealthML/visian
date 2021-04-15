import { getTheme } from "@visian/ui-shared";
import {
  Image,
  ImageSnapshot,
  ISerializable,
  writeSingleMedicalImage,
} from "@visian/utils";
import isEqual from "lodash.isequal";
import { action, makeObservable, observable } from "mobx";
import FileSaver from "file-saver";

import { StoreContext } from "../types";
import { EditorTools } from "./tools";
import { EditorUndoRedo } from "./undo-redo";
import {
  EditorViewSettings,
  EditorViewSettingsSnapshot,
} from "./view-settings";

import type { SliceRenderer } from "../../rendering";
export interface EditorSnapshot {
  backgroundColor?: string;
  image?: ImageSnapshot;
  annotation?: ImageSnapshot;

  viewSettings?: EditorViewSettingsSnapshot;
}

export class Editor implements ISerializable<EditorSnapshot> {
  public static readonly excludeFromSnapshotTracking = [
    ...EditorViewSettings.excludeFromSnapshotTracking.map(
      (path) => `/viewSettings${path}`,
    ),
    ...EditorTools.excludeFromSnapshotTracking.map((path) => `/tools${path}`),
    ...EditorUndoRedo.excludeFromSnapshotTracking.map(
      (path) => `/undoRedo${path}`,
    ),
    "/sliceRenderer",
  ];

  public sliceRenderer?: SliceRenderer;

  // Layers
  public foregroundColor = "#ffffff";
  public annotation?: Image;
  public isAnnotationVisible = true;
  public image?: Image;
  public isImageVisible = true;
  protected backgroundColor?: string;

  public viewSettings: EditorViewSettings;
  public tools: EditorTools;
  public undoRedo: EditorUndoRedo;

  constructor(protected context: StoreContext) {
    this.viewSettings = new EditorViewSettings(this, context);
    this.tools = new EditorTools(this, context);
    this.undoRedo = new EditorUndoRedo(this, context);

    makeObservable<this, "backgroundColor">(this, {
      sliceRenderer: observable,
      foregroundColor: observable,
      annotation: observable,
      isAnnotationVisible: observable,
      image: observable,
      isImageVisible: observable,
      backgroundColor: observable,

      setSliceRenderer: action,
      setForegroundColor: action,
      setImage: action,
      setAnnotation: action,
      setIsImageVisible: action,
      setIsAnnotationVisible: action,
      setBackgroundColor: action,
      applySnapshot: action,
    });
  }

  public getBackgroundColor() {
    return (
      this.backgroundColor ||
      getTheme(this.context.getTheme()).colors.background
    );
  }

  public setSliceRenderer(sliceRenderer?: SliceRenderer) {
    this.sliceRenderer = sliceRenderer;
  }

  public setForegroundColor(foregroundColor: string) {
    this.foregroundColor = foregroundColor;
  }

  public setImage(image: Image) {
    this.image = image;
    this.annotation = new Image({
      name: `${this.image.name.split(".")[0]}_annotation`,
      origin: this.image.origin.toArray(),
      orientation: this.image.orientation,
      voxelCount: this.image.voxelCount.toArray(),
      voxelSpacing: this.image.voxelSpacing.toArray(),
    });
    this.context?.persistImmediately();

    this.viewSettings.reset();
    this.undoRedo.clear();
  }
  public async importImage(imageFile: File) {
    this.setImage(await Image.fromFile(imageFile));
  }

  public setAnnotation(image: Image) {
    if (!this.image) throw new Error("no-image-error");
    if (!isEqual(image.voxelCount, this.image.voxelCount)) {
      throw new Error("annotation-mismatch-error");
    }
    this.annotation = image;
    this.context?.persistImmediately();

    this.undoRedo.clear();
  }
  public async importAnnotation(imageFile: File) {
    this.setAnnotation(await Image.fromFile(imageFile));
  }

  public setBackgroundColor(backgroundColor: string) {
    this.backgroundColor = backgroundColor;
  }

  public setIsImageVisible(value: boolean) {
    this.isImageVisible = value;
  }
  public setIsAnnotationVisible(value: boolean) {
    this.isAnnotationVisible = value;
  }

  public quickExport = async () => {
    const image = this.annotation;
    if (!image) return;

    const file = await writeSingleMedicalImage(
      image.toITKImage(),
      `${image.name.split(".")[0]}.nii.gz`,
    );

    if (!file) return;
    FileSaver.saveAs(file, file.name);
  };

  public toJSON() {
    return {
      backgroundColor: this.backgroundColor,
      image: this.image?.toJSON(),
      annotation: this.annotation?.toJSON(),

      viewSettings: this.viewSettings.toJSON(),
    };
  }

  public async applySnapshot(snapshot: EditorSnapshot) {
    this.backgroundColor = snapshot.backgroundColor;
    this.image = snapshot.image && new Image(snapshot.image);
    this.annotation = snapshot.annotation && new Image(snapshot.annotation);

    if (snapshot.viewSettings) {
      this.viewSettings.applySnapshot(snapshot.viewSettings);
    }
  }
}
