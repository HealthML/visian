export interface SampleSnapshot {
  sampleUUID: string;
  title: string;
  data: string;
}

export interface ISample {
  sampleUUID: string;
  title: string;
  data: string;

  toJSON(): SampleSnapshot;
}
