import { Image } from "@visian/mia-api";
import { AxiosError } from "axios";
import { useQuery } from "react-query";

import { imagesApi } from "../hub-base-url";
import { DeleteMutation } from "./mutations";

const imagesByDatasetQueryBaseKey = "imagesByDataset";
const imagesByJobQueryBaseKey = "imagesByJob";

export const useImagesByDataset = (datasetId?: string) =>
  useQuery<Image[], AxiosError<Image[]>>(
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
  useQuery<Image[], AxiosError<Image[]>>(
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
  DeleteMutation<Image>({
    queryKey: (selectorId: string) => [imagesByDatasetQueryBaseKey, selectorId],
    mutateFn: ({ objectIds }) =>
      imagesApi
        .imagesControllerRemoveAll({ ids: objectIds })
        .then((response) => response.data.map((i) => i.id)),
  });
