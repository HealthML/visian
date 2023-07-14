import { IImageLayer } from "@visian/ui-shared";
import { getPlaneAxes, Vector, ViewType } from "@visian/utils";
import { makeObservable, observable } from "mobx";
import * as ort from "onnxruntime-web";

import { EmbeddingCache } from "./embedding-cache";
import { getUrlParam } from "./temp-util";

export type SAMModelBoundingBox = { start: Vector; end: Vector };

// Todo: Make configurable, extract param from router
const EMBEDDING_SERVICE_URL = getUrlParam(
  "image-encoder-url",
  "http://localhost:3000/embedding",
);
console.log("Image Encoder URL:", EMBEDDING_SERVICE_URL);

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

export class SAM {
  private embeddingCache: EmbeddingCache;
  private inferenceSession?: ort.InferenceSession;
  private loadingEmbeddings: Map<string, boolean> = new Map();

  constructor() {
    this.embeddingCache = new EmbeddingCache();

    makeObservable<SAM, "loadingEmbeddings">(this, {
      loadingEmbeddings: observable,
      isLoadingEmbedding: observable,
      hasEmbedding: observable,
    });
  }

  public isLoadingEmbedding(
    imageLayer: IImageLayer,
    viewType: ViewType,
    sliceNumber: number,
  ) {
    return !!this.loadingEmbeddings.get(
      this.embeddingCache.getEmbeddingKey(imageLayer, viewType, sliceNumber),
    );
  }

  protected setLoading(
    imageLayer: IImageLayer,
    viewType: ViewType,
    sliceNumber: number,
    isLoading: boolean,
  ) {
    this.loadingEmbeddings.set(
      this.embeddingCache.getEmbeddingKey(imageLayer, viewType, sliceNumber),
      isLoading,
    );
  }

  public hasEmbedding(
    imageLayer: IImageLayer,
    viewType: ViewType,
    sliceNumber: number,
  ) {
    return !!this.embeddingCache.getEmbedding(
      imageLayer,
      viewType,
      sliceNumber,
    );
  }

  public async generateEmbedding(
    imageLayer: IImageLayer,
    viewType: ViewType,
    sliceNumber: number,
  ) {
    if (this.hasEmbedding(imageLayer, viewType, sliceNumber)) return;
    this.setLoading(imageLayer, viewType, sliceNumber, true);

    const imageData = imageLayer.image.getSliceFloat32(viewType, sliceNumber);
    const voxels = this.get2DVector(viewType, imageLayer.image.voxelCount);

    const imageBytes = new Uint8Array(imageData.length);
    for (let i = 0; i < imageData.length; i++) {
      imageBytes[i] = imageData[i] * 255;
    }

    // We cannot use multipart-formdata and a "normal" file upload here since
    // otherwise requests will get stuck in "pending". Also it is necessary to
    // prevent request caching by timestamping the url for the same reason.
    // The number of requests that get stuck is not deterministic, but increases
    // with the number of bytes sent.
    // Encoding the file as base64 increases its size by ~33% but prevents these issues.
    const encodedFile = bytesToBase64(imageBytes);
    const timestamp = new Date().getTime();
    const response = await fetch(`${EMBEDDING_SERVICE_URL}?v=${timestamp}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/octet-stream",
      },
      body: JSON.stringify({
        image: encodedFile,
        width: voxels.x,
        height: voxels.y,
      }),
    });

    const responseData = await response.arrayBuffer();
    const data = new Float32Array(responseData);

    const embedding = new ort.Tensor("float32", data, [1, 256, 64, 64]);
    this.embeddingCache.storeEmbedding(
      imageLayer,
      viewType,
      sliceNumber,
      embedding,
    );

    this.setLoading(imageLayer, viewType, sliceNumber, false);
  }

  protected getModelScale(width: number, height: number) {
    // SAM internally resized images to longest side 1024, so we need to
    // calculate the scale factor in order to resize the mask output:
    const LONG_SIDE_LENGTH = 1024;
    return LONG_SIDE_LENGTH / Math.max(...[width, height]);
  }

  protected async getInferenceSession() {
    if (!this.inferenceSession) {
      this.inferenceSession = await ort.InferenceSession.create(
        "/assets/sam_quantized.onnx",
      );
    }
    return this.inferenceSession;
  }

  public async getMask(
    imageLayer: IImageLayer,
    viewType: ViewType,
    sliceNumber: number,
    boundingBox?: SAMModelBoundingBox,
    foregroundPoints?: Vector[],
    backgroundPoints?: Vector[],
  ): Promise<Float32Array | undefined> {
    const embedding = this.embeddingCache.getEmbedding(
      imageLayer,
      viewType,
      sliceNumber,
    );
    if (!embedding) return;

    const modelInput = this.getModelInput(
      imageLayer,
      viewType,
      embedding,
      boundingBox,
      foregroundPoints,
      backgroundPoints,
    );
    if (!modelInput) return;

    const session = await this.getInferenceSession();
    const modelOutput = await session.run(modelInput);
    const maskOutput = modelOutput.masks.data as Float32Array;

    return maskOutput;
  }

  protected getModelInput(
    imageLayer: IImageLayer,
    viewType: ViewType,
    embedding: ort.Tensor,
    boundingBox?: SAMModelBoundingBox,
    foregroundPoints?: Vector[],
    backgroundPoints?: Vector[],
  ) {
    if (!boundingBox && !foregroundPoints?.length && !backgroundPoints?.length)
      return;

    const fPoints = foregroundPoints || [];
    const bPoints = backgroundPoints || [];

    const voxels = this.get2DVector(viewType, imageLayer.image.voxelCount);
    const samScale = this.getModelScale(voxels.x, voxels.y);

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
      const topLeft = this.get2DVector(viewType, boundingBox.start);
      const bottomRight = this.get2DVector(viewType, boundingBox.end);

      coords[0] = topLeft.x * samScale;
      coords[1] = topLeft.y * samScale;
      coords[2] = bottomRight.x * samScale;
      coords[3] = bottomRight.y * samScale;
      labels[0] = 2;
      labels[1] = 3;

      bboxLabelOffset = 2;
    }

    for (let i = 0; i < fPoints.length; i++) {
      const point = this.get2DVector(viewType, fPoints[i]);
      coords[i * 2 + bboxLabelOffset * 2] = point.x * samScale;
      coords[i * 2 + bboxLabelOffset * 2 + 1] = point.y * samScale;
      labels[i + bboxLabelOffset] = 1;
    }

    foregroundLabelOffset = bboxLabelOffset + fPoints.length;

    for (let i = 0; i < bPoints.length; i++) {
      const point = this.get2DVector(viewType, bPoints[i]);
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

    const imageSizeTensor = new ort.Tensor("float32", [voxels.y, voxels.x]);

    // Use empty tensor since we don't specify an input mask:
    const maskInput = new ort.Tensor(
      "float32",
      new Float32Array(256 * 256),
      [1, 1, 256, 256],
    );

    // Default to 0 since there is no input mask:
    const hasMaskInput = new ort.Tensor("float32", [0]);

    return {
      image_embeddings: embedding,
      point_coords: coordsTensor,
      point_labels: labelsTensor,
      orig_im_size: imageSizeTensor,
      mask_input: maskInput,
      has_mask_input: hasMaskInput,
    };
  }

  private get2DVector(viewType: ViewType, point: Vector) {
    const [widthAxis, heightAxis] = getPlaneAxes(viewType);
    return Vector.fromArray([point[widthAxis], point[heightAxis]]);
  }
}
