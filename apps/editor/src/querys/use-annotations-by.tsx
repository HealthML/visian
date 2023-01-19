import axios, { AxiosError } from "axios";
import { useQuery } from "react-query";

import { Annotation } from "../types";
import { hubBaseUrl } from "./hub-base-url";

const getAnnotationsBy = async (imageId: string) => {
  const annotationsResponse = await axios.get<Annotation[]>(
    `${hubBaseUrl}annotations`,
    {
      params: {
        image: imageId,
      },
    },
  );
  return annotationsResponse.data;
};

export const useAnnotationsBy = (imageId: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    Annotation[],
    AxiosError<Annotation[]>
  >(["annotationsBy", imageId], () => getAnnotationsBy(imageId), {
    retry: 2, // retry twice if fetch fails
    refetchInterval: 1000 * 20, // refetch every 20 seconds
  });

  return {
    annotations: data,
    annotationsError: error,
    isErrorAnnotations: isError,
    isLoadingAnnotations: isLoading,
    refetchAnnotations: refetch,
    removeAnnotations: remove,
  };
};

export default useAnnotationsBy;
