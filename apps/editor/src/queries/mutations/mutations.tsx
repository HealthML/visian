import { AxiosError } from "axios";
import { useMutation, useQueryClient } from "react-query";

type DeleteMutationParams = {
  queryKey: (selectorId: string) => string[];
  mutateFn: (mutateParams: {
    objectIds: string[];
    selectorId?: string;
  }) => Promise<string[]>;
};

interface MiaObject {
  id: string;
}

export function DeleteMutation<T extends MiaObject>(
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
      objectIds: string[];
      selectorId: string;
    }) => {
      const queryKey = params.queryKey(selectorId);
      await queryClient.cancelQueries({ queryKey });

      const previousDatasets = queryClient.getQueryData<T[]>(queryKey);

      if (!previousDatasets) return;

      const newDatasets = previousDatasets.filter(
        (object: T) => !objectIds.includes(object.id),
      );

      queryClient.setQueryData(queryKey, newDatasets);

      return {
        previousDatasets,
      };
    },
    onError: (err, { selectorId }, context) => {
      queryClient.setQueryData(
        params.queryKey(selectorId),
        context?.previousDatasets,
      );
    },
    onSettled: (data, err, { selectorId }) => {
      queryClient.invalidateQueries({
        queryKey: params.queryKey(selectorId),
      });
    },
  });
}
