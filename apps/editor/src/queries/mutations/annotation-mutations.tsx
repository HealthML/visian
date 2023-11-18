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
    async () => {
      const response = await annotationsApi.annotationsControllerFindAll(
        imageid,
      );
      return response.data;
    },
    {
      retry: 2,
      refetchInterval: 1000 * 10,
    },
  );

export const useAnnotationsByJob = (jobId: string) =>
  useQuery<MiaAnnotation[], AxiosError<MiaAnnotation[]>>(
    [annotationByJobQueryBaseKey, jobId],
    async () => {
      const response = await annotationsApi.annotationsControllerFindAll(
        undefined,
        jobId,
      );
      return response.data;
    },
    {
      retry: 2,
      refetchInterval: 1000 * 10,
    },
  );

export const deleteAnnotationsForImageMutation = () =>
  DeleteMutation<MiaAnnotation>({
    queryKey: (imageId: string) => [annotationByImageQueryBaseKey, imageId],
    mutateFn: async ({ objectIds }) => {
      const response = await annotationsApi.annotationsControllerRemoveAll({
        ids: objectIds,
      });
      return response.data.map((annotation) => annotation.id);
    },
  });

export const updateAnnotationsForImageMutation = () =>
  UpdateMutation<MiaAnnotation, { dataUri?: string; verified?: boolean }>({
    queryKey: (imageId: string) => [annotationByImageQueryBaseKey, imageId],
    mutateFn: async ({ object, updateDto }) => {
      const response = await annotationsApi.annotationsControllerUpdate(
        object.id,
        updateDto,
      );
      return response.data;
    },
  });
