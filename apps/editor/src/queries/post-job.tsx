import { MiaMlModel } from "@visian/ui-shared";
import axios from "axios";

import { hubBaseUrl } from "./hub-base-url";

export const postJob = async (
  imageSelection: string[],
  selectedModel: MiaMlModel,
  projectId: string,
) => {
  await axios.post(`${hubBaseUrl}jobs`, {
    images: imageSelection,
    modelName: selectedModel.name,
    modelVersion: selectedModel.version,
    project: projectId,
  });
};
