import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { CryptoCurrency } from '../types/crypto';
import { useGetExchangeRates } from '../hooks/useGetExchangeRates';

export interface ExchangeState {
  fromCurrency: string;
  toCurrency: string;
  fromAmount: string;
  toAmount: string;
  conversionDirection: 'crypto-to-fiat' | 'fiat-to-crypto';
  lastFetchTime?: Date;
  conversionError?: string;
  conversionLoading?: boolean;
}

interface ExchangeContextType {
  state: ExchangeState;  
  exchangeRate: number | null;
  cryptoCurrencies: CryptoCurrency[];
  fiatCurrencies: string[];
  selectedCrypto: CryptoCurrency | null;
  currentPrice: number | null;
  isLoading: boolean;
  error: string | null;
  rateError: string | null;
  lastFetchTime: Date | null;
  loadingStates: {
    crypto: boolean;
    rate: boolean;
    refreshing: boolean;
  };
  
  updateState: (updates: Partial<ExchangeState>) => void;
  handleAmountChange: (amount: string, field: 'fromAmount' | 'toAmount') => void;
  handleCurrencySelect: (field: 'fromCurrency' | 'toCurrency', currency: string) => void;
  handleSwapCurrencies: () => void;
  handleSetConversionDirection: (direction: 'crypto-to-fiat' | 'fiat-to-crypto') => void;
  refreshRates: () => void;
  retry: () => void;
}

const ExchangeContext = createContext<ExchangeContextType | undefined>(undefined);

export const useExchange = () => {
  const context = useContext(ExchangeContext);
  if (context === undefined) {
    throw new Error('useExchange must be used within an ExchangeProvider');
  }
  return context;
};

interface ExchangeProviderProps {
  children: ReactNode;
}

