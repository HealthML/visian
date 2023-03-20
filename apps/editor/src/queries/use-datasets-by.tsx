import axios, { AxiosError } from "axios";
import { useQuery } from "react-query";

import { Dataset } from "../types";
import { hubBaseUrl } from "./hub-base-url";

const getDatasetsBy = async (projectId: string) => {
  const datasetsResponse = await axios.get<Dataset[]>(`${hubBaseUrl}datasets`, {
    params: {
      project: projectId,
    },
  });
  return datasetsResponse.data;
};

export const useDatasetsBy = (projectId: string) => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    Dataset[],
    AxiosError<Dataset[]>
  >(["datasetsBy", projectId], () => getDatasetsBy(projectId), {
    retry: 2, // retry twice if fetch fails
    refetchInterval: 1000 * 30, // refetch every 30 seconds
  });

  return {
    datasets: data,
    datasetsError: error,
    isErrorDatasets: isError,
    isLoadingDatasets: isLoading,
    refetchDatasets: refetch,
    removeDatasets: remove,
  };
};

export default useDatasetsBy;
