export interface DVScanSnapshot {
  scanId: number;
  data: string;
}

export class DVScan {
  public scanID: number;
  public data: string;

  // TODO: Properly type API response data
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
