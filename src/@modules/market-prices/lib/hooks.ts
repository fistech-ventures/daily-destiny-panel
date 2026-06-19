import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { IMarketPricesFilter } from './interfaces';
import { MarketPricesServices } from './services';

export const MarketPricesHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof MarketPricesServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), MarketPricesServices.NAME, id],
      queryFn: () => MarketPricesServices.findById(id),
      ...rest,
    });
  },

  useFind: ({
    options,
    config,
  }: {
    options: IMarketPricesFilter;
    config?: QueryConfig<typeof MarketPricesServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), MarketPricesServices.NAME, options],
      queryFn: () => MarketPricesServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: IMarketPricesFilter;
    config?: InfiniteQueryConfig<typeof MarketPricesServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), MarketPricesServices.NAME, options],
      queryFn: ({ pageParam }) => MarketPricesServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof MarketPricesServices.create> } = {}) => {
    return useMutation({
      mutationFn: MarketPricesServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [MarketPricesServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof MarketPricesServices.update> } = {}) => {
    return useMutation({
      mutationFn: MarketPricesServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [MarketPricesServices.NAME] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof MarketPricesServices.delete> } = {}) => {
    return useMutation({
      mutationFn: MarketPricesServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [MarketPricesServices.NAME] });
      },
      ...config,
    });
  },
};
