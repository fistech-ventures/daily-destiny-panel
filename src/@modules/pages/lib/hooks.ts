import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { IPagesFilter } from './interfaces';
import { PagesServices } from './services';

export const PagesHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof PagesServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), PagesServices.NAME, id],
      queryFn: () => PagesServices.findById(id),
      ...rest,
    });
  },

  useFindBySlug: ({ slug, config }: { slug: string; config?: QueryConfig<typeof PagesServices.findBySlug> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), PagesServices.NAME, slug],
      queryFn: () => PagesServices.findBySlug(slug),
      ...rest,
    });
  },

  useFind: ({ options, config }: { options: IPagesFilter; config?: QueryConfig<typeof PagesServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), PagesServices.NAME, options],
      queryFn: () => PagesServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: IPagesFilter;
    config?: InfiniteQueryConfig<typeof PagesServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), PagesServices.NAME, options],
      queryFn: ({ pageParam }) => PagesServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useUpsert: ({ config }: { config?: MutationConfig<typeof PagesServices.upsert> } = {}) => {
    return useMutation({
      mutationFn: PagesServices.upsert,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [PagesServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof PagesServices.update> } = {}) => {
    return useMutation({
      mutationFn: PagesServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [PagesServices.NAME] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof PagesServices.delete> } = {}) => {
    return useMutation({
      mutationFn: PagesServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [PagesServices.NAME] });
      },
      ...config,
    });
  },
};
