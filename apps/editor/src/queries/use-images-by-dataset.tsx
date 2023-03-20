import axios, { AxiosError } from "axios";
import { useQuery } from "react-query";

import { Image } from "../types";
import { hubBaseUrl } from "./hub-base-url";

const getImagesByDataset = async (datasetId: string) => {
  const imagesResponse = await axios.get<Image[]>(`${hubBaseUrl}images`, {
    params: {
      dataset: datasetId,
    },
  });
  return imagesResponse.data;
};

export const useImagesByDataset = (datasetId: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    Image[],
    AxiosError<Image[]>
  >(["imagesByDataset", datasetId], () => getImagesByDataset(datasetId), {
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

export default useImagesByDataset;
