import { getPlaneAxes, ViewType } from "@visian/utils";
import * as THREE from "three";

import { Editor } from "../../../models";
import { Slice } from "../slice";

/**
 * Sets the crosshair synch offset of the new main view slice
 * to synch the crosshair position.
 */
export const synchCrosshairs = (
  newMainView: ViewType,
  oldMainView: ViewType,
  newMainSlice: Slice,
  oldMainSlice: Slice,
  editor: Editor,
) => {
  const newCrosshairOffset = getCrosshairOffset(newMainView, editor);

  const relativeSize = oldMainSlice.baseSize
    .clone()
    .divide(newMainSlice.baseSize);

  newCrosshairOffset.add(
    oldMainSlice.crosshairSynchOffset.multiply(relativeSize),
  );
  newCrosshairOffset.sub(
    getCrosshairOffset(oldMainView, editor).multiply(relativeSize),
  );

  newMainSlice.setCrosshairSynchOffset(newCrosshairOffset);

  oldMainSlice.setCrosshairSynchOffset();
};

export const getCrosshairOffset = (viewType: ViewType, editor: Editor) => {
  const [widthAxis, heightAxis] = getPlaneAxes(viewType);
  const crosshairOffset = new THREE.Vector2();
  if (!editor.image) return crosshairOffset;

  crosshairOffset.set(
    0.5 -
      (editor.viewSettings.selectedVoxel[widthAxis] + 0.5) /
        editor.image.voxelCount[widthAxis],
    -0.5 +
      (editor.viewSettings.selectedVoxel[heightAxis] + 0.5) /
        editor.image.voxelCount[heightAxis],
  );

  return crosshairOffset;
};
