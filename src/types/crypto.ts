export interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  market_cap: number | null;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number | null;
  high_24h: number | null;
  low_24h: number | null;
  price_change_24h: number | null;
  price_change_percentage_24h: number | null;
  market_cap_change_24h: number | null;
  market_cap_change_percentage_24h: number | null;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: {
    times: number;
    currency: string;
    percentage: number;
  } | null;
  last_updated: string;
}

export interface CryptoListParams {
  page?: number;
  per_page?: number;
  vs_currency?: string;
  order?: 'market_cap_desc' | 'market_cap_asc' | 'volume_desc' | 'volume_asc' | 'id_desc' | 'id_asc' | 'gecko_desc' | 'gecko_asc' | 'price_desc' | 'price_asc' | 'price_change_percentage_24h_desc' | 'price_change_percentage_24h_asc' | 'market_cap_change_24h_desc' | 'market_cap_change_24h_asc';
  sparkline?: boolean;
  price_change_percentage?: string;
  locale?: string;
  ids?: string;
}

export interface CryptoListResponse {
  data: CryptoCurrency[];
  total: number;
  page: number;
  per_page: number;
}

export type WalletType = 'BTC' | 'ETH' | 'LTC' | 'BCH' | 'XRP' | 'ADA' | 'DOT' | 'LINK' | 'SOL' | 'TRX' | 'UNKNOWN';

export interface WalletScanResult {
  address: string;
  type: WalletType;
  timestamp: number;
  isFavorite: boolean;
  rawContent?: string;
}

export interface ScannedWallet {
  id: string;
  address: string;
  type: WalletType;
  timestamp: number;
  isFavorite: boolean;
  notes?: string;
}

export interface WalletAddress {
  address: string;
  type: WalletType;
}

export interface SearchCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
}

export interface SearchResponse {
  coins: SearchCoin[];
  categories: Array<{ id: number; name: string }>;
  exchanges: Array<{ id: string; name: string }>;
}

export interface CryptoApiError extends Error {
  status?: number;
  code?: 'RATE_LIMIT' | 'NOT_FOUND' | 'SERVER_ERROR' | 'NETWORK_ERROR';
}

export const createCryptoApiError = (
  message: string,
  status?: number,
  code?: 'RATE_LIMIT' | 'NOT_FOUND' | 'SERVER_ERROR' | 'NETWORK_ERROR'
): CryptoApiError => {
  const error = new Error(message) as CryptoApiError;
  error.name = 'CryptoApiError';
  error.status = status;
  error.code = code;
  return error;
};
