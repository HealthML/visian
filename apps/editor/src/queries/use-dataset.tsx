import { Dataset } from "@visian/ui-shared";
import axios, { AxiosError } from "axios";
import { useQuery } from "react-query";

import { hubBaseUrl } from "./hub-base-url";

const getDataset = async (datasetId: string) => {
  const datasetResponse = await axios.get<Dataset>(
    `${hubBaseUrl}datasets/${datasetId}`,
  );
  return datasetResponse.data;
};

export const useDataset = (datasetId: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    Dataset,
    AxiosError<Dataset>
  >(["dataset", datasetId], () => getDataset(datasetId), {
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
