import { UpdateJobDtoStatusEnum } from "@visian/mia-api";
import { MiaJob, MiaProgress } from "@visian/utils";
import { AxiosError } from "axios";
import { useQuery } from "react-query";

import { jobsApi } from "../mia-api-client";
import { DeleteMutation, UpdateMutation } from "./mutations";

const jobQueryKey = "job";
const jobsByProjectQueryBaseKey = "jobsByProject";

export const useJob = (jobId: string) =>
  useQuery<MiaJob, AxiosError<MiaJob>>(
    [jobQueryKey],
    async () => {
      const response = await jobsApi.jobsControllerFindOne(jobId);
      return response.data;
    },
    {
      retry: 2,
      refetchInterval: 1000 * 10,
    },
  );

export const useJobsByProject = (projectId: string) =>
  useQuery<MiaJob[], AxiosError<MiaJob[]>>(
    [jobsByProjectQueryBaseKey, projectId],
    async () => {
      const response = await jobsApi.jobsControllerFindAll(projectId);
      return response.data;
    },
    {
      retry: 2,
      refetchInterval: 1000 * 10,
    },
  );

export const useJobProgress = (jobId: string) =>
  useQuery<MiaProgress, AxiosError<MiaProgress>>(
    ["job-progress", jobId],
    async () => {
      const response = await jobsApi.jobsControllerProgress(jobId);
      return response.data;
    },
    {
      retry: 2,
      refetchInterval: 1000 * 2,
    },
  );

export const deleteJobsMutation = () =>
  DeleteMutation<MiaJob>({
    queryKey: (selectorId: string) => [jobsByProjectQueryBaseKey, selectorId],
    mutateFn: async ({ objectIds }) => {
      const response = await jobsApi.jobsControllerRemoveAll({
        ids: objectIds,
      });
      return response.data.map((job) => job.id);
    },
  });

export const updateJobMutation = () =>
  UpdateMutation<MiaJob, { status: UpdateJobDtoStatusEnum }>({
    queryKey: (selectorId: string) => [jobQueryKey],
    mutateFn: async ({ object, updateDto }) => {
      const response = await jobsApi.jobsControllerUpdate(object.id, updateDto);
      return response.data;
    },
  });
