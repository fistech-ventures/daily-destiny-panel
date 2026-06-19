import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { IPollsFilter } from './interfaces';
import { PollsServices } from './services';

export const PollsHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof PollsServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), PollsServices.NAME, id],
      queryFn: () => PollsServices.findById(id),
      ...rest,
    });
  },

  useFind: ({ options, config }: { options: IPollsFilter; config?: QueryConfig<typeof PollsServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), PollsServices.NAME, options],
      queryFn: () => PollsServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: IPollsFilter;
    config?: InfiniteQueryConfig<typeof PollsServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), PollsServices.NAME, options],
      queryFn: ({ pageParam }) => PollsServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof PollsServices.create> } = {}) => {
    return useMutation({
      mutationFn: PollsServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [PollsServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof PollsServices.update> } = {}) => {
    return useMutation({
      mutationFn: PollsServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [PollsServices.NAME] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof PollsServices.delete> } = {}) => {
    return useMutation({
      mutationFn: PollsServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [PollsServices.NAME] });
      },
      ...config,
    });
  },
};
