import { queryClient, MutationConfig, QueryConfig } from '@lib/config';
import { useMutation, useQuery } from '@tanstack/react-query';
import { EpaperVisualServices } from './services';
import { CreatePagePayload, IEditionsFilter } from './interfaces';

export const EpaperVisualHooks = {
  useFindEditions: ({
    options,
    config,
  }: {
    options: IEditionsFilter;
    config?: QueryConfig<typeof EpaperVisualServices.findEditions>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), EpaperVisualServices.NAME, 'editions', options],
      queryFn: () => EpaperVisualServices.findEditions(options),
      ...rest,
    });
  },

  useFindEditionById: ({
    id,
    config,
  }: {
    id: string;
    config?: Omit<QueryConfig<typeof EpaperVisualServices.findEditionById>, 'queryKey'> & { queryKey?: any[] };
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), EpaperVisualServices.NAME, 'editions', id],
      queryFn: () => EpaperVisualServices.findEditionById(id),
      ...rest,
    });
  },

  useCreateEdition: ({ config }: { config?: MutationConfig<typeof EpaperVisualServices.createEdition> } = {}) => {
    return useMutation({
      mutationFn: EpaperVisualServices.createEdition,
      onSettled: (data) => {
        if (!data?.success) return;
        queryClient.invalidateQueries({ queryKey: [EpaperVisualServices.NAME, 'editions'] });
      },
      ...config,
    });
  },

  usePublishEdition: ({ config }: { config?: MutationConfig<typeof EpaperVisualServices.publishEdition> } = {}) => {
    return useMutation({
      mutationFn: EpaperVisualServices.publishEdition,
      onSettled: (data) => {
        if (!data?.success) return;
        queryClient.invalidateQueries({ queryKey: [EpaperVisualServices.NAME, 'editions'] });
      },
      ...config,
    });
  },

  useDeleteEdition: ({ config }: { config?: MutationConfig<typeof EpaperVisualServices.deleteEdition> } = {}) => {
    return useMutation({
      mutationFn: EpaperVisualServices.deleteEdition,
      onSettled: (data) => {
        if (!data?.success) return;
        queryClient.invalidateQueries({ queryKey: [EpaperVisualServices.NAME, 'editions'] });
      },
      ...config,
    });
  },

  useAddPage: ({ config }: { config?: MutationConfig<typeof EpaperVisualServices.addPage> } = {}) => {
    return useMutation({
      mutationFn: ({ editionId, data }: { editionId: string; data: CreatePagePayload }) =>
        EpaperVisualServices.addPage({ editionId, data }),
      onSettled: (data) => {
        if (!data?.success) return;
        queryClient.invalidateQueries({ queryKey: [EpaperVisualServices.NAME, 'editions'] });
      },
      ...config,
    });
  },

  useSaveHotspots: ({ config }: { config?: MutationConfig<typeof EpaperVisualServices.saveHotspots> } = {}) => {
    return useMutation({
      mutationFn: EpaperVisualServices.saveHotspots,
      onSettled: (data) => {
        if (!data?.success) return;
        queryClient.invalidateQueries({ queryKey: [EpaperVisualServices.NAME, 'editions'] });
      },
      ...config,
    });
  },
};
