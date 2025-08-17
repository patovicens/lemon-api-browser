import { CryptoCurrency } from '../types/crypto';
import { SortOption, FilterOption } from '../components/home/FilterSortBar';

type CryptoValue = string | number | null | undefined | { times: number; currency: string; percentage: number };

// ** Client-side Sorting and Filtering 
//  since CoinGecko API doesn't support all sorting and filtering options
//  this is a workaround to get the desired results

export const sortCryptocurrencies = (cryptos: CryptoCurrency[], sort: SortOption): CryptoCurrency[] => {
  const validCryptos = cryptos.filter(crypto => crypto && crypto.id && crypto.name);
  
  return [...validCryptos].sort((a, b) => {
    let aValue: CryptoValue = a[sort.key as keyof CryptoCurrency];
    let bValue: CryptoValue = b[sort.key as keyof CryptoCurrency];

    if (aValue === null || aValue === undefined) aValue = Infinity;
    if (bValue === null || bValue === undefined) bValue = Infinity;

    if (typeof aValue === 'object' && aValue !== null && 'percentage' in aValue) {
      aValue = (aValue as { percentage: number }).percentage;
    }
    if (typeof bValue === 'object' && bValue !== null && 'percentage' in bValue) {
      bValue = (bValue as { percentage: number }).percentage;
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = typeof bValue === 'string' ? bValue.toLowerCase() : '';
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      if (sort.direction === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    }

    if (sort.direction === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });
};

export const filterCryptocurrencies = (cryptos: CryptoCurrency[], filters: FilterOption[]): CryptoCurrency[] => {
  if (filters.length === 0) return cryptos;

  const result = cryptos.filter(crypto => {
    return filters.every(filter => {
      switch (filter.key) {
        case 'positive':
          return crypto.price_change_percentage_24h !== null && crypto.price_change_percentage_24h > 0;
        
        case 'negative':
          return crypto.price_change_percentage_24h !== null && crypto.price_change_percentage_24h < 0;
        
        case 'price_range_custom':
          if (typeof filter.value === 'object' && 'min' in filter.value && 'max' in filter.value) {
            const { min, max } = filter.value as { min: number; max: number };
            const passes = crypto.current_price !== null && 
                   crypto.current_price >= min && 
                   (max === Infinity || crypto.current_price <= max);
            
            
            return passes;
          }
          return true;
        
        default:
          return true;
      }
    });
  });
  
  return result;
};