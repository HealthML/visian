import {
  CreateMiaProjectDto,
  MiaProject,
  UpdateMiaProjectDto,
} from "@visian/utils";
import { AxiosError } from "axios";
import { useQuery } from "react-query";

import { projectsApi } from "../hub-base-url";
import { CreateMutation, DeleteMutation, UpdateMutation } from "./mutations";

const projectsQueryKey = "projects";
const projectQueryBaseKey = "project";

export const useProject = (projectId: string) =>
  useQuery<MiaProject, AxiosError<MiaProject>>(
    [projectQueryBaseKey, projectId],
    () =>
      projectsApi
        .projectsControllerFindOne(projectId)
        .then((response) => response.data),
    {
      retry: 2,
      refetchInterval: 1000 * 60,
    },
  );

export const useProjects = () =>
  useQuery<MiaProject[], AxiosError<MiaProject>>(
    [projectsQueryKey],
    () =>
      projectsApi.projectsControllerFindAll().then((response) => response.data),
    {
      retry: 2,
      refetchInterval: 1000 * 60,
    },
  );

export const deleteProjectsMutation = () =>
  DeleteMutation<MiaProject>({
    queryKey: (_selectorId: string) => [projectsQueryKey],
    mutateFn: ({ objectIds }) =>
      projectsApi
        .projectsControllerRemoveAll({ ids: objectIds })
        .then((response) => response.data.map((p) => p.id)),
  });

export const updateProjectMutation = () =>
  UpdateMutation<MiaProject, UpdateMiaProjectDto>({
    queryKey: (_selectorId: string) => [projectsQueryKey],
    mutateFn: ({ object, updateDto }) =>
      projectsApi
        .projectsControllerUpdate(object.id, updateDto)
        .then((response) => response.data),
  });

export const createProjectMutation = () =>
  CreateMutation<MiaProject, CreateMiaProjectDto>({
    queryKey: (_selectorId: string) => [projectsQueryKey],
    mutateFn: ({ createDto }) =>
      projectsApi
        .projectsControllerCreate(createDto)
        .then((response) => response.data),
  });
