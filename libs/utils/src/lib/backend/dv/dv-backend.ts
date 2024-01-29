import * as jsonData from "./importExamples/schema.json";
import { DVAnnotationTask } from "./types";
import axios from "axios";

export const dvBackendBaseUrl = "https://annotation.ai4h.net/api/v1";

export const getDVTask = async (taskId: string): Promise<DVAnnotationTask> => {
  //TODO: implement getDVTask
  const task = new DVAnnotationTask(jsonData);
  return task;
};

export const putDVTask = async (taskId: string, task: string) => {
  //TODO: implement putDVTask
  return axios.put(`${dvBackendBaseUrl}/tasks/${taskId}/next`, task);
};
