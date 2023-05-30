import axios, { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { Dataset } from "../types";
import { hubBaseUrl } from "./hub-base-url";

type DeleteMutationParams = {
  queryKey: (selectorId: string) => string[];
  mutateFn: (mutateParams: {
    objectIds: string[];
    selectorId: string;
  }) => Promise<string[]>;
};

interface HubObject {
  id: string;
}

export function DeleteMutation<T extends HubObject>(
  params: DeleteMutationParams,
) {
  const queryClient = useQueryClient();
  return useMutation<
    string[],
    AxiosError<T[]>,
    {
      objectIds: string[];
      selectorId: string;
    },
    { previousDatasets: T[] }
  >({
    mutationFn: params.mutateFn,
    onMutate: async ({
      objectIds,
      selectorId,
    }: {
      selectorId: string;
      objectIds: string[];
    }) => {
      await queryClient.cancelQueries({
        queryKey: params.queryKey(selectorId),
      });

      const previousDatasets = queryClient.getQueryData<T[]>(
        params.queryKey(selectorId),
      );

      if (!previousDatasets) return;

      const newDatasets = previousDatasets.filter(
        (object: T) => !objectIds.includes(object.id),
      );

      queryClient.setQueryData(params.queryKey(selectorId), newDatasets);

      return {
        previousDatasets,
      };
    },
    onError: (err, { selectorId, objectIds }, context) => {
      queryClient.setQueryData(
        params.queryKey(selectorId),
        context?.previousDatasets,
      );
    },
    onSettled: (data, err, { selectorId, objectIds }) => {
      queryClient.invalidateQueries({
        queryKey: params.queryKey(selectorId),
      });
    },
  });
}
