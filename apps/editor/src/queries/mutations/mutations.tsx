import { AxiosError } from "axios";
import { useMutation, useQueryClient } from "react-query";

interface MiaTypeGeneric {
  id: string;
}

type DeleteMutationParams = {
  queryKey: (selectorId: string) => string[];
  mutateFn: (mutateParams: {
    objectIds: string[];
    selectorId?: string;
  }) => Promise<string[]>;
};

export function DeleteMutation<T extends MiaTypeGeneric>(
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
    { previousObjects: T[] }
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

      const previousObjects = queryClient.getQueryData<T[]>(queryKey);

      if (!previousObjects) return;

      const newObjects = previousObjects.filter(
        (object: T) => !objectIds.includes(object.id),
      );

      queryClient.setQueryData(queryKey, newObjects);

      return {
        previousObjects,
      };
    },
    onError: (err, { selectorId }, context) => {
      queryClient.setQueryData(
        params.queryKey(selectorId),
        context?.previousObjects,
      );
    },
    onSettled: (data, err, { selectorId }) => {
      queryClient.invalidateQueries({
        queryKey: params.queryKey(selectorId),
      });
    },
  });
}

type UpdateMutationParams<T, S> = {
  queryKey: (selectorId: string) => string[];
  mutateFn: (mutateParams: {
    object: T;
    updateDto: S;
    selectorId?: string;
  }) => Promise<T>;
};

export function UpdateMutation<T extends MiaTypeGeneric, S>(
  params: UpdateMutationParams<T, S>,
) {
  const queryClient = useQueryClient();
  return useMutation<
    T,
    AxiosError,
    {
      object: T;
      updateDto: S;
      selectorId: string;
    },
    { previousObjects: T[] }
  >({
    mutationFn: params.mutateFn,
    onMutate: async ({
      object,
      updateDto,
      selectorId,
    }: {
      object: T;
      updateDto: S;
      selectorId: string;
    }) => {
      const queryKey = params.queryKey(selectorId);
      await queryClient.cancelQueries({ queryKey });

      const previousObjects = queryClient.getQueryData<T[]>(queryKey);

      if (!previousObjects) return;

      const newObjects = Array.isArray(previousObjects)
        ? previousObjects.map((o) =>
            o.id === object.id ? { ...object, ...updateDto } : o,
          )
        : { ...object, ...updateDto };

      queryClient.setQueryData(queryKey, newObjects);

      return {
        previousObjects,
      };
    },
    onError: (err, { selectorId }, context) => {
      queryClient.setQueryData(
        params.queryKey(selectorId),
        context?.previousObjects,
      );
      queryClient.invalidateQueries({
        queryKey: params.queryKey(selectorId),
      });
    },
    onSettled: (data, err, { selectorId }) => {
      queryClient.invalidateQueries({
        queryKey: params.queryKey(selectorId),
      });
    },
  });
}

type CreateMutationParams<T, S> = {
  queryKey: (selectorId: string) => string[];
  mutateFn: (mutateParams: { createDto: S; selectorId?: string }) => Promise<T>;
};

export function CreateMutation<T extends MiaTypeGeneric, S>(
  params: CreateMutationParams<T, S>,
) {
  const queryClient = useQueryClient();
  return useMutation<
    T,
    AxiosError,
    {
      createDto: S;
      selectorId: string;
    },
    { previousObjects: T[] }
  >({
    mutationFn: params.mutateFn,
    onMutate: async ({
      createDto,
      selectorId,
    }: {
      createDto: S;
      selectorId: string;
    }) => {
      const queryKey = params.queryKey(selectorId);
      await queryClient.cancelQueries({ queryKey });

      const previousObjects = queryClient.getQueryData<T[]>(queryKey) ?? [];
      const newObject = { id: "to-be-set", ...createDto };

      queryClient.setQueryData(queryKey, [...previousObjects, newObject]);

      return {
        previousObjects,
      };
    },
    onError: (err, { selectorId }, context) => {
      queryClient.setQueryData(
        params.queryKey(selectorId),
        context?.previousObjects,
      );
    },
    onSettled: (data, err, { selectorId }) => {
      queryClient.invalidateQueries({
        queryKey: params.queryKey(selectorId),
      });
    },
  });
}
