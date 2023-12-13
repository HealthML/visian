export interface DVAnnotationDataSnapshot {
  scanId: number;
  data: string;
}

export class DVAnnotationData {
  public scanID: number;
  public data: string;

  // TODO: Properly type API response data
  constructor(scan: any) {
    this.scanID = scan.scanID;
    this.data = scan.data;
  }

  public toJSON(): DVAnnotationDataSnapshot {
    return {
      scanId: this.scanID,
      data: this.data,
    };
  }
}
