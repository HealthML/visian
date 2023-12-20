import { MiaJob, MiaProgress } from "@visian/utils";
import { AxiosError } from "axios";
import { UpdateJobDtoStatusEnum } from "mia-typescript-sdk";
import { useQuery } from "react-query";

import { jobsApi } from "../mia-api-client";
import { DeleteMutation, UpdateMutation } from "./mutations";

const jobQueryKey = "job";
const jobsByProjectQueryBaseKey = "jobsByProject";

export const useJob = (jobId: string) =>
  useQuery<MiaJob, AxiosError<MiaJob>>(
    [jobQueryKey],
    async () => jobsApi.findJob({ id: jobId }),
    {
      retry: 2,
      refetchInterval: 1000 * 10,
    },
  );

export const useJobsByProject = (projectId: string) =>
  useQuery<MiaJob[], AxiosError<MiaJob[]>>(
    [jobsByProjectQueryBaseKey, projectId],
    async () => jobsApi.findAllJobs({ project: projectId }),
    {
      retry: 2,
      refetchInterval: 1000 * 10,
    },
  );

export const useJobProgress = (jobId: string) =>
  useQuery<MiaProgress, AxiosError<MiaProgress>>(
    ["job-progress", jobId],
    async () => jobsApi.retrieveJobProgress({ id: jobId }),
    {
      retry: 2,
      refetchInterval: 1000 * 2,
    },
  );

export const deleteJobsMutation = () =>
  DeleteMutation<MiaJob>({
    queryKey: (selectorId: string) => [jobsByProjectQueryBaseKey, selectorId],
    mutateFn: async ({ objectIds }) => {
      const deletedJobs = await jobsApi.deleteJobs({
        deleteAllDto: { ids: objectIds },
      });
      return deletedJobs.map((job) => job.id);
    },
  });

export const updateJobMutation = () =>
  UpdateMutation<MiaJob, { status: UpdateJobDtoStatusEnum }>({
    queryKey: (selectorId: string) => [jobQueryKey],
    mutateFn: async ({ object, updateDto }) =>
      jobsApi.updateJob({
        id: object.id,
        updateJobDto: updateDto,
      }),
  });
