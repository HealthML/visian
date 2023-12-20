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
    async () => annotationsApi.findAllAnnotations({ image: imageid }),
    {
      retry: 2,
      refetchInterval: 1000 * 10,
    },
  );

export const useAnnotationsByJob = (jobId: string) =>
  useQuery<MiaAnnotation[], AxiosError<MiaAnnotation[]>>(
    [annotationByJobQueryBaseKey, jobId],
    async () =>
      annotationsApi.findAllAnnotations({ image: undefined, job: jobId }),
    {
      retry: 2,
      refetchInterval: 1000 * 10,
    },
  );

export const deleteAnnotationsForImageMutation = () =>
  DeleteMutation<MiaAnnotation>({
    queryKey: (imageId: string) => [annotationByImageQueryBaseKey, imageId],
    mutateFn: async ({ objectIds }) => {
      const deletedAnnotations = await annotationsApi.deleteAnnotations({
        deleteAllDto: { ids: objectIds },
      });
      return deletedAnnotations.map((annotation) => annotation.id);
    },
  });

export const updateAnnotationsForImageMutation = () =>
  UpdateMutation<MiaAnnotation, { dataUri?: string; verified?: boolean }>({
    queryKey: (imageId: string) => [annotationByImageQueryBaseKey, imageId],
    mutateFn: async ({ object, updateDto }) =>
      annotationsApi.updateAnnotation({
        id: object.id,
        updateAnnotationDto: updateDto,
      }),
  });
