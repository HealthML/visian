export interface SampleSnapshot {
  sampleUUID: string;
  title: string;
  data: string;
}

export class Sample {
  public sampleUUID: string;
  public title: string;
  public data: string;

  constructor(sample: any) {
    this.sampleUUID = sample.sampleUUID;
    this.title = sample.title;
    this.data = sample.data;
  }

  public toJSON(): SampleSnapshot {
    return {
      sampleUUID: this.sampleUUID,
      title: this.title,
      data: this.data,
    };
  }
}
