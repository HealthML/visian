import { CreateProjectDto, UpdateProjectDto } from "@visian/mia-api";
import { MiaProject } from "@visian/utils";
import { AxiosError } from "axios";
import { useQuery } from "react-query";

import { projectsApi } from "../mia-api-client";
import { CreateMutation, DeleteMutation, UpdateMutation } from "./mutations";

const projectsQueryKey = "projects";
const projectQueryBaseKey = "project";

export const useProject = (projectId: string) =>
  useQuery<MiaProject, AxiosError<MiaProject>>(
    [projectQueryBaseKey, projectId],
    async () => {
      const response = await projectsApi.projectsControllerFindOne(projectId);
      return response.data;
    },
    {
      retry: 2,
      refetchInterval: 1000 * 10,
    },
  );

export const useProjects = () =>
  useQuery<MiaProject[], AxiosError<MiaProject>>(
    [projectsQueryKey],
    async () => {
      const response = await projectsApi.projectsControllerFindAll();
      return response.data;
    },
    {
      retry: 2,
      refetchInterval: 1000 * 10,
    },
  );

export const deleteProjectsMutation = () =>
  DeleteMutation<MiaProject>({
    queryKey: (_selectorId: string) => [projectsQueryKey],
    mutateFn: async ({ objectIds }) => {
      const response = await projectsApi.projectsControllerRemoveAll({
        ids: objectIds,
      });
      return response.data.map((project) => project.id);
    },
  });

export const updateProjectMutation = () =>
  UpdateMutation<MiaProject, UpdateProjectDto>({
    queryKey: (_selectorId: string) => [projectsQueryKey],
    mutateFn: async ({ object, updateDto }) => {
      const response = await projectsApi.projectsControllerUpdate(
        object.id,
        updateDto,
      );
      return response.data;
    },
  });

export const createProjectMutation = () =>
  CreateMutation<MiaProject, CreateProjectDto>({
    queryKey: (_selectorId: string) => [projectsQueryKey],
    mutateFn: async ({ createDto }) => {
      const response = await projectsApi.projectsControllerCreate(createDto);
      return response.data;
    },
  });
