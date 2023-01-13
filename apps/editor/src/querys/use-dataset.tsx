import { useQuery } from "react-query";

import { Dataset } from "../types";
import { baseUrl } from "./base-url";

const fetchDataset = async (datasetId: string) => {
  const datasetResponse = await fetch(`${baseUrl}datasets/${datasetId}`);
  if (!datasetResponse.ok)
    throw new Error(
      `${datasetResponse.statusText} (${datasetResponse.status})`,
    );
  const dataset = (await datasetResponse.json()) as Dataset;
  return dataset;
};

export const useDataset = (datasetId: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    Dataset,
    Error
  >(["dataset", datasetId], () => fetchDataset(datasetId), {
    retry: 2, // retry twice if fetch fails
    refetchInterval: 1000 * 60, // refetch every minute
  });

  return {
    dataset: data,
    datasetError: error,
    isErrorDataset: isError,
    isLoadingDataset: isLoading,
    refetchDataset: refetch,
    removeDataset: remove,
  };
};

export default useDataset;
