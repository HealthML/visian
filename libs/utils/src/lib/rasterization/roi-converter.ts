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
  const slice = cv.matFromArray(height, width, cv.CV_8UC1, annotationSlice);
  const filledSlice = cv.Mat.zeros(slice.rows, slice.cols, cv.CV_8UC1);

  // Find only the outer contours
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

/**
 * Finds all contours in an annotation slice and returns them as an array of ROI points.
 * @param annotationSlice Slice of one annotation layer (2D).
 * @param width Width of the slice.
 * @param height Height of the slice.
 * @returns An array of ROIs, where each ROI is an array of points [x1, y1, x2, y2,...].
 */
export function findContours(
  annotationSlice: Uint8Array,
  width: number,
  height: number,
): Int32Array[] {
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  const slice = cv.matFromArray(height, width, cv.CV_8UC1, annotationSlice);

  // Find all contours with hierarchy (incl. inner contours)
  cv.findContours(
    slice,
    contours,
    hierarchy,
    cv.RETR_TREE,
    cv.CHAIN_APPROX_SIMPLE,
  );

  const rois = [];
  for (let i = 0; i < contours.size(); ++i) {
    rois.push(contours.get(i).data32S);
  }

  slice.delete();
  contours.delete();
  hierarchy.delete();

  return rois;
}

/**
 * Given an array of ROIs, draws the outline of each ROI on an empty annotationslice.
 * @param rois Array of ROIs, where each ROI is an array of points [x1, y1, x2, y2,...].
 * @param width Width of the slice.
 * @param height Height of the slice.
 * @returns The annotation slice with the drawn contours.
 */
export function drawContours(
  rois: Int32Array[],
  width: number,
  height: number,
): Uint8Array {
  const slice = cv.Mat.zeros(height, width, cv.CV_8UC1);
  const contours = new cv.MatVector();

  for (let i = 0; i < rois.length; i++) {
    const coordinates = rois[i];
    // 32-bit signed integer, 2-channel (x,y) matrix
    // thereofore, the number of rows is half the number of coordinates
    const contourMat = cv.matFromArray(
      coordinates.length / 2,
      1,
      cv.CV_32SC2,
      coordinates,
    );
    contours.push_back(contourMat);
  }

  // Draw all contours with thickness of 1, but do not fill the area inside
  cv.drawContours(slice, contours, -1, new cv.Scalar(255));
  contours.delete();

  return slice.data;
}
