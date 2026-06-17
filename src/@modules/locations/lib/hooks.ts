import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { ILocationsFilter } from './interfaces';
import { LocationsServices } from './services';

export const LocationsHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof LocationsServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), LocationsServices.NAME, id],
      queryFn: () => LocationsServices.findById(id),
      ...rest,
    });
  },

  useFind: ({
    options,
    config,
  }: {
    options: ILocationsFilter;
    config?: QueryConfig<typeof LocationsServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), LocationsServices.NAME, options],
      queryFn: () => LocationsServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: ILocationsFilter;
    config?: InfiniteQueryConfig<typeof LocationsServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), LocationsServices.NAME, options],
      queryFn: ({ pageParam }) => LocationsServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const total = Number(lastPage.meta.total) || 0;
        const limit = Number(lastPage.meta.limit) || 20;
        
        // Calculate next page based on pages already fetched instead of relying on API's page number
        const currentPage = allPages.length;
        const maxPages = Math.ceil(total / limit);
        
        return currentPage < maxPages ? currentPage + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof LocationsServices.create> } = {}) => {
    return useMutation({
      mutationFn: LocationsServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [LocationsServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof LocationsServices.update> } = {}) => {
    return useMutation({
      mutationFn: LocationsServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [LocationsServices.NAME] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof LocationsServices.delete> } = {}) => {
    return useMutation({
      mutationFn: LocationsServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [LocationsServices.NAME] });
      },
      ...config,
    });
  },
};
