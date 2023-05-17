import axios from "axios";

import { MlModel } from "../types";
import hubBaseUrl from "./hub-base-url";

export const postJob = async (
  imageSelection: string[],
  selectedModel: MlModel,
  projectId: string,
) => {
  await axios.post(`${hubBaseUrl}jobs`, {
    images: imageSelection,
    modelName: selectedModel.name,
    modelVersion: selectedModel.version,
    project: projectId,
  });
};

export const getJobLog = async (jobId: string) => {
  const response = await axios.get(`${hubBaseUrl}jobs/${jobId}/logFile`);
  return response.data;
};
