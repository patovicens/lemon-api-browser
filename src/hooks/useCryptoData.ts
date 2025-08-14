import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { cryptoApi } from '../services/cryptoApi';
import { CryptoListParams } from '../types/crypto';

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

export const useCryptoInfiniteList = (params: CryptoListParams = {}) => {
  return useInfiniteQuery({
    queryKey: ['cryptoInfiniteList', params],
    queryFn: ({ pageParam = 1 }) => {
      return cryptoApi.getCryptoList({ ...params, page: pageParam });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < (params.per_page || 15)) {
        return undefined;
      }
      return allPages.length + 1;
    },
    staleTime: 2 * 60 * 1000, 
    gcTime: 10 * 60 * 1000, 
  });
};
