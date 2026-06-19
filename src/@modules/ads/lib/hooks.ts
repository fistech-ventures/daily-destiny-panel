import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { IAdsFilter } from './interfaces';
import { AdsServices } from './services';

export const AdsHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof AdsServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), AdsServices.NAME, id],
      queryFn: () => AdsServices.findById(id),
      ...rest,
    });
  },

  useFind: ({ options, config }: { options: IAdsFilter; config?: QueryConfig<typeof AdsServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), AdsServices.NAME, options],
      queryFn: () => AdsServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: IAdsFilter;
    config?: InfiniteQueryConfig<typeof AdsServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), AdsServices.NAME, options],
      queryFn: ({ pageParam }) => AdsServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof AdsServices.create> } = {}) => {
    return useMutation({
      mutationFn: AdsServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [AdsServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof AdsServices.update> } = {}) => {
    return useMutation({
      mutationFn: AdsServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [AdsServices.NAME] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof AdsServices.delete> } = {}) => {
    return useMutation({
      mutationFn: AdsServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [AdsServices.NAME] });
      },
      ...config,
    });
  },
};
