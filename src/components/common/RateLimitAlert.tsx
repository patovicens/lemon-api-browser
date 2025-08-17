import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme';

import { RateLimitAlertProps } from '../../types/common';

const RateLimitAlert: React.FC<RateLimitAlertProps> = ({ onRetry }) => {
  return (
    <View style={styles.container}>
      <View style={styles.rateLimitContainer}>
        <Text style={styles.rateLimitTitle}>⚠️ Rate Limit Reached</Text>
        <Text style={styles.rateLimitMessage}>
          CoinGecko API rate limit reached (5-15 calls/minute). Please wait a few seconds and pull to refresh.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          {/* TODO: Add loading state make sure its not limited again */}
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  rateLimitContainer: {
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.errorLight,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    alignItems: 'center',
  },
  rateLimitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginBottom: 8,
  },
  rateLimitMessage: {
    fontSize: 14,
    color: colors.errorDark,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.errorLight,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RateLimitAlert;
