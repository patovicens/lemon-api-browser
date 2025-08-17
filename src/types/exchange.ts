export interface ExchangeRateInfoProps {
  exchangeRate?: number;
  fromCurrencySymbol: string;
  toCurrencySymbol: string;
  conversionDirection: 'crypto-to-fiat' | 'fiat-to-crypto';
  lastFetchTime?: Date;
  currentTime: Date;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export interface ConversionErrorInfoProps {
  error?: string;
  conversionError?: string;
}
