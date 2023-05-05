import { ToolRenderer } from "@visian/rendering";
import { DragPoint, IDocument, ISAMTool, ITool } from "@visian/ui-shared";
import { Vector } from "@visian/utils";
import { action, makeObservable, observable } from "mobx";
import * as ort from "onnxruntime-web";

import { Tool } from "./tool";
import { dragPointsCenterEqual } from "./utils";

export type SAMToolMode = "bounding-box" | "points";
export type SAMToolEmbeddingState = "uninitialized" | "loading" | "ready";
export type SAMToolBoundingBox = { topLeft: Vector; bottomRight: Vector };

// Todo: Allow configuration:
const EMBEDDING_SERVICE_URL = "http://localhost:3000/embedding";

export class SAMTool<N extends "sam-tool" = "sam-tool">
  extends Tool<N>
  implements ISAMTool
{
  public readonly excludeFromSnapshotTracking = ["toolRenderer", "document"];

  protected previousTool?: N;
  // Todo: Allow storing embeddings per slices / layers without having to discard previous one?
  protected embedding?: ort.Tensor;

  public embeddingState: SAMToolEmbeddingState = "uninitialized";
  public mode: SAMToolMode = "bounding-box";
  public boundingBoxStart?: DragPoint;
  public boundingBoxEnd?: DragPoint;

  constructor(document: IDocument, public toolRenderer: ToolRenderer) {
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
  }

  public get boundingBox(): { start: Vector; end: Vector } | undefined {
    if (!this.boundingBoxStart || !this.boundingBoxEnd) return undefined;
    return {
      start: Vector.fromObject(this.boundingBoxStart),
      end: Vector.fromObject(this.boundingBoxEnd),
    };
  }

  public async loadEmbedding() {
    this.setEmbeddingState("loading");

    const imageLayer = this.document.imageLayers.find(
      (layer) => layer.isVisible && !layer.isAnnotation,
    );
    // Todo: Handle case where no image layer is found (disable tool?):
    if (!imageLayer) throw new Error("No image layer found.");

    const viewType = this.document.viewport2D.mainViewType;
    const sliceNumber = this.document.viewport2D.getSelectedSlice();
    const imageData = await imageLayer.image.getSlice(viewType, sliceNumber);

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

  // Todo: Prevent single line bounding boxes.
  public endAt(_dragPoint: DragPoint): void {
    if (
      !this.boundingBoxStart ||
      dragPointsCenterEqual(_dragPoint, this.boundingBoxStart)
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
