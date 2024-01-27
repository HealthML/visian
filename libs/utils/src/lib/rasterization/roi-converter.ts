import cv from "@techstark/opencv-js";

/**
 * Finds all contours in an annotation slice and fills them.
 * @param annotationSlice Slice of one annotation layer (2D).
 * @param width Width of the slice.
 * @param height Height of the slice.
 * @returns The slice with filled contours.
 */
export function fillContours(
  annotationSlice: Uint8Array,
  width: number,
  height: number,
): Uint8Array {
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  const slice = cv.matFromArray(width, height, cv.CV_8UC1, annotationSlice);
  const filledSlice = cv.Mat.zeros(slice.rows, slice.cols, cv.CV_8UC1);

  // Find only the outer contours in the binary image
  cv.findContours(
    slice,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_NONE,
  );

  // Fill the outer contours completely
  cv.drawContours(filledSlice, contours, -1, new cv.Scalar(255), cv.FILLED);

  // Find all contours with hierarchy (incl. inner contours)
  cv.findContours(
    slice,
    contours,
    hierarchy,
    cv.RETR_TREE,
    cv.CHAIN_APPROX_SIMPLE,
  );

  for (let i = 0; i < contours.size(); ++i) {
    // Hierarchy format: [c1_next, c1_previous, c1_firstChild, c1_parent, c2_next, ...]
    const parentIdx = hierarchy.data32S[i * hierarchy.channels() + 3];

    const hasChild = hierarchy.data32S[i * hierarchy.channels() + 2] < 0;
    const hasParent = parentIdx >= 0;
    let hasGrandparent = false;

    if (hasParent) {
      hasGrandparent =
        hierarchy.data32S[parentIdx * hierarchy.channels() + 3] >= 0;
    }

    if (hasChild && hasGrandparent) {
      // fill the contour with black color, but this erases the border
      cv.drawContours(filledSlice, contours, i, new cv.Scalar(0), -1);
      // draw the border again
      cv.drawContours(filledSlice, contours, i, new cv.Scalar(255), 1);
    }
  }

  // Release allocated memory
  slice.delete();
  contours.delete();
  hierarchy.delete();

  return filledSlice.data;
}
