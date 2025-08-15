import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { cryptoApi } from '../services/cryptoApi';
import { CryptoListParams } from '../types/crypto';
import { SortOption } from '../components/home/FilterSortBar';
import { useRateLimit } from '../contexts/RateLimitContext';

export const useCryptoSearch = (query: string) => {
  const enabled = query.trim().length > 0;
  
  return useQuery({
    queryKey: ['cryptoSearch', query],
    queryFn: () => cryptoApi.searchCrypto(query),
    enabled,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000, 
  });
};

export const useCryptoInfiniteList = (params: CryptoListParams = {}, sort?: SortOption) => {
  const { handle429Error } = useRateLimit();
  
  const getApiOrder = (sortOption?: SortOption): CryptoListParams['order'] | undefined => {
    if (!sortOption) return undefined;
    
    const orderMap: Record<string, CryptoListParams['order']> = {
      'market_cap': sortOption.direction === 'asc' ? 'market_cap_asc' : 'market_cap_desc',
      'volume': sortOption.direction === 'asc' ? 'volume_asc' : 'volume_desc',
      'name': sortOption.direction === 'asc' ? 'id_asc' : 'id_desc', 
    };
    
    return orderMap[sortOption.key] || undefined;
  };

  const apiParams = {
    ...params,
  };

  const order = getApiOrder(sort);
  if (order) {
    apiParams.order = order;
  }

  const queryKey = ['cryptoInfiniteList', JSON.stringify(apiParams)];

  return useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) => {
      return cryptoApi.getCryptoList({ ...apiParams, page: pageParam });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < (apiParams.per_page || 15)) {
        return undefined;
      }
      return allPages.length + 1;
    },
    staleTime: 2 * 60 * 1000, 
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: (failureCount, error: any) => {
      if (error?.status === 429 || error?.message?.includes('429')) {
        handle429Error();
        return false;
      }
      
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    },
  });
};
