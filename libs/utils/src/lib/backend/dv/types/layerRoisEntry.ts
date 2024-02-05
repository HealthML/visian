import { DVRois } from "./rois";

export class DVLayerRoisEntry {
  public z: number;
  public layerID: string;
  public rois: number[][];

  constructor(rois: DVRois) {
    this.z = rois.z;
    this.layerID = rois.layer;
    this.rois = [];
  }
}
