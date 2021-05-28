import { IDocument, IImageLayer } from "@visian/ui-shared";
import { getPlaneAxes, ViewType } from "@visian/utils";
import * as THREE from "three";

import { Slice } from "../slice";

export const getCrosshairOffset = (viewType: ViewType, document: IDocument) => {
  const [widthAxis, heightAxis] = getPlaneAxes(viewType);
  const crosshairOffset = new THREE.Vector2();

  const { image } = document.layers[1] as IImageLayer;
  if (!image) return crosshairOffset;

  crosshairOffset.set(
    0.5 -
      (document.viewSettings.selectedVoxel[widthAxis] + 0.5) /
        image.voxelCount[widthAxis],
    -0.5 +
      (document.viewSettings.selectedVoxel[heightAxis] + 0.5) /
        image.voxelCount[heightAxis],
  );

  return crosshairOffset;
};

/**
 * Sets the crosshair synch offset of the new main view slice
 * to synch the crosshair position.
 */
export const synchCrosshairs = (
  newMainView: ViewType,
  oldMainView: ViewType,
  newMainSlice: Slice,
  oldMainSlice: Slice,
  document: IDocument,
) => {
  const newCrosshairOffset = getCrosshairOffset(newMainView, document);

  const relativeSize = oldMainSlice.baseSize
    .clone()
    .divide(newMainSlice.baseSize);

  newCrosshairOffset.add(
    oldMainSlice.crosshairSynchOffset.multiply(relativeSize),
  );
  newCrosshairOffset.sub(
    getCrosshairOffset(oldMainView, document).multiply(relativeSize),
  );

  newMainSlice.setCrosshairSynchOffset(newCrosshairOffset);

  oldMainSlice.setCrosshairSynchOffset();
};
