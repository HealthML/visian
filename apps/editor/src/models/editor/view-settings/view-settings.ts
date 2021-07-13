import {
  IDocument,
  IImageLayer,
  IViewSettings,
  ViewMode,
} from "@visian/ui-shared";
import { ISerializable, Vector } from "@visian/utils";
import { action, makeObservable, observable } from "mobx";

export interface ViewSettingsSnapshot {
  viewMode: ViewMode;

  selectedVoxel: number[];

  brightness: number;
  contrast: number;
}

export class ViewSettings
  implements IViewSettings, ISerializable<ViewSettingsSnapshot> {
  public readonly excludeFromSnapshotTracking = ["document"];

  public viewMode!: ViewMode;

  public selectedVoxel = new Vector(3);

  public brightness!: number;
  public contrast!: number;

  constructor(
    snapshot: Partial<ViewSettingsSnapshot> | undefined,
    protected document: IDocument,
  ) {
    if (snapshot) {
      this.applySnapshot(snapshot);
    } else {
      this.reset();
    }

    makeObservable<this>(this, {
      viewMode: observable,
      selectedVoxel: observable,
      brightness: observable,
      contrast: observable,

      setSelectedVoxel: action,
      setViewMode: action,
      setContrast: action,
      setBrightness: action,
      reset: action,
      applySnapshot: action,
    });
  }

  public setSelectedVoxel(x?: number, y?: number, z?: number): void {
    const voxelCount = (this.document.layers.find(
      (layer) => layer.kind === "image",
    ) as IImageLayer | undefined)?.image.voxelCount;

    if (!x || !y || !z) {
      if (voxelCount) {
        this.selectedVoxel
          .copy(voxelCount)
          .map((sliceCount) => Math.floor(sliceCount / 2));
        return;
      }

      this.selectedVoxel.set(0);
      return;
    }

    if (voxelCount) {
      this.selectedVoxel.set(
        Math.max(Math.min(x, voxelCount.x - 1), 0),
        Math.max(Math.min(y, voxelCount.y - 1), 0),
        Math.max(Math.min(z, voxelCount.z - 1), 0),
      );

      return;
    }
    this.selectedVoxel.set(x, y, z);
  }

  public setViewMode = (value?: ViewMode): void => {
    if (!this.document.has3DLayers) {
      this.viewMode = "2D";
      return;
    }

    this.viewMode = value || "2D";
  };

  public setBrightness = (value?: number): void => {
    this.brightness = value ?? 1;
  };

  public setContrast = (value?: number): void => {
    this.contrast = value ?? 1;
  };

  public reset = (): void => {
    this.setViewMode();
    this.setSelectedVoxel();
    this.setBrightness();
    this.setContrast();
  };

  // Serialization
  public toJSON(): ViewSettingsSnapshot {
    return {
      viewMode: this.viewMode,

      selectedVoxel: this.selectedVoxel.toJSON(),

      brightness: this.brightness,
      contrast: this.contrast,
    };
  }

  public applySnapshot(snapshot: Partial<ViewSettingsSnapshot>): Promise<void> {
    this.setViewMode(snapshot.viewMode);

    if (snapshot.selectedVoxel) {
      this.setSelectedVoxel(...snapshot.selectedVoxel);
    } else {
      this.setSelectedVoxel();
    }

    this.setBrightness(snapshot.brightness);
    this.setContrast(snapshot.contrast);

    return Promise.resolve();
  }
}
