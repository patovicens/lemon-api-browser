import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  NativeSyntheticEvent,
} from 'react-native';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../theme';
import { CryptoCurrency } from '../../types/crypto';
import { getFiatDisplayName } from '../../utils/constants';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

interface CurrencySelectorProps {
  currencies: (CryptoCurrency | string)[];
  selectedCurrency: string;
  onSelectCurrency: (currency: string) => void;
  isCrypto?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  currencies,
  selectedCurrency,
  onSelectCurrency,
  isCrypto = false,
  onRefresh,
  isRefreshing = false,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text === '') {
      setDebouncedSearchQuery('');
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<{ key: string }>) => {
    if (e.nativeEvent.key === 'Enter') {
      setDebouncedSearchQuery(searchQuery);
    }
  };

  const filteredCurrencies = currencies.filter(currency => {
    if (isCrypto) {
      const crypto = currency as CryptoCurrency;
      return crypto.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
             crypto.symbol.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    } else {
      const fiat = currency as string;
      return fiat.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    }
  });

  const renderCurrencyItem = ({ item }: { item: CryptoCurrency | string }) => {
    if (isCrypto) {
      const crypto = item as CryptoCurrency;
      const isSelected = crypto.id === selectedCurrency;
      
      return (
        <TouchableOpacity
          style={[styles.currencyItem, isSelected && styles.selectedCurrency]}
          onPress={() => onSelectCurrency(crypto.id)}
        >
          <View style={styles.currencyInfo}>
            <Image source={{ uri: crypto.image }} style={styles.currencyIcon} />
            <View style={styles.currencyDetails}>
              <Text style={[styles.currencyName, isSelected && styles.selectedText]}>
                {crypto.name}
              </Text>
              <Text style={[styles.currencySymbol, isSelected && styles.selectedText]}>
                {crypto.symbol.toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.priceInfo}>
            <Text style={[styles.currentPrice, isSelected && styles.selectedText]}>
              ${crypto.current_price?.toFixed(2) || 'N/A'}
            </Text>
            <Text style={[
              styles.priceChange,
              isSelected && styles.selectedText,
              { color: crypto.price_change_percentage_24h && crypto.price_change_percentage_24h > 0 ? colors.success : colors.error }
            ]}>
              {crypto.price_change_percentage_24h ? 
                `${crypto.price_change_percentage_24h > 0 ? '+' : ''}${crypto.price_change_percentage_24h.toFixed(2)}%` : 
                'N/A'
              }
            </Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      const fiat = item as string;
      const isSelected = fiat === selectedCurrency;
      
      return (
        <TouchableOpacity
          style={[styles.currencyItem, isSelected && styles.selectedCurrency]}
          onPress={() => onSelectCurrency(fiat)}
        >
          <View style={styles.currencyInfo}>
            <View style={styles.fiatIcon}>
              <Text style={[styles.fiatSymbol, isSelected && styles.selectedText]}>
                {fiat.toUpperCase()}
              </Text>
            </View>
            <View style={styles.currencyDetails}>
              <Text style={[styles.currencyName, isSelected && styles.selectedText]}>
                {fiat.toUpperCase()}
              </Text>
              <Text style={[styles.currencySymbol, isSelected && styles.selectedText]}>
                {getFiatDisplayName(fiat)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search currencies..."
          placeholderTextColor={colors.themeTextTertiary}
          value={searchQuery}
          onChangeText={handleSearch}
          onKeyPress={handleKeyPress}
          returnKeyType="search"
        />
            {isCrypto && onRefresh && (
          <TouchableOpacity 
            style={styles.refreshIcon} 
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
        )}
      </View>
      
      <BottomSheetFlatList
        data={filteredCurrencies}
        renderItem={renderCurrencyItem}
        keyExtractor={(item) => isCrypto ? (item as CryptoCurrency).id : item as string}
        showsVerticalScrollIndicator={true}
        style={styles.currencyList}
        contentContainerStyle={styles.currencyListContent}
        bounces={false}
        overScrollMode="never"
      />
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.themeSurfaceLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.themeBorder,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.themeText,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: colors.themeTextSecondary,
  },
  searchContainer: {
    margin: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.themeSurface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.themeBorder,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.themeText,
  },
  currencyList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  currencyListContent: {
    paddingBottom: 20,
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.themeSurface,
    borderWidth: 1,
    borderColor: colors.themeBorderLight,
  },
  selectedCurrency: {
    backgroundColor: colors.lemonLight,
    borderColor: colors.lemon,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  fiatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.lemon,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fiatSymbol: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.darkBackground,
  },
  currencyDetails: {
    flex: 1,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.themeText,
    marginBottom: 2,
  },
  currencySymbol: {
    fontSize: 14,
    color: colors.themeTextSecondary,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.themeText,
    marginBottom: 2,
  },
  priceChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  selectedText: {
    color: colors.themeText,
    fontWeight: '700',
  },
  refreshIcon: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  spinning: {
    transform: [{ rotate: '360deg' }],
  },
});

export default CurrencySelector;
