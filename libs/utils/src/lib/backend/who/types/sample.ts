export interface WHOSampleSnapshot {
  sampleUUID: string;
  title: string;
  data: string;
}

export class WHOSample {
  public sampleUUID: string;
  public title: string;
  public data: string;

  // TODO: Properly type API response data
  constructor(sample: any) {
    this.sampleUUID = sample.sampleUUID;
    this.title = sample.title;
    this.data = sample.data;
  }

  public toJSON(): WHOSampleSnapshot {
    return {
      sampleUUID: this.sampleUUID,
      title: this.title,
      data: this.data,
    };
  }
}
