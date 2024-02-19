export interface DVScanSnapshot {
  scanId: number;
  data: string;
}

/**
 * Represents a DVScan object (image).
 */
export class DVScan {
  public scanID: number;
  /** Usually a base64 encoded string of the 2D or 3D image data. */
  public data: string;

  constructor(scanJson: any) {
    this.scanID = scanJson.scanID;
    this.data = scanJson.data;
  }

  public toJSON(): DVScanSnapshot {
    return {
      scanId: this.scanID,
      data: this.data,
    };
  }
}
