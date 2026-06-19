import { IBaseFilter, TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { RolesServices } from './services';

export const RolesHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof RolesServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), RolesServices.NAME, id],
      queryFn: () => RolesServices.findById(id),
      ...rest,
    });
  },

  useFind: ({ options, config }: { options: IBaseFilter; config?: QueryConfig<typeof RolesServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), RolesServices.NAME, options],
      queryFn: () => RolesServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: IBaseFilter;
    config?: InfiniteQueryConfig<typeof RolesServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), RolesServices.NAME, options],
      queryFn: ({ pageParam }) => RolesServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useFindSpecifics: ({ config }: { config?: MutationConfig<typeof RolesServices.findSpecifics> } = {}) => {
    return useMutation({
      mutationFn: RolesServices.findSpecifics,
      onSettled: (data) => {
        if (!data?.success) return;
      },
      ...config,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof RolesServices.create> } = {}) => {
    return useMutation({
      mutationFn: RolesServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [RolesServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof RolesServices.update> } = {}) => {
    return useMutation({
      mutationFn: RolesServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [RolesServices.NAME] });
      },
      ...config,
    });
  },

  useFindAvailablePermissionsById: ({
    id,
    config,
  }: {
    id: TId;
    config?: QueryConfig<typeof RolesServices.findAvailablePermissionsById>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), RolesServices.NAME, id, 'ap'],
      queryFn: () => RolesServices.findAvailablePermissionsById(id),
      ...rest,
    });
  },

  useAddPermissionsById: ({ config }: { config?: MutationConfig<typeof RolesServices.addPermissionsById> } = {}) => {
    return useMutation({
      mutationFn: RolesServices.addPermissionsById,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [RolesServices.NAME] });
      },
      ...config,
    });
  },

  useRemovePermissionsById: ({
    config,
  }: { config?: MutationConfig<typeof RolesServices.removePermissionsById> } = {}) => {
    return useMutation({
      mutationFn: RolesServices.removePermissionsById,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [RolesServices.NAME] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof RolesServices.delete> } = {}) => {
    return useMutation({
      mutationFn: RolesServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [RolesServices.NAME] });
      },
      ...config,
    });
  },
};
