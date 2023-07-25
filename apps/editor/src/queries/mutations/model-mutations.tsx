import { MiaModelVersion } from "@visian/utils";
import { AxiosError } from "axios";
import { useQuery } from "react-query";

import { modelVersionsApi } from "../mia-api-client";

const modelVersionsQueryKey = "modelVersions";

export const useMlModels = () =>
  useQuery<MiaModelVersion[], AxiosError<MiaModelVersion[]>>(
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
