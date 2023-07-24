import {
  MiaJob,
  JobsControllerUpdateStatusEnum,
  MiaProgress,
} from "@visian/mia-api";
import { AxiosError } from "axios";
import { useQuery } from "react-query";

import { jobsApi } from "../hub-base-url";
import { DeleteMutation, UpdateMutation } from "./mutations";

const jobQueryKey = "job";
const jobsByProjectQueryBaseKey = "jobsByProject";

export const useJob = (jobId: string) =>
  useQuery<MiaJob, AxiosError<MiaJob>>(
    [jobQueryKey],
    () =>
      jobsApi.jobsControllerFindOne(jobId).then((response) => response.data),
    {
      retry: 2,
      refetchInterval: 1000 * 20,
    },
  );

export const useJobsByProject = (projectId: string) =>
  useQuery<MiaJob[], AxiosError<MiaJob[]>>(
    [jobsByProjectQueryBaseKey, projectId],
    () =>
      jobsApi
        .jobsControllerFindAll(projectId)
        .then((response) => response.data),
    {
      retry: 2,
      refetchInterval: 1000 * 20,
    },
  );

export const useJobProgress = (jobId: string) =>
  useQuery<MiaProgress, AxiosError<MiaProgress>>(
    ["job-progress", jobId],
    () =>
      jobsApi.jobsControllerProgress(jobId).then((response) => response.data),
    {
      retry: 2,
      refetchInterval: 1000 * 5,
    },
  );

export const deleteJobsMutation = () =>
  DeleteMutation<MiaJob>({
    queryKey: (selectorId: string) => [jobsByProjectQueryBaseKey, selectorId],
    mutateFn: ({ objectIds }) =>
      jobsApi
        .jobsControllerRemoveAll({ ids: objectIds })
        .then((response) => response.data.map((j) => j.id)),
  });

export const updateJobMutation = () =>
  UpdateMutation<MiaJob, { status: JobsControllerUpdateStatusEnum }>({
    queryKey: (selectorId: string) => [jobQueryKey],
    mutateFn: ({ object, updateDto }) =>
      jobsApi
        // TODO: fix required types in API docs

        .jobsControllerUpdate(object.id, updateDto.status || object.status)
        .then((response) => response.data),
  });
