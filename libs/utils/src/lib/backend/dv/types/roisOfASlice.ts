import { DVRois } from "./rois";

export class DVRoisOfASlice {
  public static createFromDvRois(rois: DVRois) {
    return new DVRoisOfASlice(rois.layer, rois.z, []);
  }

  constructor(
    public layerID: string,
    public z: number,
    public rois: number[][],
  ) {}
}
