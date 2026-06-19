import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { IStartupsFilter } from './interfaces';
import { StartupsServices } from './services';

export const StartupsHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof StartupsServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), StartupsServices.NAME, id],
      queryFn: () => StartupsServices.findById(id),
      ...rest,
    });
  },

  useFind: ({ options, config }: { options: IStartupsFilter; config?: QueryConfig<typeof StartupsServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), StartupsServices.NAME, options],
      queryFn: () => StartupsServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: IStartupsFilter;
    config?: InfiniteQueryConfig<typeof StartupsServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), StartupsServices.NAME, options],
      queryFn: ({ pageParam }) => StartupsServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof StartupsServices.create> } = {}) => {
    return useMutation({
      mutationFn: StartupsServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [StartupsServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof StartupsServices.update> } = {}) => {
    return useMutation({
      mutationFn: StartupsServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [StartupsServices.NAME] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof StartupsServices.delete> } = {}) => {
    return useMutation({
      mutationFn: StartupsServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [StartupsServices.NAME] });
      },
      ...config,
    });
  },
};
