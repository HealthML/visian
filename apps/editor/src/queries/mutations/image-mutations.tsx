import { MiaImage } from "@visian/utils";
import { AxiosError } from "axios";
import { useQuery } from "react-query";

import { imagesApi } from "../mia-api-client";
import { DeleteMutation } from "./mutations";

const imagesByDatasetQueryBaseKey = "imagesByDataset";
const imagesByJobQueryBaseKey = "imagesByJob";

export const useImagesByDataset = (datasetId?: string) =>
  useQuery<MiaImage[], AxiosError<MiaImage[]>>(
    [imagesByDatasetQueryBaseKey, datasetId],
    () =>
      imagesApi
        .imagesControllerFindAll(datasetId)
        .then((response) => response.data),
    {
      retry: 2,
      refetchInterval: 1000 * 10,
      enabled: !!datasetId,
    },
  );

export const useImagesByJob = (jobId?: string) =>
  useQuery<MiaImage[], AxiosError<MiaImage[]>>(
    [imagesByJobQueryBaseKey, jobId],
    () =>
      imagesApi
        .imagesControllerFindAll(undefined, jobId)
        .then((response) => response.data),
    {
      retry: 2,
      refetchInterval: 1000 * 10,
      enabled: !!jobId,
    },
  );

export const deleteImagesMutation = () =>
  DeleteMutation<MiaImage>({
    queryKey: (selectorId: string) => [imagesByDatasetQueryBaseKey, selectorId],
    mutateFn: ({ objectIds }) =>
      imagesApi
        .imagesControllerRemoveAll({ ids: objectIds })
        .then((response) => response.data.map((i) => i.id)),
  });
