export interface Job {
  id: string;
  modelName: string;
  modelVersion: string;
  startedAt: string | undefined;
  finishedAt: string | undefined;
  status: string;
}
