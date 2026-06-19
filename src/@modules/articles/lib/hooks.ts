import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { IArticlesFilter } from './interfaces';
import { ArticlesServices } from './services';

export const ArticlesHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof ArticlesServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), ArticlesServices.NAME, id],
      queryFn: () => ArticlesServices.findById(id),
      ...rest,
    });
  },

  useFind: ({ options, config }: { options: IArticlesFilter; config?: QueryConfig<typeof ArticlesServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), ArticlesServices.NAME, options],
      queryFn: () => ArticlesServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: IArticlesFilter;
    config?: InfiniteQueryConfig<typeof ArticlesServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), ArticlesServices.NAME, options],
      queryFn: ({ pageParam }) => ArticlesServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof ArticlesServices.create> } = {}) => {
    return useMutation({
      mutationFn: ArticlesServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [ArticlesServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof ArticlesServices.update> } = {}) => {
    return useMutation({
      mutationFn: ArticlesServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [ArticlesServices.NAME] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof ArticlesServices.delete> } = {}) => {
    return useMutation({
      mutationFn: ArticlesServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [ArticlesServices.NAME] });
      },
      ...config,
    });
  },
};
