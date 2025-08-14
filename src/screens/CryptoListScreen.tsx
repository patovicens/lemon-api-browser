import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCryptoInfiniteList, useCryptoSearch } from '../hooks/useCryptoData';
import CryptoListItem from '../components/CryptoListItem';
import { CryptoCurrency } from '../types/crypto';
import LoadingScreen from '../components/LoadingScreen';
import MyStatusBar from '../components/MyStatusBar';

const CryptoListScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
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
    order: 'market_cap_desc',
    per_page: 10,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const {
    data: searchResults,
    isLoading: isSearching,
  } = useCryptoSearch(debouncedQuery);

  const cryptoList = useMemo(() => data?.pages.flat() || [], [data]);

  const displayList = debouncedQuery.trim() ? (searchResults || []) : cryptoList;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (refreshError) {
      console.error('Refresh error:', refreshError);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (!debouncedQuery.trim() && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

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
    <CryptoListItem crypto={item} onPress={handleCryptoPress} />
  ), [handleCryptoPress]);

  const renderEndMessage = () => {
    // Don't show pagination messages when searching
    if (debouncedQuery.trim()) {
      return null;
    }

    if (isFetchingNextPage) {
      return (
        <View style={styles.endMessageContainer}>
          <Text style={styles.endMessage}>Loading more...</Text>
        </View>
      );
    }
    
    if (!hasNextPage && cryptoList.length > 0) {
      return (
        <View style={styles.endMessageContainer}>
          <Text style={styles.endMessage}>You've reached the end! 🎉</Text>
          <Text style={styles.endSubMessage}>All cryptocurrencies loaded</Text>
        </View>
      );
    }
    
    return null;
  };

  const renderEmptyState = () => {
    if (debouncedQuery.trim() && isSearching) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.searchingText}>Searching for "{debouncedQuery}"...</Text>
        </View>
      );
    }
    
    if (debouncedQuery.trim() && !isSearching) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No cryptocurrencies found for "{debouncedQuery}"</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No cryptocurrencies found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>
        {error?.message || 'Failed to load cryptocurrencies'}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !cryptoList.length) {
    return <LoadingScreen message="Loading cryptocurrencies..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={[]} >
      <MyStatusBar backgroundColor="white" barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Crypto List</Text>
        {isFetching && !isLoading && (
          <Text style={styles.updatingText}>Updating...</Text>
        )}
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={[styles.searchInput, isSearching && styles.searchInputSearching]}
            placeholder="Search cryptocurrencies..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode={isSearching ? "never" : "while-editing"}
          />
          {isSearching && (
            <View style={styles.searchIndicator}>
              <Text style={styles.searchIndicatorText}>...</Text>
            </View>
          )}
        </View>
      </View>

      {error && !cryptoList.length ? (
        renderErrorState()
      ) : (
        // TODO: Use shopify flashlist
        <FlatList
          key={debouncedQuery.trim() ? 'search' : 'list'}
          data={displayList}
          renderItem={renderCryptoItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            !debouncedQuery.trim() ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#4285F4']}
                tintColor="#4285F4"
              />
            ) : undefined
          }
          onEndReached={handleLoadMore}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderEndMessage}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          getItemLayout={(data, index) => ({
            length: 56,
            offset: 56 * index,
            index,
          })}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  updatingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  listContainer: {
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    position: 'relative',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  searchInputSearching: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 1,
  },
  searchIndicator: {
    position: 'absolute',
    right: 12,
    top: 8,
  },
  searchIndicatorText: {
    fontSize: 16,
  },
  searchingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  endMessageContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endMessage: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  endSubMessage: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});

export default CryptoListScreen;
