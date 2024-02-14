import { DVRois } from "./rois";

export class DVRoisOfASlice {
  public static createFromDvRois(rois: DVRois) {
    return new DVRoisOfASlice(rois.layer, rois.z, []);
  }

  public z: number;
  public layerID: string;
  public rois: number[][];

  constructor(layerID: string, z: number, rois: number[][]) {
    this.layerID = layerID;
    this.z = z;
    this.rois = rois;
  }
}
