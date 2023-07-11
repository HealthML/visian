import axios, { AxiosError } from "axios";
import { useQuery } from "react-query";

import { Job } from "../types";
import { hubBaseUrl } from "./hub-base-url";

const getJob = async (id: string) => {
  const jobResponse = await axios.get<Job>(`${hubBaseUrl}jobs/${id}`);
  return jobResponse.data;
};

export const useJob = (jobId: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    Job,
    AxiosError<Job>
  >(["job"], () => getJob(jobId), {
    retry: 2, // retry twice if fetch fails
    refetchInterval: 1000 * 2, // refetch every 2 seconds
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
