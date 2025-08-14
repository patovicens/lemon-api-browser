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
import { colors } from '../theme';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser, faRotate, faGear } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';

const CryptoListScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { user, handleLogout } = useAuth();
  
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
    if (refreshing || isFetching) {
      return;
    }
    
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
        <TouchableOpacity style={styles.headerLeft} onPress={handleLogout}>
          <FontAwesomeIcon icon={faUser} size={20} color={colors.textPrimary} />
          <Text style={styles.title}>
            {user?.email ? `@${user.email.split('@')[0]}` : '@User'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.headerRight}>
          {isFetching && !isLoading && (
            <Text style={styles.updatingText}>Updating...</Text>
          )}
          <TouchableOpacity 
            onPress={handleRefresh} 
            style={styles.iconButton}
            disabled={refreshing || isFetching}
          >
            <FontAwesomeIcon 
              icon={faRotate} 
              size={18} 
              color={refreshing || isFetching ? colors.textTertiary : colors.textSecondary} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Settings', 'Settings coming soon!')} style={styles.iconButton}>
            <FontAwesomeIcon icon={faGear} size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
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
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            ) : undefined
          }
          onEndReached={handleLoadMore}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderEndMessage}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          getItemLayout={(_, index) => ({
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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  updatingText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  listContainer: {
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputContainer: {
    position: 'relative',
  },
  searchInput: {
    height: 40,
    backgroundColor: colors.searchBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
  searchInputSearching: {
    backgroundColor: colors.searchActive,
    borderColor: colors.searchBorder,
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
    color: colors.textSecondary,
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
    color: colors.textSecondary,
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
    color: colors.textPrimary,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  endMessageContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  endSubMessage: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 4,
  },
});

export default CryptoListScreen;
