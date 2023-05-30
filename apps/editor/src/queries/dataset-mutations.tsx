import axios, { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Dataset } from "../types";
import {
  deleteDatasets,
  getDatasetsByProject,
  getDataset,
} from "./dataset-requests";
import { DeleteMutation } from "./delete-mutation";

export const deleteDatasetsMutation = () =>
  DeleteMutation<Dataset>({
    queryKey: (selectorId: string) => ["datasetsBy", selectorId],
    // eslint-disable-next-line unused-imports/no-unused-vars
    mutateFn: ({ objectIds, selectorId }) => deleteDatasets(objectIds),
  });

export const useDataset = (datasetId: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    Dataset,
    AxiosError<Dataset>
  >(["dataset", datasetId], () => getDataset(datasetId), {
    retry: 2, // retry twice if fetch fails
    refetchInterval: 1000 * 60, // refetch every minute
  });

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
  >(["datasetsBy", projectId], () => getDatasetsByProject(projectId), {
    retry: 2, // retry twice if fetch fails
    refetchInterval: 1000 * 30, // refetch every 30 seconds
  });

  return {
    datasets: data,
    datasetsError: error,
    isErrorDatasets: isError,
    isLoadingDatasets: isLoading,
    refetchDatasets: refetch,
    removeDatasets: remove,
  };
};
