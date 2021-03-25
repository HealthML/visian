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
