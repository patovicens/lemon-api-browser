export interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
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
