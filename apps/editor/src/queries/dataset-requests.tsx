import axios from "axios";

import { Dataset } from "../types";
import { hubBaseUrl } from "./hub-base-url";

export const deleteDatasets = async (datasetIds: string[]) => {
  const deleteDatasetsResponse = await axios.delete<Dataset[]>(
    `${hubBaseUrl}datasets`,
    {
      data: { ids: datasetIds },
      timeout: 1000 * 5, // 5 seconds
    },
  );
  return deleteDatasetsResponse.data.map((d) => d.id);
};

export const getDatasetsByProject = async (projectId: string) => {
  const datasetsResponse = await axios.get<Dataset[]>(`${hubBaseUrl}datasets`, {
    params: {
      project: projectId,
    },
  });
  return datasetsResponse.data;
};

export const getDataset = async (datasetId: string) => {
  const datasetResponse = await axios.get<Dataset>(
    `${hubBaseUrl}datasets/${datasetId}`,
  );
  return datasetResponse.data;
};
