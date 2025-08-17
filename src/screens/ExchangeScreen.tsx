import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

import { useTheme } from '../contexts/ThemeContext';
import { useRateLimit } from '../contexts/RateLimitContext';
import { useExchange } from '../contexts/ExchangeContext';
import { ThemeColors } from '../theme';
import CurrencySelector from '../components/exchange/CurrencySelector';
import LoadingScreen from '../components/common/LoadingScreen';
import RateLimitAlert from '../components/common/RateLimitAlert';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowsAltV, faChevronDown, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import LastUpdated from '../components/exchange/LastUpdated';
import { getFiatDisplayName } from '../utils/constants';
import { formatNumber } from '../utils/formatting';
import { useFocusEffect } from '@react-navigation/native';

// TODO: Add proper toast message to manual refresh
const ExchangeScreen: React.FC = () => {
  const { colors } = useTheme();
  const { isRateLimited, handle429Error, resetRateLimit } = useRateLimit();
  const {
    state,
    exchangeRate,
    cryptoCurrencies,
    fiatCurrencies,
    isLoading,
    error,
    lastFetchTime,
    loadingStates,
    handleAmountChange,
    handleCurrencySelect,
    handleSwapCurrencies,
    handleSetConversionDirection,
    refreshRates,
    retry
  } = useExchange();
  const styles = createStyles(colors);

  useFocusEffect(
    useCallback(() => {
      if (state.fromCurrency && state.toCurrency) {
        refreshRates();
      }
    }, [state.fromCurrency, state.toCurrency, refreshRates])
  );

  const bottomSheetRef = useRef<BottomSheetModal | null>(null);
  const [selectorType, setSelectorType] = useState<'from' | 'to'>('from');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      pressBehavior="close"
    />
  ), []);



  const openCurrencySelector = (type: 'from' | 'to') => {
    setSelectorType(type);
    bottomSheetRef.current?.present();
  };

  const onCurrencySelect = (currency: string) => {
    const field = selectorType === 'from' ? 'fromCurrency' : 'toCurrency';
    handleCurrencySelect(field, currency);
    bottomSheetRef.current?.dismiss();
  };

  const getSelectorCurrencies = () => {
    const isSelectingCrypto = 
      (selectorType === 'from' && state.conversionDirection === 'crypto-to-fiat') ||
      (selectorType === 'to' && state.conversionDirection === 'fiat-to-crypto');
    
    return isSelectingCrypto ? cryptoCurrencies : fiatCurrencies;
  };

  const getSelectedCryptoDisplay = () => {
    const cryptoId = state.conversionDirection === 'crypto-to-fiat' ? 
      state.fromCurrency : state.toCurrency;
    return cryptoCurrencies.find(c => c.id === cryptoId);
  };

  const getSelectedFiatDisplay = () => {
    const fiatId = state.conversionDirection === 'crypto-to-fiat' ? 
      state.toCurrency : state.fromCurrency;
    return fiatId.toUpperCase();
  };



  if (isLoading) {
    return <LoadingScreen message="Loading exchange data..." />;
  }

  if (error && error.includes('429')) {
    handle429Error();
  }

  if (isRateLimited) {
    return (
      <SafeAreaView style={styles.container}>
        <RateLimitAlert onRetry={() => {
          resetRateLimit();
          retry();
        }} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={retry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const selectedCrypto = getSelectedCryptoDisplay();
  const selectedFiat = getSelectedFiatDisplay();

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          

          <View style={styles.directionToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                state.conversionDirection === 'crypto-to-fiat' && styles.activeToggleButton
              ]}
              onPress={() => handleSetConversionDirection('crypto-to-fiat')}
            >
              <Text style={[
                styles.toggleButtonText,
                state.conversionDirection === 'crypto-to-fiat' && styles.activeToggleButtonText
              ]}>
                Crypto → Fiat
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                state.conversionDirection === 'fiat-to-crypto' && styles.activeToggleButton
              ]}
              onPress={() => handleSetConversionDirection('fiat-to-crypto')}
            >
              <Text style={[
                styles.toggleButtonText,
                state.conversionDirection === 'fiat-to-crypto' && styles.activeToggleButtonText
              ]}>
                Fiat → Crypto
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <Text style={styles.subtitle}>Only the first input is editable. Want the other way around? Hit the toggle or swap icon</Text>
          </View>

          <View style={styles.currencySection}>
            <Text style={styles.sectionLabel}>
              {state.conversionDirection === 'crypto-to-fiat' ? 'From (Crypto)' : 'From (Fiat)'}
            </Text>
            
            <TouchableOpacity
              style={styles.currencySelector}
              onPress={() => openCurrencySelector('from')}
            >
              {state.conversionDirection === 'crypto-to-fiat' ? (
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
              ) : (
                <View style={styles.currencyDisplay}>
                  <View style={styles.fiatIcon}>
                    <Text style={styles.fiatSymbol}>{selectedFiat}</Text>
                  </View>
                  <View style={styles.currencyInfo}>
                    <Text style={styles.currencyName}>{selectedFiat}</Text>
                    <Text style={styles.currencySymbol}>
                      {getFiatDisplayName(state.fromCurrency)}
                    </Text>
                  </View>
                </View>
              )}
              {/* Refresh button for crypto when it's the "from" currency */}
              {state.conversionDirection === 'crypto-to-fiat' && selectedCrypto && (
                <TouchableOpacity 
                  style={styles.inlineRefreshButton} 
                  onPress={retry}
                  disabled={loadingStates.crypto}
                >
                  <FontAwesomeIcon 
                    icon={faSyncAlt} 
                    size={14} 
                    color={loadingStates.crypto ? colors.themeTextTertiary : colors.lemon}
                    style={loadingStates.crypto ? styles.spinning : undefined}
                  />
                </TouchableOpacity>
              )}
              <FontAwesomeIcon icon={faChevronDown} size={16} color={colors.themeTextSecondary} />
            </TouchableOpacity>

            <View style={styles.amountInputContainer}>
              <Text style={styles.currencyPrefix}>
                {state.conversionDirection === 'crypto-to-fiat' ? 
                  selectedCrypto?.symbol?.toUpperCase() || 'CRYPTO' : selectedFiat}
              </Text>
              <TextInput
                style={styles.amountInput}
                value={state.fromAmount}
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9.]/g, '');
                  const parts = numericText.split('.');
                  if (parts.length <= 2) {
                    handleAmountChange(numericText, 'fromAmount');
                  }
                }}
                placeholder="0.00"
                placeholderTextColor={colors.themeTextTertiary}
                keyboardType="numeric"
                autoCorrect={false}
              />
            </View>
            {/* Helpful message about smart refresh */}
            <Text style={styles.quoteHelpText}>
              Type, change currency, or tap refresh to get fresh rates
            </Text>
          </View>

          {/* Swap Button */}
          <TouchableOpacity style={styles.swapButton} onPress={handleSwapCurrencies}>
            {loadingStates.rate || loadingStates.refreshing ? (
              <ActivityIndicator size="small" color={colors.themeBackground} />
            ) : (
              <FontAwesomeIcon icon={faArrowsAltV} size={16} color={colors.themeBackground} />
            )}
          </TouchableOpacity>

          {/* To Currency Section */}
          <View style={styles.currencySection}>
            <Text style={styles.sectionLabel}>
              {state.conversionDirection === 'crypto-to-fiat' ? 'To (Fiat)' : 'To (Crypto)'}
            </Text>
            
            <TouchableOpacity
              style={styles.currencySelector}
              onPress={() => openCurrencySelector('to')}
            >
              {state.conversionDirection === 'crypto-to-fiat' ? (
                // Fiat display
                <View style={styles.currencyDisplay}>
                  <View style={styles.fiatIcon}>
                    <Text style={styles.fiatSymbol}>{selectedFiat}</Text>
                  </View>
                  <View style={styles.currencyInfo}>
                    <Text style={styles.currencyName}>{selectedFiat}</Text>
                    <Text style={styles.currencySymbol}>
                      {getFiatDisplayName(state.toCurrency)}
                    </Text>
                  </View>
                </View>
              ) : (
                // Crypto display with price info
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
              )}
              <FontAwesomeIcon icon={faChevronDown} size={16} color={colors.themeTextSecondary} />
            </TouchableOpacity>

            <View style={styles.bottomInputContainer}>
              <Text style={styles.currencyPrefix}>
                {state.conversionDirection === 'crypto-to-fiat' ? 
                  selectedFiat : selectedCrypto?.symbol?.toUpperCase() || 'CRYPTO'}
              </Text>
              <TextInput
                style={[styles.amountInput, styles.readOnlyInput]}
                value={state.toAmount ? formatNumber(state.toAmount, 
                  state.conversionDirection === 'crypto-to-fiat' ? 2 : 8
                ) : ''}
                onChangeText={(text) => handleAmountChange(text, 'toAmount')}
                placeholder="0.00"
                placeholderTextColor={colors.themeTextTertiary}
                keyboardType="numeric"
                autoCorrect={false}
                editable={false}
              />
            </View>
          </View>

          {/* Exchange Rate Info */}
          {(exchangeRate || state.fromCurrency || state.toCurrency) && (
            <View style={styles.rateInfo}>
              <View style={styles.rateHeader}>
                <Text style={styles.rateLabel}>Exchange Rate:</Text>
                <TouchableOpacity 
                  style={styles.refreshButton} 
                  onPress={retry}
                  disabled={loadingStates.refreshing}
                >
                  <FontAwesomeIcon 
                    icon={faSyncAlt} 
                    size={16} 
                    color={loadingStates.refreshing ? colors.themeTextTertiary : colors.lemon}
                    style={loadingStates.refreshing ? styles.spinning : undefined}
                  />
                </TouchableOpacity>
              </View>
              {exchangeRate ? (
                <>
                  <Text style={styles.rateValue}>
                    1 {state.conversionDirection === 'crypto-to-fiat' ? 
                      selectedCrypto?.symbol?.toUpperCase() || 'CRYPTO' : selectedFiat} = {' '}
                    {formatNumber(exchangeRate, 
                      state.conversionDirection === 'crypto-to-fiat' ? 2 : 8
                    )} {state.conversionDirection === 'crypto-to-fiat' ? 
                      selectedFiat : selectedCrypto?.symbol?.toUpperCase() || 'CRYPTO'}
                  </Text>
                  <LastUpdated 
                    lastFetchTime={lastFetchTime} 
                    style={styles.rateUpdate} 
                  />
                  {lastFetchTime && (currentTime.getTime() - lastFetchTime.getTime()) > 30 * 1000 && (
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
          )}

          {(error || state.conversionError) && (
            <View style={styles.errorInfo}>
              <View style={styles.errorContent}>
                <Text style={styles.errorText}>{error || state.conversionError}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <BottomSheetModal
          ref={bottomSheetRef}
          index={0}
          snapPoints={['90%']}
          backgroundStyle={{ backgroundColor: colors.themeSurfaceLight }}
          enableDynamicSizing={false}
          backdropComponent={renderBackdrop}
        >
          <CurrencySelector
            currencies={getSelectorCurrencies()}
            selectedCurrency={selectorType === 'from' ? state.fromCurrency : state.toCurrency}
            onSelectCurrency={onCurrencySelect}
            isCrypto={
              (selectorType === 'from' && state.conversionDirection === 'crypto-to-fiat') ||
              (selectorType === 'to' && state.conversionDirection === 'fiat-to-crypto')
            }
            onRefresh={retry}
            isRefreshing={loadingStates.crypto}
          />
        </BottomSheetModal>
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.themeBackground,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14, 
    color: colors.themeTextTertiary,
    textAlign: 'center',
  },
  directionToggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: colors.themeSurfaceLight,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeToggleButton: {
    backgroundColor: colors.lemon,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.themeTextSecondary,
  },
  activeToggleButtonText: {
    color: colors.darkBackground,
  },
  currencySection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.themeText,
    marginBottom: 10,
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
  currencyIcon: {
    fontSize: 24,
    marginRight: 12,
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
  selectorArrow: {
    fontSize: 16,
    color: colors.themeTextSecondary,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.themeSurface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.themeBorder,
  },
  bottomInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.themeBackground,
    borderColor: colors.themeBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
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
  swapButton: {
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lemon,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.lemon,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  swapButtonLoading: {
    // Add spinning animation for loading state
  },
  swapButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.darkBackground,
  },
  rateInfo: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: colors.lemonLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lemon,
  },
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: colors.themeTextSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.lemon,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkBackground,
  },
  errorInfo: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: colors.themeSurfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginLeft: 6,
    flex: 1,
    textAlign: 'center',
  },
  inlineRefreshButton: {
    padding: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  quoteHelpText: {
    fontSize: 12,
    color: colors.themeTextTertiary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 30,
  },
  refreshingText: {
    fontSize: 12,
    color: colors.themeTextTertiary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  debugText: {
    fontSize: 12,
    color: colors.themeTextTertiary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
});

export default ExchangeScreen;