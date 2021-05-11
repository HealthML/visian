import {
  ImageSnapshot,
  ISerializable,
  writeSingleMedicalImage,
} from "@visian/utils";
import FileSaver from "file-saver";
import isEqual from "lodash.isequal";
import { action, makeObservable, observable } from "mobx";

import { EditorTools, RenderedImage, SliceRenderer } from "../../rendering";
import { StoreContext } from "../types";
import { EditorMarkers } from "./markers";
import { EditorUndoRedo } from "./undo-redo";
import {
  EditorViewSettings,
  EditorViewSettingsSnapshot,
} from "./view-settings";

export interface EditorSnapshot {
  backgroundColor?: string;
  image?: ImageSnapshot;
  annotation?: ImageSnapshot;

  viewSettings?: EditorViewSettingsSnapshot;
}

export class Editor implements ISerializable<EditorSnapshot> {
  public static readonly excludeFromSnapshotTracking = [
    "/markers",
    ...EditorViewSettings.excludeFromSnapshotTracking.map(
      (path) => `/viewSettings${path}`,
    ),
    ...EditorTools.excludeFromSnapshotTracking.map((path) => `/tools${path}`),
    ...EditorUndoRedo.excludeFromSnapshotTracking.map(
      (path) => `/undoRedo${path}`,
    ),
    "/sliceRenderer",
  ];

  public markers: EditorMarkers;
  public sliceRenderer?: SliceRenderer;

  // Layers
  public foregroundColor = "#ffffff";
  public annotation?: RenderedImage;
  public isAnnotationVisible = true;
  public image?: RenderedImage;
  public isImageVisible = true;
  protected backgroundColor?: string;

  public viewSettings: EditorViewSettings;
  public tools: EditorTools;
  public undoRedo: EditorUndoRedo;

  public renderers?: THREE.WebGLRenderer[];

  constructor(protected context: StoreContext) {
    this.viewSettings = new EditorViewSettings(this, context);
    this.undoRedo = new EditorUndoRedo(this, context);

    makeObservable<this, "backgroundColor">(this, {
      sliceRenderer: observable,
      foregroundColor: observable,
      annotation: observable,
      isAnnotationVisible: observable,
      image: observable,
      isImageVisible: observable,
      backgroundColor: observable,
      renderers: observable.ref,

      setSliceRenderer: action,
      setForegroundColor: action,
      setImage: action,
      setAnnotation: action,
      setIsImageVisible: action,
      setIsAnnotationVisible: action,
      setBackgroundColor: action,
      applySnapshot: action,
    });

    this.tools = new EditorTools(this, context);
    this.markers = new EditorMarkers(this, this.context);
  }

  public get refs() {
    return this.context.getRefs();
  }
  public get theme() {
    return this.context.getTheme();
  }

  public getBackgroundColor() {
    return this.backgroundColor || this.context.getTheme().colors.background;
  }

  public setSliceRenderer(sliceRenderer?: SliceRenderer) {
    this.sliceRenderer = sliceRenderer;

    this.renderers = this.sliceRenderer?.renderers;
  }

  public setForegroundColor(foregroundColor: string) {
    this.foregroundColor = foregroundColor;
  }

  public setImage(image: RenderedImage) {
    this.image = image;
    this.annotation = new RenderedImage({
      name: `${this.image.name.split(".")[0]}_annotation`,
      dimensionality: this.image.dimensionality,
      origin: this.image.origin.toArray(),
      orientation: this.image.orientation,
      voxelCount: this.image.voxelCount.toArray(),
      voxelSpacing: this.image.voxelSpacing.toArray(),
    });
    this.context?.persistImmediately();

    this.tools.setActiveTool();
    this.viewSettings.reset();
    this.undoRedo.clear();
  }
  public async importImage(imageFile: File) {
    this.setImage(await RenderedImage.fromFile(imageFile));
  }

  public setAnnotation(image: RenderedImage) {
    if (!this.image) throw new Error("no-image-error");
    if (!isEqual(image.voxelCount, this.image.voxelCount)) {
      throw new Error("annotation-mismatch-error");
    }
    this.annotation = image;
    this.context?.persistImmediately();

    this.undoRedo.clear();
  }
  public async importAnnotation(imageFile: File) {
    this.setAnnotation(await RenderedImage.fromFile(imageFile));
  }

  public get isIn3DMode() {
    if (!this.image) return false;
    return (
      this.image.voxelCount
        .toArray()
        .reduce((previous, current) => previous + (current > 1 ? 1 : 0), 0) > 2
    );
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
    if (image.dimensionality < 3) return this.quickExportSlice();

    const file = await writeSingleMedicalImage(
      image.toITKImage(),
      `${image.name.split(".")[0]}.nii.gz`,
    );

    if (!file) return;
    FileSaver.saveAs(file, file.name);
  };

  public quickExportSlice = async () => {
    const image = this.annotation;
    if (!image) return;

    const sliceImage = image.getSliceImage(
      this.viewSettings.getSelectedSlice(),
      this.viewSettings.mainViewType,
    );
    const file = await writeSingleMedicalImage(
      sliceImage.toITKImage(),
      `${sliceImage.name.split(".")[0]}.png`,
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
    this.image = snapshot.image && new RenderedImage(snapshot.image);
    this.annotation =
      snapshot.annotation && new RenderedImage(snapshot.annotation);
    this.markers.inferAnnotatedSlices();

    if (snapshot.viewSettings) {
      this.viewSettings.applySnapshot(snapshot.viewSettings);
    }
  }
}
