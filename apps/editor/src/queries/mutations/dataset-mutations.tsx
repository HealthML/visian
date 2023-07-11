import { AxiosError } from "axios";
import { Dataset } from "mia-api-client";
import { useQuery } from "react-query";

// import { deleteDatasets, getDataset, getDatasetsByProject } from "../requests";
import { datasetsApi } from "../hub-base-url";
import { DeleteMutation } from "./mutations";

export const deleteDatasetsMutation = () =>
  DeleteMutation<Dataset>({
    queryKey: (selectorId: string) => ["datasetsBy", selectorId],
    mutateFn: ({ objectIds }) =>
      datasetsApi
        .datasetsControllerRemoveAll({ ids: objectIds })
        .then((response) => response.data.map((d) => d.id)),
  });

export const useDataset = (datasetId: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    Dataset,
    AxiosError<Dataset>
  >(
    ["dataset", datasetId],
    () =>
      datasetsApi
        .datasetsControllerFindOne(datasetId)
        .then((response) => response.data),
    {
      retry: 2, // retry twice if fetch fails
      refetchInterval: 1000 * 60, // refetch every minute
    },
  );

  // TODO: Do we need this extra interface?
  return {
    dataset: data,
    datasetError: error,
    isErrorDataset: isError,
    isLoadingDataset: isLoading,
    refetchDataset: refetch,
    removeDataset: remove,
  };
};

export const useDatasetsByProject = (projectId: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    Dataset[],
    AxiosError<Dataset[]>
  >(
    ["datasetsBy", projectId],
    () =>
      datasetsApi
        .datasetsControllerFindAll(projectId)
        .then((response) => response.data),
    {
      retry: 2, // retry twice if fetch fails
      refetchInterval: 1000 * 30, // refetch every 30 seconds
    },
  );

  return {
    datasets: data,
    datasetsError: error,
    isErrorDatasets: isError,
    isLoadingDatasets: isLoading,
    refetchDatasets: refetch,
    removeDatasets: remove,
  };
};
