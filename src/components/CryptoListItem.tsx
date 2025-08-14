import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { CryptoCurrency } from '../types/crypto';
import { colors } from '../theme';

interface CryptoListItemProps {
  crypto: CryptoCurrency;
  onPress?: (crypto: CryptoCurrency) => void;
}

const CryptoListItem: React.FC<CryptoListItemProps> = React.memo(({ crypto, onPress }) => {
  const formattedPrice = useMemo(() => {
    if (crypto.current_price < 1) {
      return `$${crypto.current_price.toFixed(4)}`;
    }
    return `$${crypto.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [crypto.current_price]);

  const formattedPercentage = useMemo(() => {
    if (crypto.price_change_percentage_24h === null) {
      return 'N/A';
    }
    const sign = crypto.price_change_percentage_24h >= 0 ? '+' : '';
    return `${sign}${crypto.price_change_percentage_24h.toFixed(2)}%`;
  }, [crypto.price_change_percentage_24h]);

  const isPositive = useMemo(() => 
    crypto.price_change_percentage_24h !== null && crypto.price_change_percentage_24h >= 0, 
    [crypto.price_change_percentage_24h]
  );


  const handlePress = useCallback(() => {
    onPress?.(crypto);
  }, [onPress, crypto]);

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <Image source={{ uri: crypto.image }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name}>{crypto.name}</Text>
          <Text style={styles.symbol}>{crypto.symbol.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.rightSection}>
        <Text style={styles.price}>{formattedPrice}</Text>
        <Text style={[
          styles.percentage,
          isPositive ? styles.positive : styles.negative
        ]}>
          {formattedPercentage}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  image: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  symbol: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '500',
  },
  positive: {
    color: colors.success,
  },
  negative: {
    color: colors.error,
  },
});

export default CryptoListItem;
