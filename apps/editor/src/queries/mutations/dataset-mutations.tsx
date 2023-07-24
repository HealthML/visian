import {
  CreateMiaDatasetDto,
  MiaDataset,
  MiaProgress,
  UpdateMiaDatasetDto,
} from "@visian/utils";
import { AxiosError } from "axios";
import { useQuery } from "react-query";

import { datasetsApi } from "../hub-base-url";
import { CreateMutation, DeleteMutation, UpdateMutation } from "./mutations";

const datasetsByProjectQueryBaseKey = "datasetsByProject";
const datasetQueryBaseKey = "dataset";
const datasetProgressQueryBaseKey = "datasetProgress";

export const useDataset = (datasetId: string) =>
  useQuery<MiaDataset, AxiosError<MiaDataset>>(
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
  useQuery<MiaDataset[], AxiosError<MiaDataset[]>>(
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
  useQuery<MiaProgress, AxiosError<MiaProgress>>(
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
  DeleteMutation<MiaDataset>({
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
  UpdateMutation<MiaDataset, UpdateMiaDatasetDto>({
    queryKey: (selectorId: string) => [
      datasetsByProjectQueryBaseKey,
      selectorId,
    ],
    mutateFn: ({ object, updateDto }) =>
      datasetsApi
        .datasetsControllerUpdate(object.id, updateDto)
        .then((response) => response.data),
  });

export const createDatasetMutation = () =>
  CreateMutation<MiaDataset, CreateMiaDatasetDto>({
    queryKey: (selectorId: string) => [
      datasetsByProjectQueryBaseKey,
      selectorId,
    ],
    mutateFn: ({ createDto }) =>
      datasetsApi
        .datasetsControllerCreate(createDto)
        .then((response) => response.data),
  });
