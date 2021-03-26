import { ViewType } from "../types";

/**
 * Returns the name of the coordinate orthogonal to the given view type.
 *
 * @param viewType The view's type.
 */
export const getOrthogonalAxis = (viewType: ViewType) => {
  switch (viewType) {
    case ViewType.Transverse:
      return "z";
    case ViewType.Sagittal:
      return "x";
    case ViewType.Coronal:
      return "y";
  }
};

/**
 * Returns the name of the coordinates in the plane of the given view type.
 *
 * @param viewType The view's type.
 */
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
