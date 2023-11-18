import { CreateDatasetDto, UpdateDatasetDto } from "@visian/mia-api";
import { MiaDataset, MiaProgress } from "@visian/utils";
import { AxiosError } from "axios";
import { useQuery } from "react-query";

import { datasetsApi } from "../mia-api-client";
import { CreateMutation, DeleteMutation, UpdateMutation } from "./mutations";

const datasetsByProjectQueryBaseKey = "datasetsByProject";
const datasetQueryBaseKey = "dataset";
const datasetProgressQueryBaseKey = "datasetProgress";

export const useDataset = (datasetId: string) =>
  useQuery<MiaDataset, AxiosError<MiaDataset>>(
    [datasetQueryBaseKey, datasetId],
    async () => {
      const response = await datasetsApi.datasetsControllerFindOne(datasetId);
      return response.data;
    },
    {
      retry: 2,
      refetchInterval: 1000 * 10,
    },
  );

export const useDatasetsByProject = (projectId: string) =>
  useQuery<MiaDataset[], AxiosError<MiaDataset[]>>(
    [datasetsByProjectQueryBaseKey, projectId],
    async () => {
      const response = await datasetsApi.datasetsControllerFindAll(projectId);
      return response.data;
    },
    {
      retry: 2,
      refetchInterval: 1000 * 10,
    },
  );

export const useDatasetProgress = (datasetId: string) =>
  useQuery<MiaProgress, AxiosError<MiaProgress>>(
    [datasetProgressQueryBaseKey, datasetId],
    async () => {
      const response = await datasetsApi.datasetsControllerProgress(datasetId);
      return response.data;
    },
    {
      retry: 2,
      refetchInterval: 1000 * 2,
    },
  );

export const deleteDatasetsMutation = () =>
  DeleteMutation<MiaDataset>({
    queryKey: (selectorId: string) => [
      datasetsByProjectQueryBaseKey,
      selectorId,
    ],
    mutateFn: async ({ objectIds }) => {
      const response = await datasetsApi.datasetsControllerRemoveAll({
        ids: objectIds,
      });
      return response.data.map((dataset) => dataset.id);
    },
  });

export const updateDatasetMutation = () =>
  UpdateMutation<MiaDataset, UpdateDatasetDto>({
    queryKey: (selectorId: string) => [
      datasetsByProjectQueryBaseKey,
      selectorId,
    ],
    mutateFn: async ({ object, updateDto }) => {
      const response = await datasetsApi.datasetsControllerUpdate(
        object.id,
        updateDto,
      );
      return response.data;
    },
  });

export const createDatasetMutation = () =>
  CreateMutation<MiaDataset, CreateDatasetDto>({
    queryKey: (selectorId: string) => [
      datasetsByProjectQueryBaseKey,
      selectorId,
    ],
    mutateFn: async ({ createDto }) => {
      const response = await datasetsApi.datasetsControllerCreate(createDto);
      return response.data;
    },
  });
