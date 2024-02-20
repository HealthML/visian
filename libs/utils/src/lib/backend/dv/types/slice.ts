import { DVRoi } from "./roi";

/**
 * Represents a slice of an annotation layer which contains multiple rois.
 * This is an intermediate object that is used to group rois by annotation layer and z-coordinate.
 */
export class DVSlice {
  public static createFromDVRoi(roi: DVRoi) {
    return new DVSlice(roi.layerID, roi.z, [roi.points]);
  }

  /**
   * Creates a new slice object.
   * @param layerID - The ID of the layer.
   * @param z - The z-coordinate of the slice.
   * @param contours - An array that contains multiple point arrays (outlines) of the rois.
   */
  constructor(
    public layerID: string,
    public z: number,
    private contours: number[][],
  ) {
    this.layerID = layerID;
    this.z = z;
    this.contours = contours;
  }

  public addRoi(roi: DVRoi) {
    this.contours.push(roi.points);
  }

  public addPointsToContour(points: number[]) {
    this.contours.push(points);
  }

  public getContours(): number[][] {
    return this.contours;
  }
}
