import {
  CreateProjectDto,
  UpdateProjectDto,
} from "@mia-hpi/mia-typescript-sdk";
import { MiaProject } from "@visian/utils";
import { AxiosError } from "axios";
import { useQuery } from "react-query";

import { CreateMutation, DeleteMutation, UpdateMutation } from "./mutations";
import { projectsApi } from "../mia-api-client";

const projectsQueryKey = "projects";
const projectQueryBaseKey = "project";

export const useProject = (projectId: string) =>
  useQuery<MiaProject, AxiosError<MiaProject>>(
    [projectQueryBaseKey, projectId],
    async () => projectsApi.findProject({ id: projectId }),
    {
      retry: 2,
      refetchInterval: 1000 * 10,
    },
  );

export const useProjects = () =>
  useQuery<MiaProject[], AxiosError<MiaProject>>(
    [projectsQueryKey],
    async () => projectsApi.findAllProjects(),
    {
      retry: 2,
      refetchInterval: 1000 * 10,
    },
  );

export const deleteProjectsMutation = () =>
  DeleteMutation<MiaProject>({
    queryKey: (_selectorId: string) => [projectsQueryKey],
    mutateFn: async ({ objectIds }) => {
      const deletedProjects = await projectsApi.deleteProjects({
        deleteAllDto: { ids: objectIds },
      });
      return deletedProjects.map((project) => project.id);
    },
  });

export const updateProjectMutation = () =>
  UpdateMutation<MiaProject, UpdateProjectDto>({
    queryKey: (_selectorId: string) => [projectsQueryKey],
    mutateFn: async ({ object, updateDto }) =>
      projectsApi.updateProject({
        id: object.id,
        updateProjectDto: updateDto,
      }),
  });

export const createProjectMutation = () =>
  CreateMutation<MiaProject, CreateProjectDto>({
    queryKey: (_selectorId: string) => [projectsQueryKey],
    mutateFn: async ({ createDto }) =>
      projectsApi.createProject({ createProjectDto: createDto }),
  });
