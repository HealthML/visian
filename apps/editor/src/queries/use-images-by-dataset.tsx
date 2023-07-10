import { Image } from "@visian/ui-shared";
import axios, { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { hubBaseUrl } from "./hub-base-url";

export const getImagesByDataset = async (datasetId?: string) => {
  const imagesResponse = await axios.get<Image[]>(`${hubBaseUrl}images`, {
    params: {
      dataset: datasetId,
    },
  });
  return imagesResponse.data;
};

const deleteImages = async (imageIds: string[]) => {
  const deleteImagesResponse = await axios.delete<Image[]>(
    `${hubBaseUrl}images`,
    {
      data: { ids: imageIds },
      timeout: 1000 * 2, // 2 secods
    },
  );

  return deleteImagesResponse.data.map((i) => i.id);
};

export const useImagesByDataset = (datasetId?: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    Image[],
    AxiosError<Image[]>
  >(["imagesByDataset", datasetId], () => getImagesByDataset(datasetId), {
    retry: 2, // retry twice if fetch fails
    refetchInterval: 1000 * 10, // refetch every 10 seconds
    enabled: !!datasetId,
  });

  return {
    images: data,
    imagesError: error,
    isErrorImages: isError,
    isLoadingImages: isLoading,
    refetchImages: refetch,
    removeImages: remove,
  };
};

export const useDeleteImagesMutation = (datasetId: string) => {
  const queryClient = useQueryClient();
  const { isError, isIdle, isLoading, isPaused, isSuccess, mutate } =
    useMutation<
      string[],
      AxiosError<Image[]>,
      string[],
      { previousImages: Image[] }
    >({
      mutationFn: deleteImages,
      onMutate: async (imageIds: string[]) => {
        await queryClient.cancelQueries({
          queryKey: ["imagesByDataset", datasetId],
        });

        const previousImages = queryClient.getQueryData<Image[]>([
          "imagesByDataset",
          datasetId,
        ]);

        if (!previousImages) return;

        const newImages = previousImages.filter(
          (image: Image) => !imageIds.includes(image.id),
        );

        queryClient.setQueryData(["imagesByDataset", datasetId], newImages);

        return {
          previousImages,
        };
      },
      onError: (err, imagesToBeDeleted, context) => {
        queryClient.setQueryData(
          ["imagesByDataset", datasetId],
          context?.previousImages,
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["imagesByDataset", datasetId],
        });
      },
    });
  return {
    isDeleteImagesError: isError,
    isDeleteImagesIdle: isIdle,
    isDeleteImagesLoading: isLoading,
    isDeleteImagesPaused: isPaused,
    isDeleteImagesSuccess: isSuccess,
    deleteImages: mutate,
  };
};

export default useImagesByDataset;
