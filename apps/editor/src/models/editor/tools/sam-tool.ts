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
import { action, makeObservable, observable } from "mobx";
import * as ort from "onnxruntime-web";

import { UndoableTool } from "./undoable-tool";
import { dragPointsCenterEqual } from "./utils";

export type SAMToolMode = "bounding-box" | "points";
export type SAMToolEmbeddingState = "uninitialized" | "loading" | "ready";
export type SAMToolBoundingBox = { topLeft: Vector; bottomRight: Vector };

// Todo: Allow configuration:
const EMBEDDING_SERVICE_URL = "http://localhost:3000/embedding";

export class SAMTool<N extends "sam-tool" = "sam-tool">
  extends UndoableTool<N>
  implements ISAMTool
{
  public readonly excludeFromSnapshotTracking = ["toolRenderer", "document"];

  protected previousTool?: N;
  // Todo: Allow storing embeddings per slices / layers without having to discard previous one?
  protected embedding?: ort.Tensor;
  protected inferenceSession?: ort.InferenceSession;
  protected imageLayer?: IImageLayer;
  protected debouncedGeneratePrediction: () => void;

  public embeddingState: SAMToolEmbeddingState = "uninitialized";
  public mode: SAMToolMode = "bounding-box";
  public boundingBoxStart?: DragPoint;
  public boundingBoxEnd?: DragPoint;

  constructor(document: IDocument, public toolRenderer: SamRenderer) {
    super(
      {
        name: "sam-tool" as N,
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

    makeObservable(this, {
      mode: observable,
      embeddingState: observable,
      boundingBoxStart: observable,
      boundingBoxEnd: observable,
      setMode: action,
      setEmbeddingState: action,
      setBoundingBoxStart: action,
      setBoundingBoxEnd: action,
    });
  }

  public setMode(mode: SAMToolMode) {
    this.mode = mode;
  }

  public setEmbeddingState(state: SAMToolEmbeddingState) {
    this.embeddingState = state;
  }

  public setBoundingBoxStart(dragPoint?: DragPoint) {
    this.boundingBoxStart = dragPoint;
  }

  public setBoundingBoxEnd(dragPoint?: DragPoint) {
    this.boundingBoxEnd = dragPoint;
    this.debouncedGeneratePrediction();
  }

  public get boundingBox(): { start: Vector; end: Vector } | undefined {
    if (!this.boundingBoxStart || !this.boundingBoxEnd) return undefined;
    return {
      start: Vector.fromObject(this.boundingBoxStart),
      end: Vector.fromObject(this.boundingBoxEnd),
    };
  }

  protected async generatePrediction() {
    if (!this.boundingBoxEnd || !this.inferenceSession) return;

    const start = Date.now();

    const modelInput = this.getModelInput();
    if (!modelInput) return;
    const modelOutput = await this.inferenceSession.run(modelInput);
    const maskOutput = modelOutput.masks.data as Float32Array;

    const end = Date.now();
    console.log(`Prediction took ${end - start}ms.`);

    this.toolRenderer.showMask(maskOutput);
  }

  protected getModelInput() {
    if (!this.boundingBoxStart || !this.boundingBoxEnd || !this.embedding) {
      return undefined;
    }
    const modelScale = this.getModelScaling();

    const startX = Math.min(this.boundingBoxStart.x, this.boundingBoxEnd.x);
    const startY = Math.min(this.boundingBoxStart.y, this.boundingBoxEnd.y);
    const endX = Math.max(this.boundingBoxStart.x, this.boundingBoxEnd.x);
    const endY = Math.max(this.boundingBoxStart.y, this.boundingBoxEnd.y);

    const pointCoords = new Float32Array([
      startX * modelScale.samScale,
      startY * modelScale.samScale,
      endX * modelScale.samScale,
      endY * modelScale.samScale,
    ]);
    const pointLabels = new Float32Array([2, 3]);

    const pointCoordsTensor = new ort.Tensor("float32", pointCoords, [1, 2, 2]);
    const pointLabelsTensor = new ort.Tensor("float32", pointLabels, [1, 2]);

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
      point_coords: pointCoordsTensor,
      point_labels: pointLabelsTensor,
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

  public startAt(_dragPoint: DragPoint): void {
    this.setBoundingBoxStart(_dragPoint);
    this.setBoundingBoxEnd(undefined);
  }

  public moveTo(_dragPoint: DragPoint): void {
    this.setBoundingBoxEnd(_dragPoint);
  }

  public endAt(_dragPoint: DragPoint): void {
    if (
      !this.boundingBoxStart ||
      dragPointsCenterEqual(_dragPoint, this.boundingBoxStart) ||
      this.boundingBoxStart.x === _dragPoint.x ||
      this.boundingBoxStart.y === _dragPoint.y
    ) {
      this.setBoundingBoxStart(undefined);
      this.setBoundingBoxEnd(undefined);
    }
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
    console.log("submitted");
  };

  public discard = () => {
    this.setBoundingBoxStart(undefined);
    this.setBoundingBoxEnd(undefined);
    console.log("discarded");
  };

  public deactivate() {
    this.discard();
  }

  public accept() {
    console.log("Annotation accepted.");
  }
}
