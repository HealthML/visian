import { DVSlice } from "./slice";

export interface DVRoiSnapshot {
  z: number;
  user: string;

  scanID: number;
  group: string;
  points: number[];
}

/**
 * Represents a 2D Region of Interest (ROI). It is associated with an annotation layer, a scan and a user.
 */
export class DVRoi {
  public static createFromImport(roiJson: any): DVRoi {
    return new DVRoi(
      roiJson.group,
      roiJson.z,
      roiJson.scanID,
      roiJson.user,
      roiJson.points,
    );
  }

  /**
   * Represents a 2D Region of Interest (ROI).
   * @param z - The z-coordinate of the ROI.
   * @param userID - The ID of the user associated with the ROI.
   * @param scanID - The ID of the scan associated with the ROI.
   * @param layerID - The ID of the layer associated with the ROI.
   * @param points - The array of points that define the ROI [x1, y1, x2, y2, ...].
   */
  constructor(
    public layerID: string,
    public z: number,
    public scanID: number,
    public userID: string,
    public points: number[],
  ) {
    this.z = z;
    this.userID = userID;
    this.scanID = scanID;
    this.layerID = layerID;
    this.points = points;
  }

  /**
   * Finds a matching slice in the given array of DVSlice objects.
   * A matching slice has the same layerID and z values as the current ROI object.
   * @param slices - The array of DVSlice objects to search in.
   * @returns The first matching DVSlice object found, or undefined if no match is found.
   */
  public findMatchingSlice(slices: DVSlice[]) {
    return slices.find(
      (slice) => slice.layerID === this.layerID && slice.z === this.z,
    );
  }

  public toJSON(): DVRoiSnapshot {
    return {
      z: this.z,
      user: this.userID,
      scanID: this.scanID,
      group: this.layerID,
      points: this.points,
    };
  }
}
