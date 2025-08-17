import React, { createContext, useContext, useMemo, useState, useCallback, ReactNode } from 'react';
import { useCryptoInfiniteList, useCryptoSearch } from '../hooks/useGetCrypto';
import { useRateLimit } from './RateLimitContext';
import { sortCryptocurrencies, filterCryptocurrencies } from '../utils/filterSort';
import { SortOption, FilterOption } from '../types/home';
import { CryptoCurrency } from '../types/crypto';

interface HomeContextType {
  displayList: CryptoCurrency[];
  isLoading: boolean;
  error: unknown;
  isFetching: boolean;
  isSearching: boolean;
  isRateLimited: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  currentSort: SortOption;
  currentFilters: FilterOption[];
  debouncedQuery: string;
  refreshing: boolean;
  handleRefresh: () => Promise<void>;
  handleLoadMore: () => void;
  refetch: () => Promise<unknown>;
  setSort: (sort: SortOption) => void;
  setFilters: (filters: FilterOption[]) => void;
  setQuery: (query: string) => void;
}

const HomeContext = createContext<HomeContextType | undefined>(undefined);

interface HomeProviderProps {
  children: ReactNode;
}

export const HomeProvider: React.FC<HomeProviderProps> = ({ children }) => {
  const { isRateLimited } = useRateLimit();
  
  const [currentSort, setCurrentSort] = useState<SortOption>({ key: 'market_cap', label: 'Market Cap', direction: 'desc' });
  const [currentFilters, setCurrentFilters] = useState<FilterOption[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const effectiveSort = useMemo(() => {
    const getSortFieldForFilters = (filters: FilterOption[]): string => {
      if (filters.length === 0) return currentSort?.key || 'market_cap';
      
      const hasPriceChangeFilter = filters.some(filter => 
        filter.key === 'positive' || filter.key === 'negative'
      );
      
      if (hasPriceChangeFilter) {
        return 'price_change_percentage_24h';
      }
      
      const hasPriceRangeFilter = filters.some(filter => 
        filter.key === 'price_range_custom'
      );
      
      if (hasPriceRangeFilter) {
        return 'current_price';
      }
      
      return currentSort?.key || 'market_cap';
    };

    const effectiveSortField = getSortFieldForFilters(currentFilters);
    return currentSort ? {
      ...currentSort,
      key: effectiveSortField,
      label: getSortLabel(effectiveSortField)
    } : undefined;
  }, [currentSort, currentFilters]);

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCryptoInfiniteList({
    vs_currency: 'usd',
    per_page: currentFilters.length > 0 ? 250 : 15, // 250 = API max, needed for client-side filtering
  }, 
  // Only use API sorting when no filters are active (to avoid 429 rate limiting)
  currentFilters.length > 0 ? undefined : (currentSort || undefined)
  );

  const searchQueryResult = useCryptoSearch(debouncedQuery);
  const { data: searchResults, isLoading: isSearching } = searchQueryResult;

  const cryptoList = useMemo(() => {
    const flattened = data?.pages.flat() || [];
    // Deduplicate by id to handle API returning duplicate entries
    const uniqueItems = flattened.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );
          
    return uniqueItems;
  }, [data]);

  const displayList = useMemo(() => {
    let list = debouncedQuery.trim() ? (searchResults || []) : cryptoList;
    
    // Apply client-side filtering and sorting when we have filters active
    if (!debouncedQuery.trim() && currentFilters.length > 0) {
      list = filterCryptocurrencies(cryptoList, currentFilters);
      // Always apply client-side sorting when filters are active (API can't sort properly with filters)
      if (effectiveSort && list.length > 0) {
        list = sortCryptocurrencies(list, effectiveSort);
      }
    }
    
    // Ensure we always return a valid array and filter out any invalid items
    return list.filter(item => item && item.id && item.name);
  }, [debouncedQuery, searchResults, currentFilters, effectiveSort, cryptoList]);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (refreshing || isFetching) return;
    
    setRefreshing(true);
    try {
      await refetch();
    } catch (refreshError) {
      console.error('Refresh error:', refreshError);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, isFetching, refetch]);

  const handleLoadMore = useCallback(() => {
    if (debouncedQuery.trim() || isRateLimited || currentFilters.length > 0) return;
    if (isFetchingNextPage || !hasNextPage) return;
    
    setTimeout(() => {
      if (hasNextPage && !isFetchingNextPage && !isRateLimited) {
        fetchNextPage();
      }
    }, 100);
  }, [debouncedQuery, isRateLimited, currentFilters.length, isFetchingNextPage, hasNextPage, fetchNextPage]);

  const setSort = useCallback((sort: SortOption) => {
    setCurrentSort(sort);
  }, []);

  const setFilters = useCallback((filters: FilterOption[]) => {
    setCurrentFilters(filters);
  }, []);

  const setQuery = useCallback((query: string) => {
    setDebouncedQuery(query);
  }, []);

  const value: HomeContextType = {
    displayList,
    isLoading,
    error,
    isFetching,
    isSearching,
    isRateLimited,
    hasNextPage,
    isFetchingNextPage,
    currentSort,
    currentFilters,
    debouncedQuery,
    refreshing,
    handleRefresh,
    handleLoadMore,
    refetch,
    setSort,
    setFilters,
    setQuery,
  };

  return (
    <HomeContext.Provider value={value}>
      {children}
    </HomeContext.Provider>
  );
};

export const useHomeList = (): HomeContextType => {
  const context = useContext(HomeContext);
  if (context === undefined) {
    throw new Error('useHomeList must be used within a HomeProvider');
  }
  return context;
};

const getSortLabel = (key: string): string => {
  switch (key) {
    case 'market_cap':
      return 'Market Cap';
    case 'volume':
      return 'Volume';
    case 'name':
      return 'Name';
    default:
      return 'Market Cap';
  }
};
