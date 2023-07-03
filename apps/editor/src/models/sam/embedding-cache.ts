import { IImageLayer } from "@visian/ui-shared";
import { Vector, ViewType } from "@visian/utils";
import * as ort from "onnxruntime-web";

export type SAMModelBoundingBox = { topLeft: Vector; bottomRight: Vector };

export class EmbeddingCache {
  protected embeddings: Map<string, ort.Tensor> = new Map();

  public getEmbeddingKey(
    layer: IImageLayer,
    viewType: ViewType,
    slice: number,
  ) {
    return `${layer.id}-${viewType}-${slice}`;
  }

  public storeEmbedding(
    layer: IImageLayer,
    viewType: ViewType,
    slice: number,
    embedding: ort.Tensor,
  ) {
    const key = this.getEmbeddingKey(layer, viewType, slice);
    this.embeddings.set(key, embedding);
  }

  public getEmbedding(
    layer: IImageLayer,
    viewType: ViewType,
    slice: number,
  ): ort.Tensor | undefined {
    const key = this.getEmbeddingKey(layer, viewType, slice);
    return this.embeddings.get(key);
  }
}
