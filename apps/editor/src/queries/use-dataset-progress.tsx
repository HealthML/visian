import axios, { AxiosError } from "axios";
import { useQuery } from "react-query";

import { Progress } from "../types";
import { hubBaseUrl } from "./hub-base-url";

export const useDatasetProgress = (datasetId: string) => {
  const { data, error, isLoading } = useQuery<Progress, AxiosError<Progress>>(
    ["dataset-progress", datasetId],
    async () => {
      const response = await axios.get<Progress>(
        `${hubBaseUrl}datasets/${datasetId}/progress`,
      );
      return response.data;
    },
    {
      retry: 2, // retry twice if fetch fails
      refetchInterval: 1000 * 5, // refetch every 5 seconds
    },
  );

  return {
    progress: data,
    progressError: error,
    isLoadingProgress: isLoading,
  };
};
