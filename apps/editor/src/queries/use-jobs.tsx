import { MiaJob } from "@visian/utils";
import axios, { AxiosError } from "axios";
import { useQuery } from "react-query";

import { hubBaseUrl } from "./hub-base-url";

const getJobs = async () => {
  const jobsResponse = await axios.get<MiaJob[]>(`${hubBaseUrl}jobs`);
  return jobsResponse.data;
};

export const useJobs = () => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    MiaJob[],
    AxiosError<MiaJob[]>
  >(["jobs"], getJobs, {
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

export default useJobs;
