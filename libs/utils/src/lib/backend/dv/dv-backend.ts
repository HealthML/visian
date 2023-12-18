import { DVAnnotationTask } from "./types";
import axios, { Axios, AxiosRequestConfig } from "axios";

export const dvBackendBaseUrl = "https://annotation.ai4h.net/api/v1";

export const getDVTask = async (taskId: string): Promise<DVAnnotationTask> => {
  //TODO: implemnt getDVTask
  const data = null;
  const task = new DVAnnotationTask(data);
  return task;
};

export const putDVTask = async (taskId: string, task: string) => {
  //TODO: implement putDVTask
  return axios.put(`${dvBackendBaseUrl}/tasks/${taskId}/next`, task);
};
