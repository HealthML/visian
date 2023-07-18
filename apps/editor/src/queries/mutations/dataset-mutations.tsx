import { AxiosError } from "axios";
import {
  Dataset,
  UpdateDatasetDto,
  CreateDatasetDto,
  Progress,
} from "mia-api-client";
import { useQuery } from "react-query";

import { DeleteMutation, UpdateMutation, CreateMutation } from "./mutations";
import { datasetsApi } from "../hub-base-url";

const datasetsByProjectQueryBaseKey = "datasetsByProject";
const datasetQueryBaseKey = "dataset";
const datasetProgressQueryBaseKey = "datasetProgress";

export const useDataset = (datasetId: string) =>
  useQuery<Dataset, AxiosError<Dataset>>(
    [datasetQueryBaseKey, datasetId],
    () =>
      datasetsApi
        .datasetsControllerFindOne(datasetId)
        .then((response) => response.data),
    {
      retry: 2,
      refetchInterval: 1000 * 60,
    },
  );

export const useDatasetsByProject = (projectId: string) =>
  useQuery<Dataset[], AxiosError<Dataset[]>>(
    [datasetsByProjectQueryBaseKey, projectId],
    () =>
      datasetsApi
        .datasetsControllerFindAll(projectId)
        .then((response) => response.data),
    {
      retry: 2,
      refetchInterval: 1000 * 30,
    },
  );

export const useDatasetProgress = (datasetId: string) =>
  useQuery<Progress, AxiosError<Progress>>(
    [datasetProgressQueryBaseKey, datasetId],
    async () =>
      datasetsApi
        .datasetsControllerProgress(datasetId)
        .then((response) => response.data),
    {
      retry: 2,
      refetchInterval: 1000 * 5,
    },
  );

export const deleteDatasetsMutation = () =>
  DeleteMutation<Dataset>({
    queryKey: (selectorId: string) => [
      datasetsByProjectQueryBaseKey,
      selectorId,
    ],
    mutateFn: ({ objectIds }) =>
      datasetsApi
        .datasetsControllerRemoveAll({ ids: objectIds })
        .then((response) => response.data.map((d) => d.id)),
  });

export const updateDatasetMutation = () =>
  UpdateMutation<Dataset, UpdateDatasetDto>({
    queryKey: (selectorId: string) => [
      datasetsByProjectQueryBaseKey,
      selectorId,
    ],
    mutateFn: ({ object, updateDto }) =>
      datasetsApi
        .datasetsControllerUpdate(updateDto, object.id)
        .then((response) => response.data),
  });

export const createDatasetMutation = () =>
  CreateMutation<Dataset, CreateDatasetDto>({
    queryKey: (selectorId: string) => [
      datasetsByProjectQueryBaseKey,
      selectorId,
    ],
    mutateFn: ({ createDto }) =>
      datasetsApi
        .datasetsControllerCreate(createDto)
        .then((response) => response.data),
  });
