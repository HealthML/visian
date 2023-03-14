import axios, { AxiosError } from "axios";
import { useQuery } from "react-query";

import { Project } from "../types";
import { hubBaseUrl } from "./hub-base-url";

const getProjects = async () => {
  const projectsResponse = await axios.get<Project[]>(`${hubBaseUrl}projects`);
  return projectsResponse.data;
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

export default useProjects;
