import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { ISubCategoriesFilter } from './interfaces';
import { SubCategoriesServices } from './services';

export const SubCategoriesHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof SubCategoriesServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), SubCategoriesServices.NAME, id],
      queryFn: () => SubCategoriesServices.findById(id),
      ...rest,
    });
  },

  useFind: ({
    options,
    config,
  }: {
    options: ISubCategoriesFilter;
    config?: QueryConfig<typeof SubCategoriesServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), SubCategoriesServices.NAME, options],
      queryFn: () => SubCategoriesServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: ISubCategoriesFilter;
    config?: InfiniteQueryConfig<typeof SubCategoriesServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), SubCategoriesServices.NAME, options],
      queryFn: ({ pageParam }) => SubCategoriesServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof SubCategoriesServices.create> } = {}) => {
    return useMutation({
      mutationFn: SubCategoriesServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [SubCategoriesServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof SubCategoriesServices.update> } = {}) => {
    return useMutation({
      mutationFn: SubCategoriesServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [SubCategoriesServices.NAME] });
      },
      ...config,
    });
  },
};
