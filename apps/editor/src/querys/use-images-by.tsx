import axios, { AxiosError } from "axios";
import { useQuery } from "react-query";

import { Image } from "../types";
import { baseUrl } from "./base-url";

const getImagesBy = async (datasetId: string) => {
  const imagesResponse = await axios.get<Image[]>(`${baseUrl}images`, {
    params: {
      dataset: datasetId,
    },
  });
  return imagesResponse.data;
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
