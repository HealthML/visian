import { useQuery } from "react-query";
import { ModelVersion } from "mia-api-client";
import { modelVersionsApi } from "../hub-base-url";
import { AxiosError } from "axios";

const modelVersionsQueryKey = "modelVersions";

export const useMlModels = () =>
  useQuery<ModelVersion[], AxiosError<ModelVersion[]>>(
    [modelVersionsQueryKey],
    () =>
      modelVersionsApi
        .modelsControllerFindAll()
        .then((response) => response.data),
    {
      retry: 2,
      refetchInterval: 1000 * 60,
    },
  );
