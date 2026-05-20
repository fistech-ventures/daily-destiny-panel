import { MutationConfig, QueryConfig, queryClient } from '@lib/config';
import { useMutation, useQuery } from '@tanstack/react-query';
import { IBaseServices, TId } from './interfaces';

export const UseBaseHooks = <Entity, FilterOptions, CreatePayload, UpdatePayload = CreatePayload>(
  service: IBaseServices<Entity, FilterOptions, CreatePayload, UpdatePayload>,
) => {
  const useFindById = ({ id, config }: { id: TId; config?: QueryConfig<typeof service.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), service, service.END_POINT, id],
      queryFn: () => service.findById(id),
      ...rest,
    });
  };

  const useFind = ({ options, config }: { options: FilterOptions; config?: QueryConfig<typeof service.find> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), service, service.END_POINT, options],
      queryFn: () => service.find(options),
      ...rest,
    });
  };

  const useCreate = ({ config }: { config?: MutationConfig<typeof service.create> } = {}) => {
    return useMutation({
      mutationFn: service.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [service.END_POINT] });
      },
      ...config,
    });
  };

  const useUpdate = ({ config }: { config?: MutationConfig<typeof service.update> } = {}) => {
    return useMutation({
      mutationFn: service.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [service.END_POINT] });
      },
      ...config,
    });
  };

  const useDelete = ({ config }: { config?: MutationConfig<typeof service.delete> } = {}) => {
    return useMutation({
      mutationFn: service.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [service.END_POINT] });
      },
      ...config,
    });
  };

  return { useFindById, useFind, useCreate, useUpdate, useDelete };
};
