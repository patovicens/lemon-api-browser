import { CryptoCurrency, CryptoListParams } from '../types/crypto';
import { FIAT_CURRENCY_NAMES } from '../utils/constants';

// TODO: move to .env
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const COINGECKO_API_KEY = 'CG-SGfJJPkMJBneFhqP3miR77US';

class CryptoApiError extends Error {
  constructor(
    message: string, 
    public status?: number,
    public code?: 'RATE_LIMIT' | 'NOT_FOUND' | 'SERVER_ERROR' | 'NETWORK_ERROR'
  ) {
    super(message);
    this.name = 'CryptoApiError';
  }
}

const createHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (typeof COINGECKO_API_KEY === 'string' && COINGECKO_API_KEY.trim() !== '') {
    headers['x-cg-demo-api-key'] = COINGECKO_API_KEY;
  }
  
  return headers;
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      throw new CryptoApiError(
        `Rate limit exceeded. ${retryAfter ? `Retry after ${retryAfter} seconds.` : ''}`,
        response.status,
        'RATE_LIMIT'
      );
    }
    const code = response.status >= 500 ? 'SERVER_ERROR' 
      : response.status === 404 ? 'NOT_FOUND'
      : undefined;
      
    throw new CryptoApiError(
      `API request failed: ${response.status} ${response.statusText}`,
      response.status,
      code
    );
  }
  return response.json();
};

// Added since coingecko doesn't display fiat currencies only
const isCryptoCurrency = async (currency: string): Promise<boolean> => {
  const fiatCurrencies = Object.keys(FIAT_CURRENCY_NAMES);
  
  return !fiatCurrencies.includes(currency.toLowerCase());
};

export const cryptoApi = {
  getCryptoList: async (params: CryptoListParams = {}): Promise<CryptoCurrency[]> => {
    const searchParams = new URLSearchParams();
    
    const defaultParams = {
      vs_currency: 'usd',
      per_page: '15',
      page: '1',
      sparkline: 'false',
      locale: 'en',
      ...params,
    };

    Object.entries(defaultParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const url = `${COINGECKO_BASE_URL}/coins/markets?${searchParams.toString()}`;
    
    try {
      const response = await fetch(url, {
        headers: createHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      if (error instanceof CryptoApiError) {
        throw error;
      }
      throw new CryptoApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  searchCrypto: async (query: string): Promise<CryptoCurrency[]> => {
    if (!query.trim()) {
      return [];
    }

    try {
      const url = `${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        headers: createHeaders(),
      });
      const searchData = await handleResponse(response);
      
      if (searchData.coins && searchData.coins.length > 0) {
        const coinIds = searchData.coins.slice(0, 20).map((coin: any) => coin.id).join(',');
        return await cryptoApi.getCryptoList({ ids: coinIds });
      }
      
      return [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  },

  getCryptoById: async (id: string): Promise<CryptoCurrency> => {
    const url = `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&ids=${id}&order=market_cap_desc&per_page=1&page=1&sparkline=false&locale=en`;
    
    try {
      const response = await fetch(url, {
        headers: createHeaders(),
      });
      const data = await handleResponse(response);
      
      if (!data || data.length === 0) {
        throw new CryptoApiError(`Cryptocurrency with id '${id}' not found`, 404);
      }
      
      return data[0];
    } catch (error) {
      if (error instanceof CryptoApiError) {
        throw error;
      }
      throw new CryptoApiError(`Failed to fetch crypto: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  getExchangeRate: async (fromCurrency: string, toCurrency: string): Promise<number> => {
    const fromIsCrypto = await isCryptoCurrency(fromCurrency);
    const toIsCrypto = await isCryptoCurrency(toCurrency);
    
    // CoinGecko simple/price endpoint requires crypto ID in 'ids' parameter
    // and target currency in 'vs_currencies' parameter
    // For fiat-to-crypto conversions, we get crypto-to-fiat rate and invert it
    let cryptoId: string;
    let fiatCurrency: string;
    let shouldInvert = false;
    
    if (fromIsCrypto && !toIsCrypto) {
      // Crypto to Fiat (normal case)
      cryptoId = fromCurrency;
      fiatCurrency = toCurrency;
    } else if (!fromIsCrypto && toIsCrypto) {
      cryptoId = toCurrency;
      fiatCurrency = fromCurrency;
      shouldInvert = true;
    } else {
      throw new CryptoApiError(`Invalid currency pair: ${fromCurrency} to ${toCurrency}. One must be crypto, one must be fiat.`);
    }
    
    const url = `${COINGECKO_BASE_URL}/simple/price?ids=${cryptoId}&vs_currencies=${fiatCurrency}`;
    
    try {
      const response = await fetch(url, {
        headers: createHeaders(),
      });
      const data = await handleResponse(response);
      
      if (!data || !data[cryptoId] || typeof data[cryptoId][fiatCurrency] !== 'number') {
        console.error('Invalid API response structure:', data);
        throw new CryptoApiError(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`, 404);
      }
      
      const rate = data[cryptoId][fiatCurrency];
      
      // Return the rate (inverted if we're doing fiat-to-crypto)
      const finalRate = shouldInvert ? (1 / rate) : rate;
      
      return finalRate;
    } catch (error) {
      if (error instanceof CryptoApiError) {
        throw error;
      }
      throw new CryptoApiError(`Failed to fetch exchange rate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

export { CryptoApiError };