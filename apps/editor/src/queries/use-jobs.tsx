import axios, { AxiosError } from "axios";
import { useQuery } from "react-query";

import { Job } from "../types";
import { hubBaseUrl } from "./hub-base-url";

const getJobs = async () => {
  const jobsResponse = await axios.get<Job[]>(`${hubBaseUrl}jobs`);
  return jobsResponse.data;
};

export const useJobs = () => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    Job[],
    AxiosError<Job[]>
  >(["jobs"], getJobs, {
    retry: 2, // retry twice if fetch fails
    refetchInterval: 1000, // refetch every second
  });

  return {
    jobs: data,
    jobsError: error,
    isErrorJobs: isError,
    isLoadingJobs: isLoading,
    refetchJobs: refetch,
    removeJobs: remove,
  };
};

export default useJobs;
