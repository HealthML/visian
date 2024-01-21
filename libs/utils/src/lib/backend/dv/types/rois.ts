export interface DVRoisSnapshot {
  z: number;
  user: string;
  scanID: string;
  group: string;
  points: number[];
}

export class DVRois {
  public z: number;
  public user: string;
  public scanID: string;
  public layer: string;
  public points: number[];

  constructor(rois: any) {
    this.z = rois.z;
    this.user = rois.user;
    this.scanID = rois.scan;
    this.layer = rois.group;
    this.points = rois.points;
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
