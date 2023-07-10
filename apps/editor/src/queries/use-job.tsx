import { MiaJob } from "@visian/utils";
import axios, { AxiosError } from "axios";
import { useQuery } from "react-query";

import { hubBaseUrl } from "./hub-base-url";

const getJob = async (id: string) => {
  const jobResponse = await axios.get<MiaJob>(`${hubBaseUrl}jobs/${id}`);
  return jobResponse.data;
};

export const useJob = (jobId: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    MiaJob,
    AxiosError<MiaJob>
  >(["job"], () => getJob(jobId), {
    retry: 2, // retry twice if fetch fails
    refetchInterval: 1000 * 20, // refetch every 20 seconds
  });

  return {
    job: data,
    jobError: error,
    isErrorJob: isError,
    isLoadingJob: isLoading,
    refetchJob: refetch,
    removeJob: remove,
  };
};

export default useJob;
