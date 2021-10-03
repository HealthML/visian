import type { DragPoint, IDocument, IImageLayer } from "@visian/ui-shared";

import { AtlasCommand } from "../history";

export const dragPointsEqual = (dp1: DragPoint, dp2: DragPoint) =>
  dp1.x === dp2.x &&
  dp1.y === dp2.y &&
  dp1.z === dp2.z &&
  dp1.right === dp2.right &&
  dp1.bottom === dp2.bottom;

/**
 * Mutates the atlas of the given image layer by applying a mutator function
 * to it. Additionally, adds the correct atlas command to the document's
 * history and recomputes the layer's markers.
 */
export const mutateAtlas = (
  imageLayer: IImageLayer,
  mutator: (imageLayer: IImageLayer) => void,
  document: IDocument,
) => {
  if (!imageLayer || imageLayer.kind !== "image") return;
  const { image } = imageLayer;
  const oldAtlas = new Uint8Array(image.getAtlas());

  mutator(imageLayer);

  const newAtlas = new Uint8Array(image.getAtlas());
  document.history.addCommand(
    new AtlasCommand(
      {
        layerId: imageLayer.id,
        oldAtlas,
        newAtlas,
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
