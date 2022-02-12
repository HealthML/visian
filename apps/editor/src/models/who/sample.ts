import { ISample, SampleSnapshot } from "@visian/ui-shared";

export class Sample implements ISample {
  public sampleUUID: string;
  public title: string;
  public data: string;

  // TODO: Properly type API response data
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
