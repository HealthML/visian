import { MiaJob } from "@visian/ui-shared";
import axios, { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { hubBaseUrl } from "./hub-base-url";

const getJobsBy = async (projectId: string) => {
  const jobsResponse = await axios.get<MiaJob[]>(
    `${hubBaseUrl}jobs/?project=${projectId}`,
  );
  return jobsResponse.data;
};

export const useJobsBy = (projectId: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    MiaJob[],
    AxiosError<MiaJob[]>
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

const patchJobStatus = async ({
  projectId,
  jobId,
  jobStatus,
}: {
  projectId: string;
  jobId: string;
  jobStatus: string;
}) => {
  const jobsResponse = await axios.patch<MiaJob>(
    `${hubBaseUrl}jobs/${jobId}`,
    { status: jobStatus },
    {
      timeout: 1000 * 2, // 2 seconds
    },
  );
  return jobsResponse.data;
};

export const usePatchJobStatusMutation = () => {
  const queryClient = useQueryClient();
  const { isError, isIdle, isLoading, isPaused, isSuccess, mutate } =
    useMutation<
      MiaJob,
      AxiosError<MiaJob>,
      { projectId: string; jobId: string; jobStatus: string },
      { previousJobs: MiaJob[] }
    >({
      mutationFn: patchJobStatus,
      onMutate: async ({ projectId, jobId, jobStatus }) => {
        await queryClient.cancelQueries({ queryKey: ["jobs", projectId] });

        const previousJobs = queryClient.getQueryData<MiaJob[]>([
          "jobs",
          projectId,
        ]);

        if (!previousJobs) return;

        const updatedJobs = previousJobs.map((job) => {
          if (job.id === jobId) {
            return {
              ...job,
              status: jobStatus,
            };
          }
          return job;
        });

        queryClient.setQueryData(["jobs", projectId], updatedJobs);

        return { previousJobs };
      },
      onError: (err, { projectId }, context) => {
        queryClient.setQueryData(["jobs", projectId], context?.previousJobs);
      },
      onSettled: (data, err, { projectId }) => {
        queryClient.invalidateQueries({ queryKey: ["jobs", projectId] });
      },
    });
  return {
    isPatchJobStatusError: isError,
    isPatchJobStatusIdle: isIdle,
    isPatchJobStatusLoading: isLoading,
    isPatchJobStatusPaused: isPaused,
    isPatchJobStatusSuccess: isSuccess,
    patchJobStatus: mutate,
  };
};

const deleteJobs = async ({
  projectId,
  jobIds,
}: {
  projectId: string;
  jobIds: string[];
}) => {
  const deleteJobsResponse = await axios.delete<MiaJob[]>(`${hubBaseUrl}jobs`, {
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
      AxiosError<MiaJob[]>,
      {
        projectId: string;
        jobIds: string[];
      },
      { previousJobs: MiaJob[] }
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

        const previousJobs = queryClient.getQueryData<MiaJob[]>([
          "jobs",
          projectId,
        ]);

        if (!previousJobs) return;

        const newJobs = previousJobs.filter(
          (job: MiaJob) => !jobIds.includes(job.id),
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
