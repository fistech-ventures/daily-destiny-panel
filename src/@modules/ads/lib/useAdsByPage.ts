import { WebAdsHooks } from './hooks';

export const useAdsByPage = (pageType: string, isActive: string = 'true') => {
  const adsQuery = WebAdsHooks.useFind({
    options: {
      pageType,
      isActive,
      limit: 100,
    },
    config: {
      queryKey: ['ads-by-page', pageType, isActive],
      enabled: !!pageType,
    },
  });

  const adsByPosition = adsQuery.data?.data?.reduce((acc, ad) => {
    if (!acc[ad.position]) {
      acc[ad.position] = [];
    }
    acc[ad.position].push(ad);
    return acc;
  }, {} as Record<string, any[]>) || {};

  return {
    adsByPosition,
    isLoading: adsQuery.isLoading,
    error: adsQuery.error,
  };
};
