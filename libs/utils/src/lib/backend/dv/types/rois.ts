export interface DVRoisSnapshot {
  z: number;
  user: number;
  scan: number;
  group: number;
  points: number[];
}

export class DVRois {
  public z: number;
  public user: number;
  public scan: number;
  public group: number;
  public points: number[];

  constructor(rois: any) {
    this.z = rois.z;
    this.user = rois.user;
    this.scan = rois.scan;
    this.group = rois.group;
    this.points = rois.points;
  }

  public toJSON(): DVRoisSnapshot {
    return {
      z: this.z,
      user: this.user,
      scan: this.scan,
      group: this.group,
      points: this.points,
    };
  }
}
