import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { IMenusFilter } from './interfaces';
import { MenusServices } from './services';

export const MenusHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof MenusServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), MenusServices.NAME, id],
      queryFn: () => MenusServices.findById(id),
      ...rest,
    });
  },

  useFind: ({ options, config }: { options: IMenusFilter; config?: QueryConfig<typeof MenusServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), MenusServices.NAME, options],
      queryFn: () => MenusServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: IMenusFilter;
    config?: InfiniteQueryConfig<typeof MenusServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), MenusServices.NAME, options],
      queryFn: ({ pageParam }) => MenusServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof MenusServices.create> } = {}) => {
    return useMutation({
      mutationFn: MenusServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [MenusServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof MenusServices.update> } = {}) => {
    return useMutation({
      mutationFn: MenusServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [MenusServices.NAME] });
      },
      ...config,
    });
  },
};
