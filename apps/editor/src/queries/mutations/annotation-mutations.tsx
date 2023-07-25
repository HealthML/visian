import { MiaAnnotation } from "@visian/utils";
import { AxiosError } from "axios";
import { useQuery } from "react-query";

import { annotationsApi } from "../mia-api-client";
import { DeleteMutation, UpdateMutation } from "./mutations";

const annotationByImageQueryBaseKey = "annotationByImage";
const annotationByJobQueryBaseKey = "annotationByJob";

export const useAnnotationsByImage = (imageid: string) =>
  useQuery<MiaAnnotation[], AxiosError<MiaAnnotation[]>>(
    [annotationByImageQueryBaseKey, imageid],
    () =>
      annotationsApi
        .annotationsControllerFindAll(imageid)
        .then((response) => response.data),
    {
      retry: 2,
      refetchInterval: 1000 * 10,
    },
  );

export const useAnnotationsByJob = (jobId: string) =>
  useQuery<MiaAnnotation[], AxiosError<MiaAnnotation[]>>(
    [annotationByJobQueryBaseKey, jobId],
    () =>
      annotationsApi
        .annotationsControllerFindAll(undefined, jobId)
        .then((response) => response.data),
    {
      retry: 2,
      refetchInterval: 1000 * 20,
    },
  );

export const deleteAnnotationsForImageMutation = () =>
  DeleteMutation<MiaAnnotation>({
    queryKey: (imageId: string) => [annotationByImageQueryBaseKey, imageId],
    mutateFn: ({ objectIds }) =>
      annotationsApi
        .annotationsControllerRemoveAll({ ids: objectIds })
        .then((response) => response.data.map((a) => a.id)),
  });

export const updateAnnotationsForImageMutation = () =>
  UpdateMutation<MiaAnnotation, { dataUri?: string; verified?: boolean }>({
    queryKey: (imageId: string) => [annotationByImageQueryBaseKey, imageId],
    mutateFn: ({ object, updateDto }) =>
      annotationsApi
        .annotationsControllerUpdate(object.id, updateDto)
        .then((response) => response.data),
  });
