import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { IEpapersFilter } from './interfaces';
import { EpapersServices } from './services';

export const EpapersHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof EpapersServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), EpapersServices.NAME, id],
      queryFn: () => EpapersServices.findById(id),
      ...rest,
    });
  },

  useFind: ({
    options,
    config,
  }: {
    options: IEpapersFilter;
    config?: QueryConfig<typeof EpapersServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), EpapersServices.NAME, options],
      queryFn: () => EpapersServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: IEpapersFilter;
    config?: InfiniteQueryConfig<typeof EpapersServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), EpapersServices.NAME, options],
      queryFn: ({ pageParam }) => EpapersServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof EpapersServices.create> } = {}) => {
    return useMutation({
      mutationFn: EpapersServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [EpapersServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof EpapersServices.update> } = {}) => {
    return useMutation({
      mutationFn: EpapersServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [EpapersServices.NAME] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof EpapersServices.delete> } = {}) => {
    return useMutation({
      mutationFn: EpapersServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [EpapersServices.NAME] });
      },
      ...config,
    });
  },

  useFindByDateRange: ({
    dateFrom,
    dateTo,
    publicationName,
    config,
  }: {
    dateFrom: string;
    dateTo: string;
    publicationName: string;
    config?: QueryConfig<typeof EpapersServices.findByDateRange>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), EpapersServices.NAME, 'date-range', dateFrom, dateTo, publicationName],
      queryFn: () => EpapersServices.findByDateRange(dateFrom, dateTo, publicationName),
      ...rest,
    });
  },

  useFindDates: ({
    publicationName,
    config,
  }: {
    publicationName: string;
    config?: QueryConfig<typeof EpapersServices.findDates>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), EpapersServices.NAME, 'dates', publicationName],
      queryFn: () => EpapersServices.findDates(publicationName),
      ...rest,
    });
  },

  useFindPagesByDate: ({
    date,
    publicationName,
    config,
  }: {
    date: string;
    publicationName: string;
    config?: QueryConfig<typeof EpapersServices.findPagesByDate>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), EpapersServices.NAME, 'pages', date, publicationName],
      queryFn: () => EpapersServices.findPagesByDate(date, publicationName),
      ...rest,
    });
  },

  useGetPublications: ({ config }: { config?: QueryConfig<typeof EpapersServices.getPublications> } = {}) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), EpapersServices.NAME, 'publications'],
      queryFn: () => EpapersServices.getPublications(),
      ...rest,
    });
  },

  useBulkUpload: ({ config }: { config?: MutationConfig<typeof EpapersServices.bulkUpload> } = {}) => {
    return useMutation({
      mutationFn: EpapersServices.bulkUpload,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [EpapersServices.NAME] });
      },
      ...config,
    });
  },
};
