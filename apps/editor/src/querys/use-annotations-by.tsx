import { useQuery } from "react-query";

import { Annotation } from "../types";
import { baseUrl } from "./base-url";

const fetchAnnotationsBy = async (imageId: string) => {
  const annotationsResponse = await fetch(
    `${baseUrl}annotations?image=${imageId}`,
  );
  if (!annotationsResponse.ok)
    throw new Error(
      `${annotationsResponse.statusText} (${annotationsResponse.status})`,
    );
  const annotations = (await annotationsResponse.json()) as Annotation[];
  return annotations;
};

export const useAnnotationsBy = (imageId: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    Annotation[],
    Error
  >(["annotationsBy", imageId], () => fetchAnnotationsBy(imageId), {
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
