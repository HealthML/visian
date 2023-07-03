import { IImageLayer } from "@visian/ui-shared";
import { getPlaneAxes, Vector, ViewType } from "@visian/utils";
import * as ort from "onnxruntime-web";

export type SAMModelBoundingBox = { start: Vector; end: Vector };

// Todo: Allow configuration:
const EMBEDDING_SERVICE_URL = "http://localhost:3000/embedding";

export class SAM {
  private viewType?: ViewType;
  private embedding?: ort.Tensor;
  private inferenceSession?: ort.InferenceSession;
  private inputScale?: { width: number; height: number; samScale: number };

  public isReady() {
    return !!this.embedding && !!this.inferenceSession;
  }

  public reset() {
    this.embedding = undefined;
    this.inferenceSession = undefined;
    this.inputScale = undefined;
  }

  public async getEmbedding(
    imageLayer: IImageLayer,
    viewType: ViewType,
    sliceNumber: number,
  ) {
    this.viewType = viewType;

    const imageData = imageLayer.image.getSliceFloat32(viewType, sliceNumber);
    const voxels = this.get2DVector(imageLayer.image.voxelCount);

    this.inferenceSession = await ort.InferenceSession.create(
      "/assets/sam_quantized.onnx",
    );

    const input = new Uint8Array(imageData.length);
    for (let i = 0; i < imageData.length; i++) {
      input[i] = imageData[i] * 255;
    }

    const file = new File([input], "image");
    const formdata = new FormData();
    formdata.append("image", file);
    formdata.append("width", voxels.x.toString());
    formdata.append("height", voxels.y.toString());
    const response = await fetch(EMBEDDING_SERVICE_URL, {
      method: "POST",
      body: formdata,
    });

    const responseData = await response.arrayBuffer();
    const data = new Float32Array(responseData);

    const embeddingTensor = new ort.Tensor("float32", data, [1, 256, 64, 64]);
    this.embedding = embeddingTensor;

    this.setModelScale(voxels.x, voxels.y);
  }

  protected setModelScale(width: number, height: number) {
    // SAM internally resized images to longest side 1024, so we need to
    // calculate the scale factor in order to resize the mask output:
    const LONG_SIDE_LENGTH = 1024;
    const samScale = LONG_SIDE_LENGTH / Math.max(...[width, height]);
    this.inputScale = { width, height, samScale };
  }

  public async getMask(
    boundingBox?: SAMModelBoundingBox,
    foregroundPoints?: Vector[],
    backgroundPoints?: Vector[],
  ): Promise<Float32Array | undefined> {
    if (!this.inferenceSession) throw new Error("Model not loaded");

    console.time("prediction generation");

    const modelInput = this.getModelInput(
      boundingBox,
      foregroundPoints,
      backgroundPoints,
    );
    if (!modelInput) return;

    const modelOutput = await this.inferenceSession.run(modelInput);
    const maskOutput = modelOutput.masks.data as Float32Array;

    console.timeEnd("prediction generation");

    return maskOutput;
  }

  protected getModelInput(
    boundingBox?: SAMModelBoundingBox,
    foregroundPoints?: Vector[],
    backgroundPoints?: Vector[],
  ) {
    if (!this.embedding || !this.inputScale) return undefined;
    if (!boundingBox && !foregroundPoints?.length && !backgroundPoints?.length)
      return;

    const fPoints = foregroundPoints || [];
    const bPoints = backgroundPoints || [];

    const { samScale } = this.inputScale;

    // We need space for all prompt points and one padding point if no
    // bounding box is present, otherwise two corner points for the bbox:
    let n = fPoints.length + bPoints.length;
    if (!boundingBox) n += 1;
    else n += 2;

    const coords = new Float32Array(n * 2);
    const labels = new Float32Array(n);

    let bboxLabelOffset = 0;
    let foregroundLabelOffset = 0;
    let backgroundLabelOffset = 0;

    if (boundingBox) {
      const topLeft = this.get2DVector(boundingBox.start);
      const bottomRight = this.get2DVector(boundingBox.end);

      coords[0] = topLeft.x * samScale;
      coords[1] = topLeft.y * samScale;
      coords[2] = bottomRight.x * samScale;
      coords[3] = bottomRight.y * samScale;
      labels[0] = 2;
      labels[1] = 3;

      bboxLabelOffset = 2;
    }

    for (let i = 0; i < fPoints.length; i++) {
      const point = this.get2DVector(fPoints[i]);
      coords[i * 2 + bboxLabelOffset * 2] = point.x * samScale;
      coords[i * 2 + bboxLabelOffset * 2 + 1] = point.y * samScale;
      labels[i + bboxLabelOffset] = 1;
    }

    foregroundLabelOffset = bboxLabelOffset + fPoints.length;

    for (let i = 0; i < bPoints.length; i++) {
      const point = this.get2DVector(bPoints[i]);
      coords[i * 2 + foregroundLabelOffset * 2] = point.x * samScale;
      coords[i * 2 + foregroundLabelOffset * 2 + 1] = point.y * samScale;
      labels[i + foregroundLabelOffset] = 0;
    }

    backgroundLabelOffset = foregroundLabelOffset + bPoints.length;

    // If no bounding box is present, add the required padding point:
    if (!boundingBox) {
      coords[backgroundLabelOffset * 2] = 0;
      coords[backgroundLabelOffset * 2 + 1] = 0;
      labels[backgroundLabelOffset] = -1;
    }

    const coordsTensor = new ort.Tensor("float32", coords, [1, n, 2]);
    const labelsTensor = new ort.Tensor("float32", labels, [1, n]);

    const imageSizeTensor = new ort.Tensor("float32", [
      this.inputScale.height,
      this.inputScale.width,
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

  private get2DVector(point: Vector) {
    if (this.viewType === undefined) throw Error("View type not set");
    const [widthAxis, heightAxis] = getPlaneAxes(this.viewType);
    return Vector.fromArray([point[widthAxis], point[heightAxis]]);
  }
}
