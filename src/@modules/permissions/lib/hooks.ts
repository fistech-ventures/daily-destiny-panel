import { MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useMutation, useQuery } from '@tanstack/react-query';
import { IPermissionsFilter } from './interfaces';
import { PermissionsServices } from './services';

export const PermissionsHooks = {
  useFind: ({
    options,
    config,
  }: {
    options: IPermissionsFilter;
    config?: QueryConfig<typeof PermissionsServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), PermissionsServices.NAME, options],
      queryFn: () => PermissionsServices.find(options),
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof PermissionsServices.create> } = {}) => {
    return useMutation({
      mutationFn: PermissionsServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [PermissionsServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof PermissionsServices.update> } = {}) => {
    return useMutation({
      mutationFn: PermissionsServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [PermissionsServices.NAME] });
      },
      ...config,
    });
  },

  useBulkSync: ({ config }: { config?: MutationConfig<typeof PermissionsServices.bulkSync> } = {}) => {
    return useMutation({
      mutationFn: PermissionsServices.bulkSync,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [PermissionsServices.NAME] });
      },
      ...config,
    });
  },
};
