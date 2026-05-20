import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { ITagsFilter } from './interfaces';
import { TagsServices } from './services';

export const TagsHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof TagsServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), TagsServices.NAME, id],
      queryFn: () => TagsServices.findById(id),
      ...rest,
    });
  },

  useFind: ({
    options,
    config,
  }: {
    options: ITagsFilter;
    config?: QueryConfig<typeof TagsServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), TagsServices.NAME, options],
      queryFn: () => TagsServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: ITagsFilter;
    config?: InfiniteQueryConfig<typeof TagsServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), TagsServices.NAME, options],
      queryFn: ({ pageParam }) => TagsServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof TagsServices.create> } = {}) => {
    return useMutation({
      mutationFn: TagsServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [TagsServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof TagsServices.update> } = {}) => {
    return useMutation({
      mutationFn: TagsServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [TagsServices.NAME] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof TagsServices.delete> } = {}) => {
    return useMutation({
      mutationFn: TagsServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [TagsServices.NAME] });
      },
      ...config,
    });
  },
};
