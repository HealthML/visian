import { MiaDataset, MiaProgress } from "@visian/utils";
import { AxiosError } from "axios";
import { CreateDatasetDto, UpdateDatasetDto } from "mia-typescript-sdk";
import { useQuery } from "react-query";

import { datasetsApi } from "../mia-api-client";
import { CreateMutation, DeleteMutation, UpdateMutation } from "./mutations";

const datasetsByProjectQueryBaseKey = "datasetsByProject";
const datasetQueryBaseKey = "dataset";
const datasetProgressQueryBaseKey = "datasetProgress";

export const useDataset = (datasetId: string) =>
  useQuery<MiaDataset, AxiosError<MiaDataset>>(
    [datasetQueryBaseKey, datasetId],
    async () => datasetsApi.findDataset({ id: datasetId }),
    {
      retry: 2,
      refetchInterval: 1000 * 10,
    },
  );

export const useDatasetsByProject = (projectId: string) =>
  useQuery<MiaDataset[], AxiosError<MiaDataset[]>>(
    [datasetsByProjectQueryBaseKey, projectId],
    async () => datasetsApi.findAllDatasets({ project: projectId }),
    {
      retry: 2,
      refetchInterval: 1000 * 10,
    },
  );

export const useDatasetProgress = (datasetId: string) =>
  useQuery<MiaProgress, AxiosError<MiaProgress>>(
    [datasetProgressQueryBaseKey, datasetId],
    async () => datasetsApi.retrieveDatasetProgress({ id: datasetId }),
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
      const deletedDatasets = await datasetsApi.deleteDatasets({
        deleteAllDto: { ids: objectIds },
      });
      return deletedDatasets.map((dataset) => dataset.id);
    },
  });

export const updateDatasetMutation = () =>
  UpdateMutation<MiaDataset, UpdateDatasetDto>({
    queryKey: (selectorId: string) => [
      datasetsByProjectQueryBaseKey,
      selectorId,
    ],
    mutateFn: async ({ object, updateDto }) =>
      datasetsApi.updateDataset({
        id: object.id,
        updateDatasetDto: updateDto,
      }),
  });

export const createDatasetMutation = () =>
  CreateMutation<MiaDataset, CreateDatasetDto>({
    queryKey: (selectorId: string) => [
      datasetsByProjectQueryBaseKey,
      selectorId,
    ],
    mutateFn: async ({ createDto }) =>
      datasetsApi.createDataset({ createDatasetDto: createDto }),
  });
