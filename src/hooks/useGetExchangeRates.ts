import { useQuery } from '@tanstack/react-query';
import { cryptoApi } from '../services/cryptoApi';
import { getSupportedFiatCurrencies } from '../utils/constants';
import { useQueryErrorConfig } from '../utils/queryErrorConfig';

export const useGetExchangeRates = (fromCurrency: string, toCurrency: string) => {
  const queryErrorConfig = useQueryErrorConfig();
  const {
    data: cryptoCurrencies = [],
    isLoading: cryptoLoading,
    error: cryptoError,
    refetch: refetchCrypto
  } = useQuery({
    queryKey: ['cryptoCurrencies'],
    queryFn: () => cryptoApi.getCryptoList({ per_page: 50 }),
    staleTime: 15 * 1000,
    ...queryErrorConfig,
  });

  const {
    data: fiatCurrencies = [],
    isLoading: fiatLoading,
    error: fiatError,
    refetch: refetchFiat
  } = useQuery({
    queryKey: ['fiatCurrencies'],
    queryFn: () => getSupportedFiatCurrencies(),
    staleTime: 30 * 60 * 1000, 
  });

  const {
    data: exchangeRate,
    isLoading: rateLoading,
    error: rateError,
    refetch: refreshRates
  } = useQuery({
    queryKey: ['exchangeRate', fromCurrency, toCurrency],
    queryFn: async () => {
      const rate = await cryptoApi.getExchangeRate(fromCurrency, toCurrency);
      return rate;
    },
    enabled: Boolean(fromCurrency && toCurrency),
    staleTime: 15 * 1000,
    ...queryErrorConfig,
  });

  const retry = async () => {
    await Promise.all([
      refetchCrypto({ throwOnError: false }),
      refetchFiat({ throwOnError: false }),
      refreshRates({ throwOnError: false })
    ]);
  };

  return {
    cryptoCurrencies,
    fiatCurrencies,
    exchangeRate,
    loadingStates: {
      crypto: cryptoLoading,
      fiat: fiatLoading,
      rate: rateLoading,
    },
    cryptoError: cryptoError ? (cryptoError instanceof Error ? cryptoError.message : 'Failed to fetch crypto data') : null,
    fiatError: fiatError ? (fiatError instanceof Error ? fiatError.message : 'Failed to fetch fiat data') : null,
    rateError: rateError ? (rateError instanceof Error ? rateError.message : 'Exchange rate not available') : null,
    refreshRates,
    retry,
  };
};