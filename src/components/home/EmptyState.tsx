import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeColors } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

import { EmptyStateProps } from '../../types/home';

const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery, isSearching, onRetry }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (searchQuery && isSearching) {
    return (
      <View style={styles.container}>
        <Text style={styles.searchingText}>Searching for "{searchQuery}"...</Text>
      </View>
    );
  }
  
  if (searchQuery && !isSearching) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No cryptocurrencies found for "{searchQuery}"</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.emptyText}>No cryptocurrencies found</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  searchingText: {
    fontSize: 14,
    color: colors.themeTextSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.themeTextSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.themeBorderLight,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.themeText,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EmptyState;
