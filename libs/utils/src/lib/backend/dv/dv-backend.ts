import * as jsonData from "./importExample/schema.json";
import { DVAnnotationTask } from "./types";

export const dvBackendBaseUrl = "https://annotation.ai4h.net/api/v1";

export const getDVTask = async (taskId: string): Promise<DVAnnotationTask> => {
  // TODO: implement getDVTask
  const task = DVAnnotationTask.createFromImport(jsonData);
  return task;
};

export const putDVTask = async (taskId: string, task: DVAnnotationTask) => {
  // TODO: implement putDVTask
  console.log("Export Task to console");
  console.log(task);
};
