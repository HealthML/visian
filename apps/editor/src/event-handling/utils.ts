import { getPositionWithinPixel } from "@visian/rendering";
import { DragPoint, ISliceRenderer, IViewSettings } from "@visian/ui-shared";
import {
  getOrthogonalAxis,
  getPlaneAxes,
  Image,
  Pixel,
  ViewType,
} from "@visian/utils";
import { Tools } from "../models";

/**
 * Aligns the brush cursor of the given view type to the given screen position.
 * Also sets tools.isCursorOverDrawableArea.
 * @param tools The tools.
 * @param screenPosition The screen position.
 * @param viewType The view type.
 * @param sliceRenderer The slice renderer rendering the brush cursor.
 * @returns The virtual uv coordinates of the brush cursor on the corresponding slice
 * or null if the slice renderer is undefined.
 */
export const alignBrushCursor = (
  tools: Tools,
  screenPosition: Pixel,
  viewType: ViewType,
  sliceRenderer?: ISliceRenderer,
) => {
  if (!sliceRenderer) {
    tools.setIsCursorOverDrawableArea(false);
    return null;
  }

  const uv = sliceRenderer.getVirtualUVs(screenPosition, viewType);

  if (uv.x > 1 || uv.x < 0 || uv.y > 1 || uv.y < 0) {
    tools.setIsCursorOverDrawableArea(false);
  } else {
    tools.setIsCursorOverDrawableArea();
    sliceRenderer.alignBrushCursor(uv);
  }

  return uv;
};

export const getDragPoint = (
  image: Image,
  viewSettings: IViewSettings,
  viewType: ViewType,
  uv: Pixel,
  floored = true,
) => {
  const dragPoint: DragPoint = {
    x: 0,
    y: 0,
    z: 0,
    right: true,
    bottom: false,
  };

  const [widthAxis, heightAxis] = getPlaneAxes(viewType);
  const orthogonalAxis = getOrthogonalAxis(viewType);

  dragPoint[orthogonalAxis] = viewSettings.selectedVoxel[orthogonalAxis];
  dragPoint[widthAxis] = uv.x * image.voxelCount[widthAxis];
  dragPoint[heightAxis] = uv.y * image.voxelCount[heightAxis];

  if (floored) {
    dragPoint[widthAxis] = Math.floor(dragPoint[widthAxis]);
    dragPoint[heightAxis] = Math.floor(dragPoint[heightAxis]);
  }

  const scanWidth = image.voxelCount[widthAxis];
  const scanHeight = image.voxelCount[heightAxis];

  [dragPoint.right, dragPoint.bottom] = getPositionWithinPixel(
    uv,
    scanWidth,
    scanHeight,
  );

  return dragPoint;
};
