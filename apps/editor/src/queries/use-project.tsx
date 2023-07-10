import { MiaProject } from "@visian/ui-shared";
import axios, { AxiosError } from "axios";
import { useQuery } from "react-query";

import { hubBaseUrl } from "./hub-base-url";

const getProject = async (projectId: string) => {
  const projectResponse = await axios.get<MiaProject>(
    `${hubBaseUrl}projects/${projectId}`,
  );
  return projectResponse.data;
};

export const useProject = (projectId: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    MiaProject,
    AxiosError<MiaProject>
  >(["project", projectId], () => getProject(projectId), {
    retry: 2, // retry twice if fetch fails
    refetchInterval: 1000 * 60, // refetch every minute
  });

  return {
    project: data,
    projectError: error,
    isErrorProject: isError,
    isLoadingProject: isLoading,
    refetchProject: refetch,
    removeProject: remove,
  };
};

export default useProject;
