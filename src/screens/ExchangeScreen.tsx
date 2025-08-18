import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import { useExchange } from '../contexts/ExchangeContext';
import CurrencyInputSection from '../components/exchange/CurrencyInputSection';
import CurrencySelector from '../components/exchange/CurrencySelector';
import ConversionDirectionToggle from '../components/exchange/ConversionDirectionToggle';
import SwapButton from '../components/exchange/SwapButton';
import ExchangeRateInfo from '../components/exchange/ExchangeRateInfo';
import ConversionErrorInfo from '../components/exchange/ConversionErrorInfo';
import { formatNumber } from '../utils/formatting';
import { useFocusEffect } from '@react-navigation/native';
import { useExchangeAnimations } from '../hooks/useExchangeAnimations';
import ErrorState from '../components/common/ErrorState';
import LoadingScreen from '../components/common/LoadingScreen';
import { ThemeColors } from '../theme';

const ExchangeScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const {
    state,
    exchangeRate,
    cryptoCurrencies,
    fiatCurrencies,
    isLoading,
    error,
    rateError,
    lastFetchTime,
    loadingStates,
    handleAmountChange,
    handleCurrencySelect,
    handleSwapCurrencies,
    handleSetConversionDirection,
    refreshRates,
    retry
  } = useExchange();

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
  
  const fromSectionTranslateX = useSharedValue(0);
  const toSectionTranslateX = useSharedValue(0);
  const fromSectionOpacity = useSharedValue(1);
  const toSectionOpacity = useSharedValue(1);

  const animatedFromSectionStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: fromSectionTranslateX.value }],
      opacity: fromSectionOpacity.value,
    };
  });

  const animatedToSectionStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: toSectionTranslateX.value }],
      opacity: toSectionOpacity.value,
    };
  });

  const { handleSwapWithAnimation } = useExchangeAnimations({
    fromSectionTranslateX,
    toSectionTranslateX,
    fromSectionOpacity,
    toSectionOpacity,
    handleSwapCurrencies,
    conversionDirection: state.conversionDirection,
  });

  const handleSwapWithAllAnimations = () => {
    const newDirection = state.conversionDirection === 'crypto-to-fiat' ? 'fiat-to-crypto' : 'crypto-to-fiat';
    handleSetConversionDirection(newDirection);
    
    handleSwapWithAnimation();
  };

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

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState error={{ message: error } as Error} onRetry={retry} />
      </SafeAreaView>
    );
  }

  const selectedCrypto = getSelectedCryptoDisplay();
  const selectedFiat = getSelectedFiatDisplay();

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ConversionDirectionToggle 
            direction={state.conversionDirection}
            onDirectionChange={(newDirection) => {
              // Trigger the same slide animation when toggle is used
              if (newDirection !== state.conversionDirection) {
                handleSwapWithAnimation();
              } else {
                handleSetConversionDirection(newDirection);
              }
            }}
          />

          <View style={styles.header}>
            <Text style={styles.subtitle}>Only the first input is editable. Want the other way around? Hit the toggle or swap icon</Text>
          </View>

          <View>
            <Animated.View style={animatedFromSectionStyle}>
              <CurrencyInputSection
                direction={state.conversionDirection}
                sectionType="from"
                selectedCrypto={selectedCrypto}
                selectedFiat={selectedFiat}
                amount={state.fromAmount}
                onAmountChange={(text) => {
                  const numericText = text.replace(/[^0-9.]/g, '');
                  const parts = numericText.split('.');
                  if (parts.length <= 2) {
                    handleAmountChange(numericText, 'fromAmount');
                  }
                }}
                onCurrencyPress={() => openCurrencySelector('from')}
                onRefresh={retry}
                isRefreshing={loadingStates.crypto}
                showRefreshButton={state.conversionDirection === 'crypto-to-fiat' && !!selectedCrypto}
                helpText="Type, change currency, or tap refresh to get fresh rates"
              />
            </Animated.View>

            <SwapButton 
              onPress={handleSwapWithAllAnimations}
              isLoading={loadingStates.rate || loadingStates.refreshing}
            />

            <Animated.View style={animatedToSectionStyle}>
              <CurrencyInputSection
                direction={state.conversionDirection}
                sectionType="to"
                selectedCrypto={selectedCrypto}
                selectedFiat={selectedFiat}
                amount={state.toAmount ? formatNumber(state.toAmount, 
                  state.conversionDirection === 'crypto-to-fiat' ? 2 : 8
                ) : ''}
                onAmountChange={(text) => handleAmountChange(text, 'toAmount')}
                onCurrencyPress={() => openCurrencySelector('to')}
                editable={false}
              />
            </Animated.View>
          </View>

          {(exchangeRate || state.fromCurrency || state.toCurrency) && !rateError && (
            <ExchangeRateInfo
              exchangeRate={exchangeRate || undefined}
              fromCurrencySymbol={state.conversionDirection === 'crypto-to-fiat' ? 
                selectedCrypto?.symbol?.toUpperCase() || 'CRYPTO' : selectedFiat}
              toCurrencySymbol={state.conversionDirection === 'crypto-to-fiat' ? 
                selectedFiat : selectedCrypto?.symbol?.toUpperCase() || 'CRYPTO'}
              conversionDirection={state.conversionDirection}
              lastFetchTime={lastFetchTime || undefined}
              currentTime={currentTime}
              onRefresh={retry}
              isRefreshing={loadingStates.refreshing}
            />
          )}

          <ConversionErrorInfo 
            error={rateError || undefined}
            conversionError={state.conversionError}
          />
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
    paddingTop: 16,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14, 
    color: colors.themeTextTertiary,
    textAlign: 'center',
  },
  helpText: {
    fontSize: 12,
    color: colors.themeTextTertiary,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 30,
  },



});

export default ExchangeScreen;