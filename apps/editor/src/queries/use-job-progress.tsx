import { MiaProgress } from "@visian/ui-shared";
import axios, { AxiosError } from "axios";
import { useQuery } from "react-query";

import { hubBaseUrl } from "./hub-base-url";

export const useJobProgress = (jobId: string) => {
  const { data, error, isLoading } = useQuery<
    MiaProgress,
    AxiosError<MiaProgress>
  >(
    ["job-progress", jobId],
    async () => {
      const response = await axios.get<MiaProgress>(
        `${hubBaseUrl}jobs/${jobId}/progress`,
      );
      return response.data;
    },
    {
      retry: 2, // retry twice if fetch fails
      refetchInterval: 1000 * 5, // refetch every 5 seconds
    },
  );

  return {
    progress: data,
    progressError: error,
    isLoadingProgress: isLoading,
  };
};
