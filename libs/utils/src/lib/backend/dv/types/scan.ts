export interface DVScanSnapshot {
  scanId: number;
  data: string;
}

export class DVScan {
  public scanID: number;
  public data: string;

  constructor(scan: any) {
    this.scanID = scan.scanID;
    this.data = scan.data;
  }

  public toJSON(): DVScanSnapshot {
    return {
      scanId: this.scanID,
      data: this.data,
    };
  }
}
