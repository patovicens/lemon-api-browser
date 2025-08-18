import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { ThemeColors } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

import { EndMessageProps } from '../../types/home';

const EndMessage: React.FC<EndMessageProps> = ({
  hasSearchQuery,
  isFiltering,
  isFetchingNextPage,
  displayListLength,
  hasNextPage,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

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
              Linking.openURL('https://coingecko.com');
            }}>
              coingecko.com
            </Text>
          </Text>
        </View>
      </View>
    );
  }
  
  if (hasSearchQuery && displayListLength > 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.endMessage}>End of search results</Text>
        <Text style={styles.endSubMessage}>No more matching results</Text>
      </View>
    );
  }
  
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

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endMessage: {
    fontSize: 16,
    color: colors.themeTextSecondary,
    fontStyle: 'italic',
  },
  endSubMessage: {
    fontSize: 14,
    color: colors.themeTextTertiary, 
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
    color: colors.lemon,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});

export default EndMessage;
