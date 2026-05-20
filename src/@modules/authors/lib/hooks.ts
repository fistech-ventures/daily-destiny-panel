import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { IAuthorsFilter } from './interfaces';
import { AuthorsServices } from './services';

export const AuthorsHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof AuthorsServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), AuthorsServices.NAME, id],
      queryFn: () => AuthorsServices.findById(id),
      ...rest,
    });
  },

  useFind: ({ options, config }: { options: IAuthorsFilter; config?: QueryConfig<typeof AuthorsServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), AuthorsServices.NAME, options],
      queryFn: () => AuthorsServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: IAuthorsFilter;
    config?: InfiniteQueryConfig<typeof AuthorsServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), AuthorsServices.NAME, options],
      queryFn: ({ pageParam }) => AuthorsServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof AuthorsServices.create> } = {}) => {
    return useMutation({
      mutationFn: AuthorsServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [AuthorsServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof AuthorsServices.update> } = {}) => {
    return useMutation({
      mutationFn: AuthorsServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [AuthorsServices.NAME] });
      },
      ...config,
    });
  },
};
