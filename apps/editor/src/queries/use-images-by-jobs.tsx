import { Image } from "@visian/ui-shared";
import axios, { AxiosError } from "axios";
import { useQuery } from "react-query";

import { hubBaseUrl } from "./hub-base-url";

export const getImagesByJob = async (jobId: string) => {
  const imagesResponse = await axios.get<Image[]>(`${hubBaseUrl}images`, {
    params: {
      job: jobId,
    },
  });
  return imagesResponse.data;
};

export const useImagesByJob = (jobId: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    Image[],
    AxiosError<Image[]>
  >(["imagesByJob", jobId], () => getImagesByJob(jobId), {
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

export default useImagesByJob;
