import axios, { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { Project } from "../types";
import { hubBaseUrl } from "./hub-base-url";

const getProjects = async () => {
  const projectsResponse = await axios.get<Project[]>(`${hubBaseUrl}projects`);
  return projectsResponse.data;
};

const postProject = async ({ name }: { name: string }) => {
  const postProjectResponse = await axios.post<Project>(
    `${hubBaseUrl}projects`,
    { name },
  );
  return postProjectResponse.data;
};

export const useProjects = () => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    Project[],
    AxiosError<Project>
  >(["project"], () => getProjects(), {
    retry: 2, // retry twice if fetch fails
    refetchInterval: 1000 * 60, // refetch every minute
  });

  return {
    projects: data,
    projectsError: error,
    isErrorProjects: isError,
    isLoadingProjects: isLoading,
    refetchProjects: refetch,
    removeProjects: remove,
  };
};

const deleteProjects = async ({ projectIds }: { projectIds: string[] }) => {
  const deleteProjectsResponse = await axios.delete<Project[]>(
    `${hubBaseUrl}projects`,
    {
      data: { ids: projectIds },
      timeout: 1000 * 6, // 2 secods
    },
  );
  return deleteProjectsResponse.data.map((p) => p.id);
};

export const useDeleteProjectsMutation = () => {
  const queryClient = useQueryClient();
  const { isError, isIdle, isLoading, isPaused, isSuccess, mutate } =
    useMutation<
      string[],
      AxiosError<Project[]>,
      {
        projectIds: string[];
      },
      { previousProjects: Project[] }
    >({
      mutationFn: deleteProjects,
      onMutate: async ({ projectIds }: { projectIds: string[] }) => {
        await queryClient.cancelQueries({
          queryKey: ["project"],
        });

        const previousProjects = queryClient.getQueryData<Project[]>([
          "project",
        ]);

        if (!previousProjects) return;

        const newProjects = previousProjects.filter(
          (project: Project) => !projectIds.includes(project.id),
        );

        queryClient.setQueryData(["project"], newProjects);

        return {
          previousProjects,
        };
      },
      onError: (err, { projectIds }, context) => {
        queryClient.setQueryData(["project"], context?.previousProjects);
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["project"],
        });
      },
    });
  return {
    isDeleteProjectsError: isError,
    isDeleteProjectsIdle: isIdle,
    isDeleteProjectsLoading: isLoading,
    isDeleteProjectsPaused: isPaused,
    isDeleteProjectsSuccess: isSuccess,
    deleteProjects: mutate,
  };
};

export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient();
  const { isError, isIdle, isLoading, isPaused, isSuccess, mutate } =
    useMutation<
      Project,
      AxiosError,
      { name: string },
      { previousProjects: Project[] }
    >({
      mutationFn: postProject,
      onMutate: async ({ name }: { name: string }) => {
        await queryClient.cancelQueries({
          queryKey: ["project"],
        });

        const previousProjects =
          queryClient.getQueryData<Project[]>(["project"]) ?? [];

        const newProject = {
          id: "new-project",
          name,
        };

        queryClient.setQueryData(
          ["project"],
          [...previousProjects, newProject],
        );

        return {
          previousProjects,
        };
      },
      onError: (err, { name }, context) => {
        queryClient.setQueryData(["project"], context?.previousProjects);
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["project"],
        });
      },
    });
  return {
    isCreateProjectError: isError,
    isCreateProjectIdle: isIdle,
    isCreateProjectLoading: isLoading,
    isCreateProjectPaused: isPaused,
    isCreateProjectSuccess: isSuccess,
    createProject: mutate,
  };
};

const putProject = async (project: Project) => {
  const putProjectResponse = await axios.put<Project>(
    `${hubBaseUrl}projects/${project.id}`,
    {
      name: project.name,
    },
    {
      timeout: 1000 * 3.14, // pi seconds
    },
  );
  return putProjectResponse.data;
};

export const useUpdateProjectsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Project,
    AxiosError,
    Project,
    { previousProjects: Project[] }
  >({
    mutationFn: putProject,
    onMutate: async (project: Project) => {
      await queryClient.cancelQueries({
        queryKey: ["project"],
      });

      const previousProjects = queryClient.getQueryData<Project[]>(["project"]);

      if (!previousProjects) return;

      const newProjects = previousProjects.map((p) =>
        p.id === project.id ? project : p,
      );

      queryClient.setQueryData(["projects"], newProjects);

      return {
        previousProjects,
      };
    },
    onError: (err, project, context) => {
      queryClient.setQueryData(["project"], context?.previousProjects);
    },
    onSettled: (data, err, project) => {
      queryClient.invalidateQueries({
        queryKey: ["project"],
      });
    },
  });
};

export default useProjects;
