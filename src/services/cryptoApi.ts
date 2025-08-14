import { CryptoCurrency, CryptoListParams } from '../types/crypto';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

class CryptoApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'CryptoApiError';
  }
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 429) {
      console.warn('🚨 Rate limit exceeded (429)');
      console.warn('Response headers:', Object.fromEntries(response.headers.entries()));
    }
    throw new CryptoApiError(
      `API request failed: ${response.status} ${response.statusText}`,
      response.status
    );
  }
  return response.json();
};

export const cryptoApi = {
  getCryptoList: async (params: CryptoListParams = {}): Promise<CryptoCurrency[]> => {
    const searchParams = new URLSearchParams();
    
    const defaultParams = {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: '50',
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
    
    console.log('📡 API call:', url);
    
    try {
      const response = await fetch(url);
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

    console.log('🔍 Search:', query);

    try {
      const url = `${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query)}`;
      const response = await fetch(url);
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
    
    console.log('📡 Get by ID:', id);
    
    try {
      const response = await fetch(url);
      const data = await handleResponse(response);
      return data[0];
    } catch (error) {
      if (error instanceof CryptoApiError) {
        throw error;
      }
      throw new CryptoApiError(`Failed to fetch crypto: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

export { CryptoApiError };
