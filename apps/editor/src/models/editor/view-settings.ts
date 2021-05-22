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

  backgroundColor: string;
}

export class ViewSettings
  implements IViewSettings, ISerializable<ViewSettingsSnapshot> {
  public readonly excludeFromSnapshotTracking = ["document"];

  public viewMode!: ViewMode;

  public selectedVoxel = new Vector(3);

  public brightness!: number;
  public contrast!: number;

  public backgroundColor!: string;

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
      backgroundColor: observable,

      setSelectedVoxel: action,
      setViewMode: action,
      setContrast: action,
      setBrightness: action,
      setBackgroundColor: action,
      reset: action,
      applySnapshot: action,
    });
  }

  public setSelectedVoxel(x?: number, y?: number, z?: number): void {
    if (!x || !y || !z) {
      // TODO: Do not rely on `layer[0]`
      const voxelCount = (this.document.layers[0] as IImageLayer | undefined)
        ?.image.voxelCount;

      if (voxelCount) {
        this.selectedVoxel
          .copy(voxelCount)
          .map((sliceCount) => Math.floor(sliceCount / 2));
        return;
      }

      this.selectedVoxel.set(0);
      return;
    }

    this.selectedVoxel.set(x, y, z);
  }

  public setViewMode = (value?: ViewMode): void => {
    this.viewMode = value || "2D";
  };

  public setBrightness = (value?: number): void => {
    this.brightness = value ?? 1;
  };

  public setContrast = (value?: number): void => {
    this.contrast = value ?? 1;
  };

  public setBackgroundColor = (value?: string): void => {
    this.backgroundColor = value || "transparent";
  };

  public reset = (): void => {
    this.setViewMode();
    this.setSelectedVoxel();
    this.setBrightness();
    this.setContrast();
    this.setBackgroundColor();
  };

  // Serialization
  public toJSON(): ViewSettingsSnapshot {
    return {
      viewMode: this.viewMode,

      selectedVoxel: this.selectedVoxel.toJSON(),

      brightness: this.brightness,
      contrast: this.contrast,

      backgroundColor: this.backgroundColor,
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

    this.setBackgroundColor(snapshot.backgroundColor);

    return Promise.resolve();
  }
}
