import { useQuery } from "react-query";

import { Image } from "../types";
import { baseUrl } from "./base-url";

const fetchImagesBy = async (datasetId: string) => {
  const imagesResponse = await fetch(`${baseUrl}images?dataset=${datasetId}`);
  if (!imagesResponse.ok)
    throw new Error(`${imagesResponse.statusText} (${imagesResponse.status})`);
  const images = (await imagesResponse.json()) as Image[];
  return images;
};

export const useImagesBy = (datasetId: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    Image[],
    Error
  >(["imagesBy", datasetId], () => fetchImagesBy(datasetId), {
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
