import { useRateLimit } from '../contexts/RateLimitContext';
import { CryptoApiError } from '../types/crypto';

export const useQueryErrorConfig = () => {
  const { handle429Error } = useRateLimit();

  return {
    retry: (failureCount: number, error: unknown) => {
      const apiError = error as CryptoApiError;
      
      if (apiError?.status === 429 || apiError?.code === 'RATE_LIMIT') {
        handle429Error();
        return false;
      }
      
      if (apiError?.status === 404 || apiError?.code === 'NOT_FOUND') {
        return false;
      }
      
      if (apiError?.status && (apiError?.status >= 500 || apiError?.code === 'SERVER_ERROR' || apiError?.code === 'NETWORK_ERROR')) {
        return failureCount < 3;
      }
      
      return false;
    },
    
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  };
};
