import { MiaAnnotation } from "@visian/mia-api";
import axios, { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { hubBaseUrl } from "./hub-base-url";

export const patchAnnotation = async (
  annotationId?: string,
  annotation?: Partial<MiaAnnotation>,
) => {
  const annotationsResponse = await axios.patch<MiaAnnotation>(
    `${hubBaseUrl}annotations/${annotationId}`,
    {
      dataUri: annotation?.dataUri,
      verified: annotation?.verified,
    },
  );
  return annotationsResponse.data;
};

export const getAnnotationsByJobAndImage = async (
  jobId?: string,
  imageId?: string,
) => {
  const annotationsResponse = await axios.get<MiaAnnotation[]>(
    `${hubBaseUrl}annotations`,
    {
      params: {
        job: jobId,
        image: imageId,
      },
    },
  );
  return annotationsResponse.data;
};

export const getAnnotation = async (annotationId: string) => {
  const annotationsResponse = await axios.get<MiaAnnotation>(
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
  const deleteAnnotationsResponse = await axios.delete<MiaAnnotation[]>(
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
    MiaAnnotation[],
    AxiosError<MiaAnnotation[]>
  >(
    ["annotationsByImage", imageId],
    () => getAnnotationsByJobAndImage(undefined, imageId),
    {
      retry: 2, // retry twice if fetch fails
      refetchInterval: 1000 * 10, // refetch every 20 seconds
    },
  );

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
    MiaAnnotation[],
    AxiosError<MiaAnnotation[]>
  >(["annotationsByJob", jobId], () => getAnnotationsByJobAndImage(jobId), {
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

export const useDeleteAnnotationsForImageMutation = () => {
  const queryClient = useQueryClient();
  const { isError, isIdle, isLoading, isPaused, isSuccess, mutate } =
    useMutation<
      string[],
      AxiosError<MiaAnnotation[]>,
      {
        imageId: string;
        annotationIds: string[];
      },
      { previousAnnotations: MiaAnnotation[] }
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

        const previousAnnotations = queryClient.getQueryData<MiaAnnotation[]>([
          "annotationsByImage",
          imageId,
        ]);

        if (!previousAnnotations) return;

        const newAnnotations = previousAnnotations.filter(
          (annotaion: MiaAnnotation) => !annotationIds.includes(annotaion.id),
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
