import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../theme';
import { formatNumber } from '../../utils/formatting';
import LastUpdated from './LastUpdated';

import { ExchangeRateInfoProps } from '../../types/exchange';

const ExchangeRateInfo: React.FC<ExchangeRateInfoProps> = ({
  exchangeRate,
  fromCurrencySymbol,
  toCurrencySymbol,
  conversionDirection,
  lastFetchTime,
  currentTime,
  onRefresh,
  isRefreshing = false,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const isStale = lastFetchTime && (currentTime.getTime() - lastFetchTime.getTime()) > 30 * 1000;

  return (
    <View style={styles.rateInfo}>
      <View style={styles.rateHeader}>
        <Text style={styles.rateLabel}>Exchange Rate:</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={onRefresh}
          disabled={isRefreshing}
        >
          <FontAwesomeIcon 
            icon={faSyncAlt} 
            size={16} 
            color={isRefreshing ? colors.themeTextTertiary : colors.lemon}
            style={isRefreshing ? styles.spinning : undefined}
          />
        </TouchableOpacity>
      </View>
      
      {exchangeRate ? (
        <>
          <Text style={styles.rateValue}>
            1 {fromCurrencySymbol} = {' '}
            {formatNumber(exchangeRate, conversionDirection === 'crypto-to-fiat' ? 2 : 8)} {toCurrencySymbol}
          </Text>
          <LastUpdated 
            lastFetchTime={lastFetchTime} 
            style={styles.rateUpdate} 
          />
          {isStale && (
            <Text style={styles.staleWarning}>
              Rates may be outdated. Type, change currency, or tap refresh.
            </Text>
          )}
        </>
      ) : (
        <Text style={styles.rateValue}>
          Loading exchange rate...
        </Text>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  rateInfo: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.lemonLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lemon,
  },
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  rateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.themeText,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 16,
  },
  spinning: {
    transform: [{ rotate: '360deg' }],
  },
  rateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.themeText,
    marginBottom: 4,
  },
  rateUpdate: {
    fontSize: 12,
    color: colors.themeTextSecondary,
  },
  staleWarning: {
    fontSize: 12,
    color: colors.warning,
    marginTop: 8,
  },
});

export default ExchangeRateInfo;
