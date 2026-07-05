import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { ISpecialEventsFilter } from './interfaces';
import { SpecialEventsServices } from './services';

export const SpecialEventsHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof SpecialEventsServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), SpecialEventsServices.NAME, id],
      queryFn: () => SpecialEventsServices.findById(id),
      ...rest,
    });
  },

  useFind: ({
    options,
    config,
  }: {
    options: ISpecialEventsFilter;
    config?: QueryConfig<typeof SpecialEventsServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), SpecialEventsServices.NAME, options],
      queryFn: () => SpecialEventsServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: ISpecialEventsFilter;
    config?: InfiniteQueryConfig<typeof SpecialEventsServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), SpecialEventsServices.NAME, options],
      queryFn: ({ pageParam }) => SpecialEventsServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof SpecialEventsServices.create> } = {}) => {
    return useMutation({
      mutationFn: SpecialEventsServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [SpecialEventsServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof SpecialEventsServices.update> } = {}) => {
    return useMutation({
      mutationFn: SpecialEventsServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [SpecialEventsServices.NAME] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof SpecialEventsServices.delete> } = {}) => {
    return useMutation({
      mutationFn: SpecialEventsServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [SpecialEventsServices.NAME] });
      },
      ...config,
    });
  },
};
