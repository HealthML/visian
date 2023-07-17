import { AxiosError } from "axios";
import { Dataset, UpdateDatasetDto, CreateDatasetDto } from "mia-api-client";
import { useQuery } from "react-query";

import { DeleteMutation, UpdateMutation, CreateMutation } from "./mutations";
import { datasetsApi } from "../hub-base-url";

const datasetsByProjectQueryKey = "datasetsByProject";
const datasetQueryKey = "dataset";

export const useDataset = (datasetId: string) =>
  useQuery<Dataset, AxiosError<Dataset>>(
    [datasetQueryKey, datasetId],
    () =>
      datasetsApi
        .datasetsControllerFindOne(datasetId)
        .then((response) => response.data),
    {
      retry: 2, // retry twice if fetch fails
      refetchInterval: 1000 * 60, // refetch every minute
    },
  );

export const useDatasetsByProject = (projectId: string) =>
  useQuery<Dataset[], AxiosError<Dataset[]>>(
    [datasetsByProjectQueryKey, projectId],
    () =>
      datasetsApi
        .datasetsControllerFindAll(projectId)
        .then((response) => response.data),
    {
      retry: 2, // retry twice if fetch fails
      refetchInterval: 1000 * 30, // refetch every 30 seconds
    },
  );

export const deleteDatasetsMutation = () =>
  DeleteMutation<Dataset>({
    queryKey: (selectorId: string) => [datasetsByProjectQueryKey, selectorId],
    mutateFn: ({ objectIds }) =>
      datasetsApi
        .datasetsControllerRemoveAll({ ids: objectIds })
        .then((response) => response.data.map((d) => d.id)),
  });

export const updateDatasetMutation = () =>
  UpdateMutation<Dataset, UpdateDatasetDto>({
    queryKey: (selectorId: string) => [datasetsByProjectQueryKey, selectorId],
    // eslint-disable-next-line unused-imports/no-unused-vars
    mutateFn: ({ object, selectorId, updateDto }) =>
      datasetsApi
        .datasetsControllerUpdate(updateDto, object.id)
        .then((response) => response.data),
  });

export const createDatasetMutation = () =>
  CreateMutation<Dataset, CreateDatasetDto>({
    queryKey: (selectorId: string) => [datasetsByProjectQueryKey, selectorId],
    // eslint-disable-next-line unused-imports/no-unused-vars
    mutateFn: ({ createDto, selectorId }) =>
      datasetsApi
        .datasetsControllerCreate(createDto)
        .then((response) => response.data),
  });
