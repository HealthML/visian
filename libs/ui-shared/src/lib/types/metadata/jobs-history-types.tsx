export interface MiaJob {
  id: string;
  modelName: string;
  modelVersion: string;
  startedAt: string | undefined;
  finishedAt: string | undefined;
  status: MiaJobStatus;
  project: string;
  logFileUri?: string;
}

export enum MiaJobStatus {
  queued = "queued",
  running = "running",
  succeeded = "succeeded",
  canceled = "canceled",
  failed = "failed",
}
