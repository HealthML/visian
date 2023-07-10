import { MiaDataset } from "@visian/ui-shared";
import axios, { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { hubBaseUrl } from "./hub-base-url";

const getDatasetsBy = async (projectId: string) => {
  const datasetsResponse = await axios.get<MiaDataset[]>(
    `${hubBaseUrl}datasets`,
    {
      params: {
        project: projectId,
      },
    },
  );
  return datasetsResponse.data;
};

export const useDatasetsBy = (projectId: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    MiaDataset[],
    AxiosError<MiaDataset[]>
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
  const postDatasetResponse = await axios.post<MiaDataset>(
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
  const deleteDatasetsResponse = await axios.delete<MiaDataset[]>(
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
      AxiosError<MiaDataset[]>,
      {
        projectId: string;
        datasetIds: string[];
      },
      { previousDatasets: MiaDataset[] }
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

        const previousDatasets = queryClient.getQueryData<MiaDataset[]>([
          "datasetsBy",
          projectId,
        ]);

        if (!previousDatasets) return;

        const newDatasets = previousDatasets.filter(
          (annotaion: MiaDataset) => !datasetIds.includes(annotaion.id),
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

const putDataset = async (dataset: MiaDataset) => {
  const putDatasetResponse = await axios.put<MiaDataset>(
    `${hubBaseUrl}datasets/${dataset.id}`,
    {
      name: dataset.name,
      project: dataset.project,
    },
    {
      timeout: 1000 * 3.14, // pi seconds
    },
  );
  return putDatasetResponse.data;
};

export const useUpdateDatasetsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    MiaDataset,
    AxiosError,
    MiaDataset,
    { previousDatasets: MiaDataset[] }
  >({
    mutationFn: putDataset,
    onMutate: async (dataset: MiaDataset) => {
      await queryClient.cancelQueries({
        queryKey: ["datasetsBy", dataset.project],
      });

      const previousDatasets = queryClient.getQueryData<MiaDataset[]>([
        "datasetsBy",
        dataset.project,
      ]);

      if (!previousDatasets) return;

      const newDatasets = previousDatasets.map((d) =>
        d.id === dataset.id ? dataset : d,
      );

      queryClient.setQueryData(["datasetsBy", dataset.project], newDatasets);

      return {
        previousDatasets,
      };
    },
    onError: (err, dataset, context) => {
      queryClient.setQueryData(
        ["datasetsBy", dataset.project],
        context?.previousDatasets,
      );
    },
    onSettled: (data, err, dataset) => {
      queryClient.invalidateQueries({
        queryKey: ["datasetsBy", dataset.project],
      });
    },
  });
};

export const useCreateDatasetMutation = () => {
  const queryClient = useQueryClient();
  const { isError, isIdle, isLoading, isPaused, isSuccess, mutate } =
    useMutation<
      MiaDataset,
      AxiosError,
      { name: string; project: string },
      { previousDatasets: MiaDataset[] }
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
          queryClient.getQueryData<MiaDataset[]>(["datasetsBy", project]) ?? [];

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
