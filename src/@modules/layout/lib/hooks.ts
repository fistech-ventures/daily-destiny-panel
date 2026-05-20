import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { LayoutServices } from './services';

export const LayoutHooks = {
  useFindById: ({
    endPoint,
    id,
    config,
  }: {
    endPoint: string;
    id: TId;
    config?: QueryConfig<typeof LayoutServices.findById>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), endPoint, id],
      queryFn: () => LayoutServices.findById(endPoint, id),
      ...rest,
    });
  },

  useFind: ({
    endPoint,
    options,
    config,
  }: {
    endPoint: string;
    options: Record<string, any>;
    config?: QueryConfig<typeof LayoutServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), endPoint, options],
      queryFn: () => LayoutServices.find(endPoint, options),
      ...rest,
    });
  },

  useFindInfinite: ({
    endPoint,
    options,
    config,
  }: {
    endPoint: string;
    options: Record<string, any>;
    config?: InfiniteQueryConfig<typeof LayoutServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), endPoint, options],
      queryFn: ({ pageParam }) =>
        LayoutServices.find(endPoint, {
          ...options,
          page: pageParam as number,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },
};
