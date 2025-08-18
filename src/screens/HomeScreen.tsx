import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import HomeListItem from '../components/home/HomeListItem';
import { CryptoCurrency } from '../types/crypto';
import LoadingScreen from '../components/common/LoadingScreen';

import HomeHeader from '../components/layout/HomeHeader';
import FilterSortBar from '../components/home/FilterSortBar';
import RateLimitAlert from '../components/common/RateLimitAlert';
import EndMessage from '../components/home/EndMessage';
import EmptyState from '../components/home/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { useHomeList } from '../contexts/HomeContext';
import { useRateLimit } from '../contexts/RateLimitContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeColors } from '../theme';

const HomeScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [shouldRenderFilters, setShouldRenderFilters] = useState(false);
  const [listKey, setListKey] = useState(0);
  const { resetRateLimit } = useRateLimit();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const {
    displayList,
    isLoading,
    error,
    isFetching,
    isSearching,
    isRateLimited,
    hasNextPage,
    isFetchingNextPage,
    refreshing,
    handleRefresh,
    handleLoadMore,
    refetch,
    currentSort,
    currentFilters,
    debouncedQuery,
    setSort,
    setFilters,
    setQuery,
  } = useHomeList();
  
  useEffect(() => {
    setListKey(prev => prev + 1);
  }, [currentSort]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuery(searchQuery);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [searchQuery, setQuery]);



  const handleCryptoPress = useCallback((crypto: CryptoCurrency) => {
    const priceChange = crypto.price_change_percentage_24h !== null 
      ? `${crypto.price_change_percentage_24h.toFixed(2)}%`
      : 'N/A';
      
    Alert.alert(
      crypto.name,
      `Price: $${crypto.current_price?.toLocaleString() || 'N/A'}\n24h Change: ${priceChange}\nMarket Cap: $${crypto.market_cap?.toLocaleString() || 'N/A'}`,
      [{ text: 'OK' }]
    );
  }, []);

  const renderCryptoItem = useCallback(({ item }: { item: CryptoCurrency }) => (
    <HomeListItem crypto={item} onPress={handleCryptoPress} />
  ), [handleCryptoPress]);

  const keyExtractor = useCallback((item: CryptoCurrency) => {
    // Create a unique key using multiple properties to avoid duplicates
    // Handle null values and ensure uniqueness
    const id = item.id || 'unknown';
    const symbol = item.symbol || 'unknown';
    const rank = item.market_cap_rank || 'unranked';
    const name = item.name || 'unknown';
    
    return `${id}-${symbol}-${rank}-${name}`;
  }, []);

  
  const renderEndMessage = () => {
    const hasSearchQuery = debouncedQuery.trim().length > 0;
    const isFiltering = currentFilters.length > 0;
    
    if (isRateLimited) {
      return (
        <RateLimitAlert 
          onRetry={() => {
            resetRateLimit();
            refetch();
          }}
        />
      );
    }
    
    return (
      <EndMessage
        hasSearchQuery={hasSearchQuery}
        isFiltering={isFiltering}
        isFetchingNextPage={isFetchingNextPage}
        displayListLength={displayList.length}
        hasNextPage={hasNextPage}
      />
    );
  };

  const renderEmptyState = () => {
    const trimmedQuery = debouncedQuery.trim();
    return (
      <EmptyState
        searchQuery={trimmedQuery}
        isSearching={isSearching}
        onRetry={() => refetch()}
      />
    );
  };

  const renderErrorState = () => (
    <ErrorState
      error={error as Error | null}
      onRetry={() => refetch()}
    />
  );

  if (isLoading && !displayList.length) {
    return <LoadingScreen message="Loading cryptocurrencies..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']} >
      <BottomSheetModalProvider>
        <View style={styles.contentContainer}>
          <HomeHeader 
            isFetching={isFetching}
            isRefreshing={refreshing}
            onRefresh={handleRefresh}
            onSearch={setSearchQuery}
            onSearchSubmit={(query) => {
              setQuery(query);
            }}
            onToggleFilters={() => {
              const newVisibility = !isFiltersVisible;
              setIsFiltersVisible(newVisibility);
              if (newVisibility) {
                setShouldRenderFilters(true);
              }
            }}
            isFiltersVisible={isFiltersVisible}
          />

          {shouldRenderFilters && (
            <FilterSortBar
              currentSort={currentSort}
              currentFilters={currentFilters}
              onSortChange={setSort}
              onFilterChange={setFilters}
              isVisible={isFiltersVisible}
              onAnimationComplete={() => {
                if (!isFiltersVisible) {
                  setShouldRenderFilters(false);
                }
              }}
            />
          )}

          {error && !isRateLimited ? (renderErrorState()
          ) : (
            <FlashList
              key={`list-${currentSort?.key || 'none'}-${currentSort?.direction || 'none'}-${listKey}`}
              data={displayList}
              renderItem={renderCryptoItem}
              keyExtractor={keyExtractor}
              refreshControl={
                !debouncedQuery.trim() ? (
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={[colors.lemon]}
                    tintColor={colors.lemon}
                  />
                ) : undefined
              }
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0}
              ListEmptyComponent={renderEmptyState}
              ListFooterComponent={renderEndMessage}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      </BottomSheetModalProvider>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.themeSurface,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.themeBackground,
  },
  listContainer: {
  },
});


export default HomeScreen;
