import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { IEntrepreneursFilter } from './interfaces';
import { EntrepreneursServices } from './services';

export const EntrepreneursHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof EntrepreneursServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), EntrepreneursServices.NAME, id],
      queryFn: () => EntrepreneursServices.findById(id),
      ...rest,
    });
  },

  useFind: ({
    options,
    config,
  }: {
    options: IEntrepreneursFilter;
    config?: QueryConfig<typeof EntrepreneursServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), EntrepreneursServices.NAME, options],
      queryFn: () => EntrepreneursServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: IEntrepreneursFilter;
    config?: InfiniteQueryConfig<typeof EntrepreneursServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), EntrepreneursServices.NAME, options],
      queryFn: ({ pageParam }) => EntrepreneursServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof EntrepreneursServices.create> } = {}) => {
    return useMutation({
      mutationFn: EntrepreneursServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [EntrepreneursServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof EntrepreneursServices.update> } = {}) => {
    return useMutation({
      mutationFn: EntrepreneursServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [EntrepreneursServices.NAME] });
      },
      ...config,
    });
  },
};
