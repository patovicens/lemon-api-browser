import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, StyleSheet, Platform } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronDown, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../theme';
import { CryptoCurrency } from '../../types/crypto';
import { getFiatDisplayName } from '../../utils/constants';

interface CurrencyInputSectionProps {
  direction: 'crypto-to-fiat' | 'fiat-to-crypto';
  sectionType: 'from' | 'to';
  selectedCrypto?: CryptoCurrency;
  selectedFiat: string;
  amount: string;
  onAmountChange: (text: string) => void;
  onCurrencyPress: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  editable?: boolean;
  showRefreshButton?: boolean;
  helpText?: string;
}

const CurrencyInputSection: React.FC<CurrencyInputSectionProps> = ({
  direction,
  sectionType,
  selectedCrypto,
  selectedFiat,
  amount,
  onAmountChange,
  onCurrencyPress,
  onRefresh,
  isRefreshing = false,
  editable = true,
  showRefreshButton = false,
  helpText,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const isCryptoSection = 
    (sectionType === 'from' && direction === 'crypto-to-fiat') ||
    (sectionType === 'to' && direction === 'fiat-to-crypto');

  const currencyPrefix = isCryptoSection 
    ? selectedCrypto?.symbol?.toUpperCase() || 'CRYPTO'
    : selectedFiat;

  const renderCurrencyDisplay = () => {
    if (isCryptoSection) {
      return (
        <View style={styles.currencyDisplay}>
          {selectedCrypto?.image ? (
            <Image 
              source={{ uri: selectedCrypto.image }} 
              style={styles.currencyIconImage} 
            />
          ) : (
            <FontAwesomeIcon icon={faSyncAlt} size={20} color={colors.themeTextSecondary} />
          )}
          <View style={styles.currencyInfo}>
            <Text style={styles.currencyName}>
              {selectedCrypto?.name || 'Select Crypto'}
            </Text>
            <View style={styles.cryptoSubInfo}>
              <Text style={styles.currencySymbol}>
                {selectedCrypto?.symbol?.toUpperCase() || ''}
              </Text>
              {selectedCrypto?.current_price && (
                <>
                  <Text style={styles.priceSeparator}>•</Text>
                  <Text style={styles.inlinePrice}>
                    ${selectedCrypto.current_price.toFixed(2)}
                  </Text>
                  {selectedCrypto.price_change_percentage_24h && (
                    <Text style={[
                      styles.inlinePriceChange,
                      { color: selectedCrypto.price_change_percentage_24h > 0 ? colors.success : colors.error }
                    ]}>
                      ({selectedCrypto.price_change_percentage_24h > 0 ? '+' : ''}
                      {selectedCrypto.price_change_percentage_24h.toFixed(2)}%)
                    </Text>
                  )}
                </>
              )}
            </View>
          </View>
        </View>
      );
    } else {
      const fiatCurrency = sectionType === 'from' ? 
        (direction === 'fiat-to-crypto' ? selectedFiat : selectedFiat) :
        (direction === 'crypto-to-fiat' ? selectedFiat : selectedFiat);
      
      return (
        <View style={styles.currencyDisplay}>
          <View style={styles.fiatIcon}>
            <Text style={styles.fiatSymbol}>{selectedFiat}</Text>
          </View>
          <View style={styles.currencyInfo}>
            <Text style={styles.currencyName}>{selectedFiat}</Text>
            <Text style={styles.currencySymbol}>
              {getFiatDisplayName(fiatCurrency.toLowerCase())}
            </Text>
          </View>
        </View>
      );
    }
  };

  return (
    <View style={styles.currencySection}>
      <TouchableOpacity
        style={styles.currencySelector}
        onPress={onCurrencyPress}
      >
        {renderCurrencyDisplay()}
        
        {showRefreshButton && selectedCrypto && (
          <TouchableOpacity 
            style={styles.inlineRefreshButton} 
            onPress={onRefresh}
            disabled={isRefreshing}
          >
            <FontAwesomeIcon 
              icon={faSyncAlt} 
              size={14} 
              color={isRefreshing ? colors.themeTextTertiary : colors.lemon}
              style={isRefreshing ? styles.spinning : undefined}
            />
          </TouchableOpacity>
        )}
        <FontAwesomeIcon icon={faChevronDown} size={16} color={colors.themeTextSecondary} />
      </TouchableOpacity>

      <View style={[
        styles.amountInputContainer,
        !editable && styles.bottomInputContainer
      ]}>
        <Text style={styles.currencyPrefix}>{currencyPrefix}</Text>
        <TextInput
          style={[styles.amountInput, !editable && styles.readOnlyInput]}
          value={amount}
          onChangeText={onAmountChange}
          placeholder="0.00"
          placeholderTextColor={colors.themeTextTertiary}
          keyboardType="numeric"
          autoCorrect={false}
          editable={editable}
        />
      </View>
      
      {helpText && (
        <Text style={styles.helpText}>{helpText}</Text>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  currencySection: {
    marginHorizontal: 20,
    marginVertical: 20,
  },

  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.themeSurface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.themeBorder,
    marginBottom: 12,
  },
  currencyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencyIconImage: {
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
  currencyInfo: {
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
  cryptoSubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  priceSeparator: {
    fontSize: 12,
    color: colors.themeTextTertiary,
    marginHorizontal: 6,
  },
  inlinePrice: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.themeText,
    marginRight: 4,
  },
  inlinePriceChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.themeSurface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 0,
    borderWidth: 1,
    borderColor: colors.themeBorder,
  },
  bottomInputContainer: {
    backgroundColor: colors.themeBackground,
    opacity: 0.5,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.themeText,
    marginRight: 12,
    minWidth: 60,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    color: colors.themeText,
  },
  readOnlyInput: {
    color: colors.themeTextSecondary,
  },
  inlineRefreshButton: {
    padding: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  spinning: {
    transform: [{ rotate: '360deg' }],
  },
  helpText: {
    fontSize: 12,
    color: colors.themeTextTertiary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 30,
  },
});

export default CurrencyInputSection;
