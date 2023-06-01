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
import * as ort from "onnxruntime-web";

import { UndoableTool } from "./undoable-tool";

export type SAMToolEmbeddingState = "uninitialized" | "loading" | "ready";
export type SAMToolBoundingBox = { topLeft: Vector; bottomRight: Vector };

// Todo: Allow configuration:
const EMBEDDING_SERVICE_URL = "http://localhost:3000/embedding";

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
  protected embedding?: ort.Tensor;
  protected inferenceSession?: ort.InferenceSession;
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
        this.embedding = undefined;
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
    if (!this.inferenceSession) return;

    console.time("prediction generation");

    const modelInput = this.getModelInput();
    if (!modelInput) return;
    const modelOutput = await this.inferenceSession.run(modelInput);
    const maskOutput = modelOutput.masks.data as Float32Array;

    console.timeEnd("prediction generation");

    this.toolRenderer.showMask(maskOutput);
  }

  protected getModelInput() {
    if (!this.embedding) return undefined;
    if (
      !this.boundingBox &&
      !this.foregroundPoints.length &&
      !this.backgroundPoints.length
    )
      return;

    const modelScale = this.getModelScaling();
    const { samScale } = modelScale;

    // We need space for all prompt points and one padding point if no
    // bounding box is present, otherwise two corner points for the bbox:
    let n = this.foregroundPoints.length + this.backgroundPoints.length;
    if (!this.boundingBox) n += 1;
    else n += 2;

    const coords = new Float32Array(n * 2);
    const labels = new Float32Array(n);

    let bboxLabelOffset = 0;
    let foregroundLabelOffset = 0;
    let backgroundLabelOffset = 0;

    if (this.boundingBoxStart && this.boundingBoxEnd) {
      const startX = Math.min(this.boundingBoxStart.x, this.boundingBoxEnd.x);
      const startY = Math.min(this.boundingBoxStart.y, this.boundingBoxEnd.y);
      const endX = Math.max(this.boundingBoxStart.x, this.boundingBoxEnd.x);
      const endY = Math.max(this.boundingBoxStart.y, this.boundingBoxEnd.y);

      coords[0] = startX * samScale;
      coords[1] = startY * samScale;
      coords[2] = endX * samScale;
      coords[3] = endY * samScale;
      labels[0] = 2;
      labels[1] = 3;

      bboxLabelOffset = 2;
    }

    for (let i = 0; i < this.foregroundPoints.length; i++) {
      const point = this.foregroundPoints[i];
      coords[i * 2 + bboxLabelOffset * 2] = point.x * samScale;
      coords[i * 2 + bboxLabelOffset * 2 + 1] = point.y * samScale;
      labels[i + bboxLabelOffset] = 1;
    }

    foregroundLabelOffset = bboxLabelOffset + this.foregroundPoints.length;

    for (let i = 0; i < this.backgroundPoints.length; i++) {
      const point = this.backgroundPoints[i];
      coords[i * 2 + foregroundLabelOffset * 2] = point.x * samScale;
      coords[i * 2 + foregroundLabelOffset * 2 + 1] = point.y * samScale;
      labels[i + foregroundLabelOffset] = 0;
    }

    backgroundLabelOffset =
      foregroundLabelOffset + this.backgroundPoints.length;

    // If no bounding box is present, add the required padding point:
    if (!this.boundingBox) {
      coords[backgroundLabelOffset * 2] = 0;
      coords[backgroundLabelOffset * 2 + 1] = 0;
      labels[backgroundLabelOffset] = -1;
    }

    const coordsTensor = new ort.Tensor("float32", coords, [1, n, 2]);
    const labelsTensor = new ort.Tensor("float32", labels, [1, n]);

    const imageSizeTensor = new ort.Tensor("float32", [
      modelScale.height,
      modelScale.width,
    ]);

    // Use empty tensor since we don't specify an input mask:
    const maskInput = new ort.Tensor(
      "float32",
      new Float32Array(256 * 256),
      [1, 1, 256, 256],
    );

    // Default to 0 since there is no input mask:
    const hasMaskInput = new ort.Tensor("float32", [0]);

    return {
      image_embeddings: this.embedding,
      point_coords: coordsTensor,
      point_labels: labelsTensor,
      orig_im_size: imageSizeTensor,
      mask_input: maskInput,
      has_mask_input: hasMaskInput,
    };
  }

  protected getModelScaling() {
    // SAM internally resized images to longest side 1024, so we need to
    // calculate the scale factor in order to resize the mask output:
    const LONG_SIDE_LENGTH = 1024;
    const width = this.imageLayer?.image.voxelCount.x ?? 0;
    const height = this.imageLayer?.image.voxelCount.y ?? 0;
    const samScale = LONG_SIDE_LENGTH / Math.max(...[width, height]);
    return { width, height, samScale };
  }

  public async loadEmbedding() {
    this.setEmbeddingState("loading");

    this.imageLayer = this.document.imageLayers.find(
      (layer) => layer.isVisible && !layer.isAnnotation,
    );
    // Todo: Handle case where no image layer is found (disable tool?):
    if (!this.imageLayer) throw new Error("No image layer found.");

    this.inferenceSession = await ort.InferenceSession.create(
      "/assets/sam_quantized.onnx",
    );

    const viewType = this.document.viewport2D.mainViewType;
    const sliceNumber = this.document.viewport2D.getSelectedSlice();

    const sliceData = this.imageLayer.image.getSliceFloat32(
      viewType,
      sliceNumber,
    );
    const imageData = new Uint8Array(sliceData.length);
    for (let i = 0; i < sliceData.length; i++) {
      imageData[i] = sliceData[i] * 255;
    }

    const file = new File([imageData], "image");
    const formdata = new FormData();
    formdata.append("image", file);
    // Todo: Make sure to adapt resolution based on selected view type.
    formdata.append("width", this.imageLayer.image.voxelCount.x.toString());
    formdata.append("height", this.imageLayer.image.voxelCount.y.toString());
    const response = await fetch(EMBEDDING_SERVICE_URL, {
      method: "POST",
      body: formdata,
    });

    const responseData = await response.arrayBuffer();
    const data = new Float32Array(responseData);

    const embeddingTensor = new ort.Tensor("float32", data, [1, 256, 64, 64]);
    this.embedding = embeddingTensor;

    this.setEmbeddingState("ready");
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
