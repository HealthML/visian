import { DVRoi } from "./roi";

/**
 * Represents a slice of an annotation layer which contains multiple rois.
 * This is an intermediate object that is used to group rois by annotation layer and z-coordinate.
 */
export class DVSlice {
  public static createFromDVRoi(roi: DVRoi) {
    return new DVSlice(roi.layerID, roi.z, [roi]);
  }

  /**
   * Creates a new slice object.
   * @param layerID - The ID of the layer.
   * @param z - The z-coordinate of the slice.
   * @param rois - An array of DVRoi objects.
   */
  constructor(public layerID: string, public z: number, public rois: DVRoi[]) {
    this.layerID = layerID;
    this.z = z;
    this.rois = rois;
  }

  public addRoi(roi: DVRoi) {
    this.rois.push(roi);
  }
}