export const ExchangeProvider: React.FC<ExchangeProviderProps> = ({ children }) => {
  const [state, setState] = useState<ExchangeState>({
    fromCurrency: 'bitcoin',
    toCurrency: 'usd',
    fromAmount: '',
    toAmount: '',
    conversionDirection: 'crypto-to-fiat',
    lastFetchTime: new Date(),
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const data = useGetExchangeRates(state.fromCurrency, state.toCurrency);

  const selectedCrypto = useMemo(() => {
    const cryptoId = state.conversionDirection === 'crypto-to-fiat' ? 
      state.fromCurrency : state.toCurrency;
    return data.cryptoCurrencies.find(c => c.id === cryptoId) || null;
  }, [data.cryptoCurrencies, state.conversionDirection, state.fromCurrency, state.toCurrency]);

  const currentPrice = useMemo(() => {
    return data.exchangeRate || selectedCrypto?.current_price;
  }, [data.exchangeRate, selectedCrypto]);

  useEffect(() => {
    if (data.exchangeRate && !data.loadingStates.rate) {
      setState(prev => ({ ...prev, lastFetchTime: new Date() }));
    }
  }, [data.exchangeRate, data.loadingStates.rate]);

  const updateState = useCallback((updates: Partial<ExchangeState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const convertAmount = useCallback((
    amount: string,
    direction: 'crypto-to-fiat' | 'fiat-to-crypto',
    exchangeRate: number
  ): { result: string; error?: string } => {
    if (!amount || isNaN(Number(amount)) || !exchangeRate) {
      return { result: '', error: 'Invalid input or exchange rate' };
    }

    try {
      const numAmount = Number(amount);
      let result: number;
      let decimals: number;

      switch (direction) {
        case 'crypto-to-fiat':
          result = numAmount * exchangeRate;
          decimals = 2; // Fiat decimals
          break;
        case 'fiat-to-crypto':
          result = numAmount * exchangeRate;
          decimals = 8; // Crypto decimals
          break;
        default:
          throw new Error('Invalid conversion direction');
      }

      return { result: result.toFixed(decimals) };
    } catch (err) {
      return { result: '', error: err instanceof Error ? err.message : 'Conversion failed' };
    }
  }, []);

  const swapCurrencies = useCallback((currentState: ExchangeState): ExchangeState => ({
    ...currentState,
    fromCurrency: currentState.toCurrency,
    toCurrency: currentState.fromCurrency,
    fromAmount: '',
    toAmount: '',
    conversionDirection: currentState.conversionDirection === 'crypto-to-fiat' ? 'fiat-to-crypto' : 'crypto-to-fiat',
  }), []);

  const updateConversionDirection = useCallback((
    currentState: ExchangeState,
    direction: 'crypto-to-fiat' | 'fiat-to-crypto',
    cryptoCurrencies: CryptoCurrency[]
  ): ExchangeState => {
    const newState = {
      ...currentState,
      conversionDirection: direction,
      fromAmount: currentState.fromAmount,
      toAmount: currentState.toAmount
    };


    if (direction === 'crypto-to-fiat') {
      // Ensure fromCurrency is crypto and toCurrency is fiat
      const currentFromIsCrypto = cryptoCurrencies.some(c => c.id === currentState.fromCurrency);
      if (!currentFromIsCrypto) {
        newState.fromCurrency = 'bitcoin';
        newState.toCurrency = currentState.fromCurrency;
        newState.fromAmount = '';
        newState.toAmount = '';
      }
    } else {
      // Ensure fromCurrency is fiat and toCurrency is crypto
      const currentFromIsCrypto = cryptoCurrencies.some(c => c.id === currentState.fromCurrency);
      if (currentFromIsCrypto) {
        newState.fromCurrency = currentState.toCurrency || 'usd';
        newState.toCurrency = currentState.fromCurrency;
        newState.fromAmount = '';
        newState.toAmount = '';
      }
    }

    return newState;
  }, []);

  const updateCurrency = useCallback((
    currentState: ExchangeState,
    field: 'fromCurrency' | 'toCurrency',
    currency: string
  ): ExchangeState => ({
    ...currentState,
    [field]: currency,
    fromAmount: field === 'fromCurrency' ? '' : currentState.fromAmount,
    toAmount: field === 'fromCurrency' ? '' : currentState.toAmount,
    conversionError: undefined
  }), []);

  const handleAmountChange = useCallback((
    amount: string,
    field: 'fromAmount' | 'toAmount'
  ) => {
    const newState = {
      ...state,
      [field]: amount,
      conversionError: undefined
    };

    if (field === 'fromAmount' && (!amount || amount === '')) {
      updateState({ ...newState, toAmount: '' });
      return;
    }

    const shouldConvert = Boolean(
      amount && 
      !isNaN(Number(amount)) && 
      Number(amount) > 0 && 
      state.fromCurrency && 
      state.toCurrency && 
      data.exchangeRate
    );

    if (shouldConvert && data.exchangeRate) {
      const direction = field === 'fromAmount' ? state.conversionDirection : 
        (state.conversionDirection === 'crypto-to-fiat' ? 'fiat-to-crypto' : 'crypto-to-fiat');

      const ratesAreStale = !state.lastFetchTime || 
        (new Date().getTime() - state.lastFetchTime.getTime()) > 30 * 1000;
      
      if (ratesAreStale) {
        updateState({ ...newState, conversionError: undefined });
        setIsRefreshing(true);
        data.retry().finally(() => setIsRefreshing(false));
      } else {
        const conversion = convertAmount(amount, direction, data.exchangeRate);
        
        if (conversion.error) {
          updateState({ ...newState, conversionError: conversion.error });
        } else {
          updateState({ ...newState, toAmount: conversion.result, conversionError: undefined });
        }
      }
    } else {
      updateState(newState);
    }
  }, [state, data, convertAmount, updateState]);

  const handleCurrencySelect = useCallback((field: 'fromCurrency' | 'toCurrency', currency: string) => {
    const newState = updateCurrency(state, field, currency);
    updateState(newState);
  }, [state, updateCurrency, updateState]);

  const handleSwapCurrencies = useCallback(() => {
    const newState = swapCurrencies(state);
    updateState(newState);
  }, [state, swapCurrencies, updateState]);

  const handleSetConversionDirection = useCallback((direction: 'crypto-to-fiat' | 'fiat-to-crypto') => {
    const newState = updateConversionDirection(state, direction, data.cryptoCurrencies);
    updateState(newState);
  }, [state, data.cryptoCurrencies, updateConversionDirection, updateState]);

  const handleRetry = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await data.retry();
      setState(prev => ({ ...prev, lastFetchTime: new Date() }));
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [data]);

  // Auto-recalculate when exchange rate changes (e.g., after currency change)
  React.useEffect(() => {
    if (data.exchangeRate && state.fromAmount && !isNaN(Number(state.fromAmount)) && Number(state.fromAmount) > 0) {
      const conversion = convertAmount(state.fromAmount, state.conversionDirection, data.exchangeRate);
      if (!conversion.error) {
        updateState({ toAmount: conversion.result, conversionError: undefined });
      }
    }
  }, [data.exchangeRate, state.conversionDirection, state.fromAmount, convertAmount, updateState]);

  const value: ExchangeContextType = {
    state,
    exchangeRate: data.exchangeRate,
    cryptoCurrencies: data.cryptoCurrencies,
    fiatCurrencies: data.fiatCurrencies,
    selectedCrypto,
    currentPrice,
    isLoading: data.loadingStates.crypto || data.loadingStates.fiat,
    error: data.cryptoError || data.fiatError,
    rateError: data.rateError,
    lastFetchTime: state.lastFetchTime,
    loadingStates: {
      ...data.loadingStates,
      refreshing: isRefreshing,
    },
    updateState,
    handleAmountChange,
    handleCurrencySelect,
    handleSwapCurrencies,
    handleSetConversionDirection,
    refreshRates: data.refreshRates,
    retry: handleRetry,
  };

  return <ExchangeContext.Provider value={value}>{children}</ExchangeContext.Provider>;
};
