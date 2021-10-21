import { IEditor, TrackingLog } from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import throttle from "lodash.throttle";
import { reaction } from "mobx";

import { minTrackingEventInterval } from "../../constants";

export class Tracker implements IDisposable {
  public readonly excludeFromSnapshotTracking = ["editor"];

  protected log?: TrackingLog;

  protected disposers: IDisposer[] = [];

  constructor(protected editor: IEditor) {
    this.disposers.push(
      () => {
        window.removeEventListener("resize", this.logWindowSize);
      },
      reaction(
        () => [this.editor.activeDocument?.activeLayer?.title],
        this.logActiveLayer,
      ),
      reaction(
        () => [
          this.editor.activeDocument?.viewSettings.viewMode,
          this.editor.activeDocument?.viewport2D.mainViewType,
          this.editor.activeDocument?.viewport2D.hoveredViewType,
        ],
        this.logViewType,
      ),
      reaction(
        () => [
          this.editor.activeDocument?.viewport2D.mainViewType,
          this.editor.activeDocument?.viewport2D.getSelectedSlice(),
        ],
        this.logViewSlice,
      ),
      reaction(
        () => [
          this.editor.activeDocument?.viewport2D.hoveredScreenCoordinates,
          this.editor.activeDocument?.viewport2D.hoveredUV,
          this.editor.activeDocument?.viewport2D.hoveredVoxel,
        ],
        throttle(this.logPointerMove, minTrackingEventInterval, {
          leading: true,
          trailing: true,
        }),
      ),
    );

    window.addEventListener("resize", this.logWindowSize);
  }

  public get isActive(): boolean {
    return Boolean(this.log);
  }

  public startSession(): void {
    this.log = [{ kind: "SESSION_START", at: Date.now() }];
    this.logWindowSize();
  }

  public endSession(): TrackingLog | undefined {
    if (!this.log) return;

    const log = [...this.log];
    log?.push({ kind: "SESSION_END", at: Date.now() });
    return log;
  }

  public toFile(fileName = "log.json"): File {
    return new File([JSON.stringify(this.endSession())], fileName, {
      type: "text/plain;charset=utf-8;",
    });
  }

  public dispose(): void {
    this.disposers.forEach((disposer) => {
      disposer();
    });
  }

  protected logWindowSize = (): void => {
    this.log?.push({
      kind: "WINDOW_SIZE",
      at: Date.now(),
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    });
  };

  protected logActiveDocument = (): void => {
    this.log?.push({
      kind: "ACTIVE_DOCUMENT",
      at: Date.now(),
      id: this.editor.activeDocument?.id,
      title: this.editor.activeDocument?.title,
    });
  };

  protected logActiveLayer = (): void => {
    if (!this.editor.activeDocument) return;

    this.log?.push({
      kind: "ACTIVE_LAYER",
      at: Date.now(),
      id: this.editor.activeDocument.activeLayer?.id,
      title: this.editor.activeDocument.activeLayer?.title,
    });
  };

  protected logViewType = (): void => {
    if (!this.editor.activeDocument) return;
    const { viewMode } = this.editor.activeDocument.viewSettings;

    this.log?.push({
      kind: "VIEW_TYPE",
      at: Date.now(),
      viewMode,
      mainViewType:
        viewMode === "2D"
          ? this.editor.activeDocument.viewport2D.mainViewType
          : undefined,
      hoveredViewType:
        viewMode === "2D"
          ? this.editor.activeDocument.viewport2D.hoveredViewType
          : undefined,
    });
  };

  protected logViewSlice = (): void => {
    if (this.editor.activeDocument?.viewSettings.viewMode !== "2D") return;
    this.log?.push({
      kind: "VIEW_SLICE",
      at: Date.now(),
      viewType: this.editor.activeDocument.viewport2D.mainViewType,
      slice: this.editor.activeDocument.viewport2D.getSelectedSlice(),
    });
  };

  protected logPointerMove = (): void => {
    if (!this.editor.activeDocument) return;
    const { viewMode } = this.editor.activeDocument.viewSettings;
    const isVoxelHovered =
      viewMode === "2D" && this.editor.activeDocument.viewport2D.isVoxelHovered;

    // TODO: Make this toggleable to analyze UI usage in the future
    if (!isVoxelHovered) return;

    this.log?.push({
      kind: "POINTER_MOVE",
      at: Date.now(),
      clientX: this.editor.activeDocument.viewport2D.hoveredScreenCoordinates.x,
      clientY: this.editor.activeDocument.viewport2D.hoveredScreenCoordinates.y,

      u:
        viewMode === "2D"
          ? this.editor.activeDocument.viewport2D.hoveredUV.x
          : undefined,
      v:
        viewMode === "2D"
          ? this.editor.activeDocument.viewport2D.hoveredUV.y
          : undefined,

      voxelX: isVoxelHovered
        ? this.editor.activeDocument.viewport2D.hoveredVoxel.x
        : undefined,
      voxelY: isVoxelHovered
        ? this.editor.activeDocument.viewport2D.hoveredVoxel.y
        : undefined,
      voxelZ: isVoxelHovered
        ? this.editor.activeDocument.viewport2D.hoveredVoxel.z
        : undefined,
    });
  };
}
