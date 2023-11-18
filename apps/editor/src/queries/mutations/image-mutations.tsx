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
    async () => {
      const response = imagesApi.imagesControllerFindAll(datasetId);
      return (await response).data;
    },
    {
      retry: 2,
      refetchInterval: 1000 * 10,
      enabled: !!datasetId,
    },
  );

export const useImagesByJob = (jobId?: string) =>
  useQuery<MiaImage[], AxiosError<MiaImage[]>>(
    [imagesByJobQueryBaseKey, jobId],
    async () => {
      const response = await imagesApi.imagesControllerFindAll(
        undefined,
        jobId,
      );
      return response.data;
    },
    {
      retry: 2,
      refetchInterval: 1000 * 10,
      enabled: !!jobId,
    },
  );

export const deleteImagesMutation = () =>
  DeleteMutation<MiaImage>({
    queryKey: (selectorId: string) => [imagesByDatasetQueryBaseKey, selectorId],
    mutateFn: async ({ objectIds }) => {
      const response = await imagesApi.imagesControllerRemoveAll({
        ids: objectIds,
      });
      return response.data.map((image) => image.id);
    },
  });
