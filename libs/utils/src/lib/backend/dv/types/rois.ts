import { DVRoisOfASlice } from "./roisOfASlice";

export interface DVRoisSnapshot {
  z: number;
  user: string;
  scanID: number;
  group: string;
  points: number[];
}

export class DVRois {
  public static createFromImport(jsonObject: any): DVRois {
    return new DVRois(
      jsonObject.z,
      jsonObject.user,
      jsonObject.scanID,
      jsonObject.group,
      jsonObject.points,
    );
  }

  public z: number;
  public user: string;
  public scanID: number;
  public layer: string;
  public points: number[];

  constructor(
    z: number,
    user: string,
    scanID: number,
    layer: string,
    points: number[],
  ) {
    this.z = z;
    this.user = user;
    this.scanID = scanID;
    this.layer = layer;
    this.points = points;
  }

  public getLayerRoisEntry(list: DVRoisOfASlice[]) {
    let layerRois = list.find(
      (m) => m.layerID === this.layer && m.z === this.z,
    );
    if (!layerRois) {
      layerRois = DVRoisOfASlice.createFromDvRois(this);
      list.push(layerRois);
    }
    return layerRois;
  }

  public toJSON(): DVRoisSnapshot {
    return {
      z: this.z,
      user: this.user,
      scanID: this.scanID,
      group: this.layer,
      points: this.points,
    };
  }
}
