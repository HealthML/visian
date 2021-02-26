import { ViewType } from "../types";

/**
 * Returns a normalized position in the WebGL screen coordinate system.
 *
 * x and y are normalized in [-1.0, 1.0].
 *
 * @param position Click coordinates in the bounding box.
 * @param boxDimensions Size of the bounding box.
 */
export const convertPositionToWebGLPosition = (
  position: { x: number; y: number },
  boxDimensions: { width: number; height: number },
) => {
  return {
    x: (2 * position.x) / boxDimensions.width - 1,
    y: (-2 * position.y) / boxDimensions.height + 1,
  };
};

// eslint-disable-next-line consistent-return
export const getPlaneAxes = (viewType: ViewType) => {
  switch (viewType) {
    case ViewType.Transverse:
      return ["x", "y"] as ["x", "y"];
    case ViewType.Sagittal:
      return ["y", "z"] as ["y", "z"];
    case ViewType.Coronal:
      return ["x", "z"] as ["x", "z"];
  }
};
