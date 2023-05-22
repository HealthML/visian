import axios, { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { Dataset } from "../types";
import { hubBaseUrl } from "./hub-base-url";

const getDatasetsBy = async (projectId: string) => {
  const datasetsResponse = await axios.get<Dataset[]>(`${hubBaseUrl}datasets`, {
    params: {
      project: projectId,
    },
  });
  return datasetsResponse.data;
};

export const useDatasetsBy = (projectId: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    Dataset[],
    AxiosError<Dataset[]>
  >(["datasetsBy", projectId], () => getDatasetsBy(projectId), {
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

const postDataset = async ({
  name,
  project,
}: {
  name: string;
  project: string;
}) => {
  const postDatasetResponse = await axios.post<Dataset>(
    `${hubBaseUrl}datasets`,
    { name, project },
  );
  return postDatasetResponse.data;
};

const deleteDatasets = async ({
  projectId,
  datasetIds,
}: {
  projectId: string;
  datasetIds: string[];
}) => {
  const deleteDatasetsResponse = await axios.delete<Dataset[]>(
    `${hubBaseUrl}datasets`,
    {
      data: { ids: datasetIds },
      timeout: 1000 * 2, // 2 secods
    },
  );
  return deleteDatasetsResponse.data.map((d) => d.id);
};

export const useDeleteDatasetsForProjectMutation = () => {
  const queryClient = useQueryClient();
  const { isError, isIdle, isLoading, isPaused, isSuccess, mutate } =
    useMutation<
      string[],
      AxiosError<Dataset[]>,
      {
        projectId: string;
        datasetIds: string[];
      },
      { previousDatasets: Dataset[] }
    >({
      mutationFn: deleteDatasets,
      onMutate: async ({
        projectId,
        datasetIds,
      }: {
        projectId: string;
        datasetIds: string[];
      }) => {
        await queryClient.cancelQueries({
          queryKey: ["datasetsBy", projectId],
        });

        const previousDatasets = queryClient.getQueryData<Dataset[]>([
          "datasetsBy",
          projectId,
        ]);

        if (!previousDatasets) return;

        const newDatasets = previousDatasets.filter(
          (annotaion: Dataset) => !datasetIds.includes(annotaion.id),
        );

        queryClient.setQueryData(["datasetsBy", projectId], newDatasets);

        return {
          previousDatasets,
        };
      },
      onError: (err, { projectId, datasetIds }, context) => {
        queryClient.setQueryData(
          ["datasetsBy", projectId],
          context?.previousDatasets,
        );
      },
      onSettled: (data, err, { projectId, datasetIds }) => {
        queryClient.invalidateQueries({
          queryKey: ["datasetsBy", projectId],
        });
      },
    });
  return {
    isDeleteDatasetsError: isError,
    isDeleteDatasetsIdle: isIdle,
    isDeleteDatasetsLoading: isLoading,
    isDeleteDatasetsPaused: isPaused,
    isDeleteDatasetsSuccess: isSuccess,
    deleteDatasets: mutate,
  };
};

export const useCreateDatasetMutation = () => {
  const queryClient = useQueryClient();
  const { isError, isIdle, isLoading, isPaused, isSuccess, mutate } =
    useMutation<
      Dataset,
      AxiosError,
      { name: string; project: string },
      { previousDatasets: Dataset[] }
    >({
      mutationFn: postDataset,
      onMutate: async ({
        name,
        project,
      }: {
        name: string;
        project: string;
      }) => {
        await queryClient.cancelQueries({
          queryKey: ["datasetsBy", project],
        });

        const previousDatasets =
          queryClient.getQueryData<Dataset[]>(["datasetsBy", project]) ?? [];

        const newDataset = {
          id: "new-dataset",
          name,
          project,
        };

        queryClient.setQueryData(
          ["datasetsBy", project],
          [...previousDatasets, newDataset],
        );

        return {
          previousDatasets,
        };
      },
      onError: (err, { name, project }, context) => {
        queryClient.setQueryData(
          ["datasetsBy", project],
          context?.previousDatasets,
        );
      },
      onSettled: (data, err, { name, project }) => {
        queryClient.invalidateQueries({
          queryKey: ["datasetsBy", project],
        });
      },
    });
  return {
    isCreateDatasetError: isError,
    isCreateDatasetIdle: isIdle,
    isCreateDatasetLoading: isLoading,
    isCreateDatasetPaused: isPaused,
    isCreateDatasetSuccess: isSuccess,
    createDataset: mutate,
  };
};

export default useDatasetsBy;
