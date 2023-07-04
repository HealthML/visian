import axios, { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

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

const deleteAnnotations = async ({
  imageId,
  annotationIds,
}: {
  imageId: string;
  annotationIds: string[];
}) => {
  const deleteAnnotationsResponse = await axios.delete<Annotation[]>(
    `${hubBaseUrl}annotations`,
    {
      data: { ids: annotationIds },
      timeout: 1000 * 2, // 2 secods
    },
  );

  return deleteAnnotationsResponse.data.map((i) => i.id);
};

export const useAnnotationsByImage = (imageId: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    Annotation[],
    AxiosError<Annotation[]>
  >(["annotationsByImage", imageId], () => getAnnotationsByImage(imageId), {
    retry: 2, // retry twice if fetch fails
    refetchInterval: 1000 * 10, // refetch every 20 seconds
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
    refetchInterval: 1000 * 1, // refetch every 20 seconds
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

export const useDeleteAnnotationsForImageMutation = () => {
  const queryClient = useQueryClient();
  const { isError, isIdle, isLoading, isPaused, isSuccess, mutate } =
    useMutation<
      string[],
      AxiosError<Annotation[]>,
      {
        imageId: string;
        annotationIds: string[];
      },
      { previousAnnotations: Annotation[] }
    >({
      mutationFn: deleteAnnotations,
      onMutate: async ({
        imageId,
        annotationIds,
      }: {
        imageId: string;
        annotationIds: string[];
      }) => {
        await queryClient.cancelQueries({
          queryKey: ["annotationsByImage", imageId],
        });

        const previousAnnotations = queryClient.getQueryData<Annotation[]>([
          "annotationsByImage",
          imageId,
        ]);

        if (!previousAnnotations) return;

        const newAnnotations = previousAnnotations.filter(
          (annotaion: Annotation) => !annotationIds.includes(annotaion.id),
        );

        queryClient.setQueryData(
          ["annotationsByImage", imageId],
          newAnnotations,
        );

        return {
          previousAnnotations,
        };
      },
      onError: (err, { imageId, annotationIds }, context) => {
        queryClient.setQueryData(
          ["annotationsByImage", imageId],
          context?.previousAnnotations,
        );
      },
      onSettled: (data, err, { imageId, annotationIds }) => {
        queryClient.invalidateQueries({
          queryKey: ["annotationsByImage", imageId],
        });
      },
    });
  return {
    isDeleteAnnotationsError: isError,
    isDeleteAnnotationsIdle: isIdle,
    isDeleteAnnotationsLoading: isLoading,
    isDeleteAnnotationsPaused: isPaused,
    isDeleteAnnotationsSuccess: isSuccess,
    deleteAnnotations: mutate,
  };
};

export default useAnnotationsByImage;
