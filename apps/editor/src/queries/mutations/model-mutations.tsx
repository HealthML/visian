import { ModelVersion } from "@visian/mia-api";
import { AxiosError } from "axios";
import { useQuery } from "react-query";

import { modelVersionsApi } from "../hub-base-url";


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
