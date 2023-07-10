import { MlModel } from "@visian/ui-shared";
import axios, { AxiosError } from "axios";
import { useQuery } from "react-query";

import { hubBaseUrl } from "./hub-base-url";

const getModelVersions = async () => {
  const modelsResponse = await axios.get<MlModel[]>(
    `${hubBaseUrl}model-versions`,
  );
  return modelsResponse.data;
};

export const useMlModels = () => {
  const { data, error, isError, isLoading, refetch, remove } = useQuery<
    MlModel[],
    AxiosError<MlModel[]>
  >(["mlModels"], getModelVersions, {
    retry: 2, // retry twice if fetch fails
    refetchInterval: 1000 * 60, // refetch every 60 seconds
  });

  return {
    mlModels: data,
    mlModelsError: error,
    isErrorMlModels: isError,
    isLoadingMlModels: isLoading,
    refetchMlModels: refetch,
    removeMlModels: remove,
  };
};

export default useMlModels;
