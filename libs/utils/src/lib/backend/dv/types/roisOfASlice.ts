import { DVRois } from "./rois";

export class DVRoisOfASlice {
  public z: number;
  public layerID: string;
  public rois: number[][];

  static createFromDvRois(rois: DVRois) {
    return new DVRoisOfASlice(rois.layer, rois.z, []);
  }

  constructor(layerID: string, z: number, rois: number[][]) {
    this.layerID = layerID;
    this.z = z;
    this.rois = rois;
  }
}
