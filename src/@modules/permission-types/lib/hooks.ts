import { IBaseFilter, TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { PermissionTypesServices } from './services';

export const PermissionTypesHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof PermissionTypesServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), PermissionTypesServices.NAME, id],
      queryFn: () => PermissionTypesServices.findById(id),
      ...rest,
    });
  },

  useFind: ({
    options,
    config,
  }: {
    options: IBaseFilter;
    config?: QueryConfig<typeof PermissionTypesServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), PermissionTypesServices.NAME, options],
      queryFn: () => PermissionTypesServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: IBaseFilter;
    config?: InfiniteQueryConfig<typeof PermissionTypesServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), PermissionTypesServices.NAME, options],
      queryFn: ({ pageParam }) => PermissionTypesServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof PermissionTypesServices.create> } = {}) => {
    return useMutation({
      mutationFn: PermissionTypesServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [PermissionTypesServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof PermissionTypesServices.update> } = {}) => {
    return useMutation({
      mutationFn: PermissionTypesServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [PermissionTypesServices.NAME] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof PermissionTypesServices.delete> } = {}) => {
    return useMutation({
      mutationFn: PermissionTypesServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [PermissionTypesServices.NAME] });
      },
      ...config,
    });
  },
};
