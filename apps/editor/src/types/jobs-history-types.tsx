export interface Job {
  id: string;
  modelName: string;
  modelVersion: string;
  startedAt: string | undefined;
  finishedAt: string | undefined;
  status: JobStatus;
  project: string;
  logFileUri?: string;
}

export enum JobStatus {
  queued = "queued",
  running = "running",
  succeeded = "succeeded",
  canceled = "canceled",
  failed = "failed",
}
