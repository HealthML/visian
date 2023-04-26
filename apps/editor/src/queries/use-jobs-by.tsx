import axios, { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

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

const deleteJobs = async ({
  projectId,
  jobIds,
}: {
  projectId: string;
  jobIds: string[];
}) => {
  const deleteJobsResponse = await axios.delete<Job[]>(`${hubBaseUrl}jobs`, {
    data: { ids: jobIds },
    timeout: 1000 * 2, // 2 secods
  });
  return deleteJobsResponse.data.map((j) => j.id);
};

export const useDeleteJobsForProjectMutation = () => {
  const queryClient = useQueryClient();
  const { isError, isIdle, isLoading, isPaused, isSuccess, mutate } =
    useMutation<
      string[],
      AxiosError<Job[]>,
      {
        projectId: string;
        jobIds: string[];
      },
      { previousJobs: Job[] }
    >({
      mutationFn: deleteJobs,
      onMutate: async ({
        projectId,
        jobIds,
      }: {
        projectId: string;
        jobIds: string[];
      }) => {
        await queryClient.cancelQueries({
          queryKey: ["jobs", projectId],
        });

        const previousJobs = queryClient.getQueryData<Job[]>([
          "jobs",
          projectId,
        ]);

        if (!previousJobs) return;

        const newJobs = previousJobs.filter(
          (job: Job) => !jobIds.includes(job.id),
        );

        queryClient.setQueryData(["jobs", projectId], newJobs);

        return {
          previousJobs,
        };
      },
      onError: (err, { projectId, jobIds }, context) => {
        queryClient.setQueryData(["jobs", projectId], context?.previousJobs);
      },
      onSettled: (data, err, { projectId, jobIds }) => {
        queryClient.invalidateQueries({
          queryKey: ["jobs", projectId],
        });
      },
    });
  return {
    isDeleteJobsError: isError,
    isDeleteJobsIdle: isIdle,
    isDeleteJobsLoading: isLoading,
    isDeleteJobsPaused: isPaused,
    isDeleteJobsSuccess: isSuccess,
    deleteJobs: mutate,
  };
};

export default useJobsBy;
