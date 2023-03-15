import axios, { AxiosError } from "axios";
import { useQuery } from "react-query";

import { Job } from "../types";
import { hubBaseUrl } from "./hub-base-url";

const getJobsBy = async (projectId: string) => {
  const jobsResponse = await axios.get<Job[]>(
    `${hubBaseUrl}jobs/?project=${projectId}`,
  );
  return jobsResponse.data;
};

export const useJobsBy = (projectId: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    Job[],
    AxiosError<Job[]>
  >(["jobs", projectId], () => getJobsBy(projectId), {
    retry: 2, // retry twice if fetch fails
    refetchInterval: 1000 * 20, // refetch every 20 seconds
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

export default useJobsBy;
