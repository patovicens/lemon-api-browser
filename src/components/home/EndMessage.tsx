import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface EndMessageProps {
  hasSearchQuery: boolean;
  isFiltering: boolean;
  isFetchingNextPage: boolean;
  displayListLength: number;
  hasNextPage: boolean;
}

const EndMessage: React.FC<EndMessageProps> = ({
  hasSearchQuery,
  isFiltering,
  isFetchingNextPage,
  displayListLength,
  hasNextPage,
}) => {
  // Show loading message when fetching next page (only for normal browsing)
  if (isFetchingNextPage && !isFiltering) {
    return (
      <View style={styles.container}>
        <Text style={styles.endMessage}>Loading more...</Text>
      </View>
    );
  }
  
  // For filtering, we always show the end message since we only fetch 250 coins
  if (isFiltering && displayListLength > 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.endMessage}>Filtering complete</Text>
        <Text style={styles.endSubMessage}>{displayListLength} coins from top 250 available</Text>
        <View style={styles.apiLimitationContainer}>
          <Text style={styles.apiLimitationTitle}>API Limitations</Text>
          <Text style={styles.apiLimitationText}>
            Due to CoinGecko API restrictions, we can only filter through the top 250 cryptocurrencies. 
            For a complete list with advanced filtering options, visit{' '}
            <Text style={styles.linkText} onPress={() => {
              // TODO: Open CoinGecko website in browser
              console.log('Open CoinGecko website');
            }}>
              coingecko.com
            </Text>
          </Text>
        </View>
      </View>
    );
  }
  
  // For search results
  if (hasSearchQuery && displayListLength > 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.endMessage}>End of search results</Text>
        <Text style={styles.endSubMessage}>No more matching results</Text>
      </View>
    );
  }
  
  // For normal browsing (no filters, no search)
  if (!hasNextPage && displayListLength > 0 && !hasSearchQuery && !isFiltering) {
    return (
      <View style={styles.container}>
        <Text style={styles.endMessage}>You've reached the end! 🎉</Text>
        <Text style={styles.endSubMessage}>All cryptocurrencies loaded</Text>
      </View>
    );
  }
  
  return null;
};

const styles = StyleSheet.create({
  container: {
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
  apiLimitationContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.warningLight,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  apiLimitationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.warningDark,
    marginBottom: 4,
  },
  apiLimitationText: {
    fontSize: 12,
    color: colors.warningDark,
    lineHeight: 16,
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});

export default EndMessage;
