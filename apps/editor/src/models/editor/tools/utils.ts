import { RenderedImage } from "@visian/rendering";
import type { DragPoint, IDocument, IImageLayer } from "@visian/ui-shared";

import { ImageCommand } from "../history";

export const dragPointsEqual = (dp1: DragPoint, dp2: DragPoint) =>
  dp1.x === dp2.x &&
  dp1.y === dp2.y &&
  dp1.z === dp2.z &&
  dp1.right === dp2.right &&
  dp1.bottom === dp2.bottom;

/**
 * Mutates the texture data of the given image layer by applying a mutator function
 * to it. Additionally, adds the correct image command to the document's
 * history and recomputes the layer's markers.
 */
export const mutateTextureData = (
  imageLayer: IImageLayer,
  mutator: (imageLayer: IImageLayer) => void,
  document: IDocument,
) => {
  if (!imageLayer || imageLayer.kind !== "image") return;
  const { image } = imageLayer;
  const oldData = new Uint8Array((image as RenderedImage).getTextureData());

  mutator(imageLayer);

  const newData = new Uint8Array((image as RenderedImage).getTextureData());
  document.history.addCommand(
    new ImageCommand(
      {
        layerId: imageLayer.id,
        oldData,
        newData,
      },
      document,
    ),
  );

  (imageLayer as IImageLayer).recomputeSliceMarkers(
    undefined,
    undefined,
    false,
  );
};
