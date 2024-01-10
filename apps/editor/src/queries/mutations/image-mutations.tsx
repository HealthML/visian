import { MiaImage } from "@visian/utils";
import { AxiosError } from "axios";
import { useQuery } from "react-query";

import { DeleteMutation } from "./mutations";
import { imagesApi } from "../mia-api-client";

const imagesByDatasetQueryBaseKey = "imagesByDataset";
const imagesByJobQueryBaseKey = "imagesByJob";

export const useImagesByDataset = (datasetId?: string) =>
  useQuery<MiaImage[], AxiosError<MiaImage[]>>(
    [imagesByDatasetQueryBaseKey, datasetId],
    async () => imagesApi.findAllImages({ dataset: datasetId }),
    {
      retry: 2,
      refetchInterval: 1000 * 10,
      enabled: !!datasetId,
    },
  );

export const useImagesByJob = (jobId?: string) =>
  useQuery<MiaImage[], AxiosError<MiaImage[]>>(
    [imagesByJobQueryBaseKey, jobId],
    async () => imagesApi.findAllImages({ dataset: undefined, job: jobId }),
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
      const deletedImages = await imagesApi.deleteImages({
        deleteAllDto: { ids: objectIds },
      });
      return deletedImages.map((image) => image.id);
    },
  });
