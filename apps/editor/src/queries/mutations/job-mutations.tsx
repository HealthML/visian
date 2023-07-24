import axios, { AxiosError } from "axios";
import { Job, UpdateJobDto, Progress } from "@visian/mia-api";
import { useQuery } from "react-query";
import { jobsApi } from "../hub-base-url";
import { DeleteMutation, UpdateMutation } from "./mutations";

const jobQueryKey = "job";
const jobsQueryKey = "jobs";
const jobsByProjectQueryBaseKey = "jobsByProject";

export const useJob = (jobId: string) =>
  useQuery<Job, AxiosError<Job>>(
    [jobQueryKey],
    () =>
      jobsApi.jobsControllerFindOne(jobId).then((response) => response.data),
    {
      retry: 2,
      refetchInterval: 1000 * 20,
    },
  );

export const useJobs = () =>
  useQuery<Job[], AxiosError<Job[]>>(
    [jobsQueryKey],
    () => jobsApi.jobsControllerFindAll().then((response) => response.data),
    {
      retry: 2,
      refetchInterval: 1000 * 20,
    },
  );

export const useJobsByProject = (projectId: string) =>
  useQuery<Job[], AxiosError<Job[]>>(
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
  useQuery<Progress, AxiosError<Progress>>(
    ["job-progress", jobId],
    () =>
      jobsApi.jobsControllerProgress(jobId).then((response) => response.data),
    {
      retry: 2,
      refetchInterval: 1000 * 5,
    },
  );

export const deleteJobsMutation = () =>
  DeleteMutation<Job>({
    queryKey: (selectorId: string) => [jobsByProjectQueryBaseKey, selectorId],
    mutateFn: ({ objectIds }) =>
      jobsApi
        .jobsControllerRemoveAll({ ids: objectIds })
        .then((response) => response.data.map((j) => j.id)),
  });

export const updateJobMutation = () =>
  UpdateMutation<Job, UpdateJobDto>({
    queryKey: (selectorId: string) => [jobsByProjectQueryBaseKey, selectorId],
    mutateFn: ({ object, updateDto }) =>
      jobsApi
        // TODO: fix required types in API docs

        .jobsControllerUpdateForm(
          updateDto.status || object.status,
          new File([], "empty"),
          object.id,
        )
        .then((response) => response.data),
  });
