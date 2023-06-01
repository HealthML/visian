import { SamRenderer } from "@visian/rendering";
import {
  DragPoint,
  IDocument,
  IImageLayer,
  ISAMTool,
  ITool,
} from "@visian/ui-shared";
import { Vector } from "@visian/utils";
// eslint-disable-next-line import/no-extraneous-dependencies
import { debounce } from "lodash";
import { action, makeObservable, observable, reaction } from "mobx";

import { SAM } from "../../sam/SAM";
import { UndoableTool } from "./undoable-tool";

export type SAMToolEmbeddingState = "uninitialized" | "loading" | "ready";
export type SAMToolBoundingBox = { topLeft: Vector; bottomRight: Vector };

export class SAMTool<N extends "sam-tool" = "sam-tool">
  extends UndoableTool<N>
  implements ISAMTool
{
  public readonly excludeFromSnapshotTracking = [
    "toolRenderer",
    "document",
    "inRightClickMode",
    "boundingBoxStart",
    "boundingBoxEnd",
    "foregroundPoints",
    "backgroundPoints",
    "lastClick",
  ];

  protected previousTool?: N;
  // Todo: Allow storing embeddings per slices / layers without having to discard previous one?
  protected sam: SAM;
  protected imageLayer?: IImageLayer;
  protected debouncedGeneratePrediction: () => void;

  public embeddingState: SAMToolEmbeddingState = "uninitialized";

  protected lastClick?: Vector;

  public isInRightClickMode = false;
  public boundingBoxStart?: Vector;
  public boundingBoxEnd?: Vector;
  public foregroundPoints: Vector[] = [];
  public backgroundPoints: Vector[] = [];

  constructor(document: IDocument, public toolRenderer: SamRenderer) {
    super(
      {
        name: "sam-tool" as N,
        altToolName: "sam-tool" as N,
        icon: "copilot",
        labelTx: "sam-tool",
        supportedViewModes: ["2D"],
        supportedLayerKinds: ["image"],
        supportAnnotationsOnly: true,
        activationKeys: "",
      },
      document,
      toolRenderer,
    );

    this.sam = new SAM();

    this.debouncedGeneratePrediction = debounce(
      () => this.generatePrediction(),
      30,
    );

    // When the selected slice changes, we just discard the embedding for now:
    reaction(
      () => this.document.viewport2D.getSelectedSlice(),
      () => {
        this.resetPromptInputs();
        this.setEmbeddingState("uninitialized");
        this.sam.reset();
        this.toolRenderer.clearMask();
      },
    );

    makeObservable(this, {
      embeddingState: observable,
      isInRightClickMode: observable,
      boundingBoxStart: observable,
      boundingBoxEnd: observable,
      foregroundPoints: observable,
      backgroundPoints: observable,

      setEmbeddingState: action,
      setToRightClickMode: action,
      setBoundingBoxStart: action,
      setBoundingBoxEnd: action,
      setForegroundPoints: action,
      setBackgroundPoints: action,
    });

    reaction(
      () => [this.boundingBox, this.foregroundPoints, this.backgroundPoints],
      () => {
        if (
          !this.boundingBox &&
          !this.foregroundPoints.length &&
          !this.backgroundPoints.length
        ) {
          this.toolRenderer.clearMask();
          return;
        }
        this.debouncedGeneratePrediction();
      },
    );
  }

  public setEmbeddingState(state: SAMToolEmbeddingState) {
    this.embeddingState = state;
  }

  public setToRightClickMode(value = true) {
    this.isInRightClickMode = value;
  }

  public setBoundingBoxStart(point?: Vector) {
    this.boundingBoxStart = point;
  }

  public setBoundingBoxEnd(point?: Vector) {
    this.boundingBoxEnd = point;
  }

  public setForegroundPoints(points: Vector[]) {
    this.foregroundPoints = points;
  }

  public setBackgroundPoints(points: Vector[]) {
    this.backgroundPoints = points;
  }

  public get boundingBox(): { start: Vector; end: Vector } | undefined {
    if (!this.boundingBoxStart || !this.boundingBoxEnd) return undefined;
    return { start: this.boundingBoxStart, end: this.boundingBoxEnd };
  }

  public get isHoveringPoint() {
    const hovered = Vector.fromObject(this.document.viewport2D.hoveredVoxel);
    return (
      this.foregroundPoints.find((point) => point.equals(hovered)) ||
      this.backgroundPoints.find((point) => point.equals(hovered))
    );
  }

  protected async generatePrediction() {
    if (!this.sam.isReady()) return;

    let boundingBox;
    if (this.boundingBoxStart && this.boundingBoxEnd) {
      const startX = Math.min(this.boundingBoxStart.x, this.boundingBoxEnd.x);
      const startY = Math.min(this.boundingBoxStart.y, this.boundingBoxEnd.y);
      const endX = Math.max(this.boundingBoxStart.x, this.boundingBoxEnd.x);
      const endY = Math.max(this.boundingBoxStart.y, this.boundingBoxEnd.y);
      boundingBox = {
        topLeft: new Vector([startX, startY]),
        bottomRight: new Vector([endX, endY]),
      };
    }

    const mask = await this.sam.getMask(
      boundingBox,
      this.foregroundPoints,
      this.backgroundPoints,
    );

    if (mask) this.toolRenderer.showMask(mask);
  }

  public async loadEmbedding() {
    this.setEmbeddingState("loading");

    this.imageLayer = this.document.imageLayers.find(
      (layer) => layer.isVisible && !layer.isAnnotation,
    );
    // Todo: Handle case where no image layer is found (disable tool?):
    if (!this.imageLayer) throw new Error("No image layer found.");

    const viewType = this.document.viewport2D.mainViewType;
    const sliceNumber = this.document.viewport2D.getSelectedSlice();

    const sliceData = this.imageLayer.image.getSliceFloat32(
      viewType,
      sliceNumber,
    );
    await this.sam.loadEmbedding(
      sliceData,
      this.imageLayer.image.voxelCount.x,
      this.imageLayer.image.voxelCount.y,
    );

    this.setEmbeddingState("ready");
    this.generatePrediction();
  }

  public startAt(click: DragPoint): void {
    this.lastClick = Vector.fromObject(click);
  }

  public moveTo(_dragPoint: DragPoint): void {
    const dragPoint = Vector.fromObject(_dragPoint);
    if (this.lastClick?.equals(dragPoint)) return;

    this.setBoundingBoxStart(this.lastClick);
    this.setBoundingBoxEnd(dragPoint);
  }

  public endAt(_dragPoint: DragPoint): void {
    const clickPoint = Vector.fromObject(_dragPoint);

    // If the cursor did not move, assume the user wanted to modify a point:
    if (this.lastClick?.equals(clickPoint)) {
      // Delete all potentially present points (should not be a performance
      // issue since there should not be too many points usually):
      const wasFPointDeleted = this.deleteForegroundPoint(clickPoint);
      const wasBPointDeleted = this.deleteBackgroundPoint(clickPoint);
      // Re-add or create a foreground point — if in right click mode,
      // create a background point if the user did not intend to delete a point:
      if (!this.isInRightClickMode) {
        this.setForegroundPoints([...this.foregroundPoints, clickPoint]);
      } else if (!wasFPointDeleted && !wasBPointDeleted) {
        this.setBackgroundPoints([...this.backgroundPoints, clickPoint]);
      }
      this.setToRightClickMode(false);
      return;
    }

    // If the cursor did move but ended up in the same spot, clear the bounding box:
    if (
      this.boundingBoxStart &&
      (this.lastClick?.equals(clickPoint) ||
        this.boundingBoxStart.x === clickPoint.x ||
        this.boundingBoxStart.y === clickPoint.y)
    ) {
      this.setBoundingBoxStart(undefined);
      this.setBoundingBoxEnd(undefined);
      this.lastClick = undefined;
    }

    this.setToRightClickMode(false);
  }

  protected deleteForegroundPoint(clickPoint: Vector) {
    const prevLength = this.foregroundPoints.length;
    const newFPoints = this.foregroundPoints.filter(
      (point) => !point.equals(clickPoint),
    );
    this.setForegroundPoints(newFPoints);
    return newFPoints.length < prevLength;
  }

  protected deleteBackgroundPoint(clickPoint: Vector) {
    const prevLength = this.backgroundPoints.length;
    const newBPoints = this.backgroundPoints.filter(
      (point) => !point.equals(clickPoint),
    );
    this.setBackgroundPoints(newBPoints);
    return newBPoints.length < prevLength;
  }

  protected resetPromptInputs() {
    this.setForegroundPoints([]);
    this.setBackgroundPoints([]);
    this.setBoundingBoxStart(undefined);
    this.setBoundingBoxEnd(undefined);
    this.lastClick = undefined;
  }

  public activate(previousTool?: ITool<N>) {
    this.previousTool = previousTool?.name;

    const targetLayer = this.document.activeLayer;
    if (
      targetLayer &&
      this.document.activeLayer?.kind === "image" &&
      this.document.activeLayer.isAnnotation &&
      this.document.activeLayer.isVisible
    ) {
      this.toolRenderer.render();
    } else {
      this.document.tools.setActiveTool(previousTool);
      this.document.setShowLayerMenu(true);
    }
  }

  public close = () => {
    this.document.tools.setActiveTool(this.previousTool);
  };

  public submit = () => {
    // startStroke is required to store previous state so the cmd can be undone
    this.startStroke();
    // endStroke flushes the mask to annotation and adds the cmd to undo history
    this.endStroke(false);
    // We need to wait until rendering is finished because the endStroke
    // method also waits internally. Otherwise the mask would be cleared
    // before it could be flushed.
    this.toolRenderer.waitForRender().then(() => this.resetPromptInputs());
  };

  public discard = () => {
    this.resetPromptInputs();
  };

  public deactivate() {
    this.discard();
  }
}
