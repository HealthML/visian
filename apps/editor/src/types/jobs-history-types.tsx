export interface Job {
  id: string;
  modelName: string;
  modelVersion: string;
  startedAt: string | undefined;
  finishedAt: string | undefined;
  status: JobStatus;
}

export enum JobStatus {
  queued = "queued",
  running = "running",
  succeeded = "succeeded",
  canceled = "canceled",
  failed = "failed",
}
