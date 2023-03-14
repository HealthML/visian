import axios, { AxiosError } from "axios";
import { useQuery } from "react-query";

import { Annotation } from "../types";
import { hubBaseUrl } from "./hub-base-url";

const getAnnotationsByImage = async (imageId: string) => {
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

const getAnnotationsByJob = async (jobId: string) => {
  const annotationsResponse = await axios.get<Annotation[]>(
    `${hubBaseUrl}annotations`,
    {
      params: {
        job: jobId,
      },
    },
  );
  return annotationsResponse.data;
};

export const getAnnotation = async (annotationId: string) => {
  const annotationsResponse = await axios.get<Annotation>(
    `${hubBaseUrl}annotations/${annotationId}`,
  );
  return annotationsResponse.data;
};

export const useAnnotationsByImage = (imageId: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    Annotation[],
    AxiosError<Annotation[]>
  >(["annotationsByImage", imageId], () => getAnnotationsByImage(imageId), {
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

export const useAnnotationsByJob = (jobId: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    Annotation[],
    AxiosError<Annotation[]>
  >(["annotationsByJob", jobId], () => getAnnotationsByJob(jobId), {
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

export default useAnnotationsByImage;
