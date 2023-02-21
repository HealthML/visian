import axios, { AxiosError } from "axios";
import { useQuery } from "react-query";

import { Image } from "../types";
import { hubBaseUrl } from "./hub-base-url";

const getImagesBy = async (datasetId: string) => {
  const imagesResponse = await axios.get<Image[]>(`${hubBaseUrl}images`, {
    params: {
      dataset: datasetId,
    },
  });
  return imagesResponse.data;
};

export const getImage = async (imageId: string) => {
  const imageResponse = await axios.get<Image>(
    `${hubBaseUrl}images/${imageId}`,
  );
  return imageResponse.data;
};

export const useImagesBy = (datasetId: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    Image[],
    AxiosError<Image[]>
  >(["imagesBy", datasetId], () => getImagesBy(datasetId), {
    retry: 2, // retry twice if fetch fails
    refetchInterval: 1000 * 10, // refetch every 10 seconds
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

export default useImagesBy;
