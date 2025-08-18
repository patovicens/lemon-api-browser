import React, { createContext, useContext, useState, useCallback } from 'react';

interface RateLimitContextType {
  isRateLimited: boolean;
  setRateLimited: (limited: boolean) => void;
  handle429Error: () => void;
  resetRateLimit: () => void;
}

const RateLimitContext = createContext<RateLimitContextType | undefined>(undefined);

export const useRateLimit = () => {
  const context = useContext(RateLimitContext);
  if (!context) {
    throw new Error('useRateLimit must be used within a RateLimitProvider');
  }
  return context;
};

interface RateLimitProviderProps {
  children: React.ReactNode;
  cooldownMs?: number;
}

export const RateLimitProvider: React.FC<RateLimitProviderProps> = ({ 
  children, 
  cooldownMs = 30000 
}) => {
  const [isRateLimited, setIsRateLimited] = useState(false);

  const setRateLimited = useCallback((limited: boolean) => {
    setIsRateLimited(limited);
  }, []);

  const handle429Error = useCallback(() => {
    if (!isRateLimited) {
      setIsRateLimited(true);
      
      setTimeout(() => {
        setIsRateLimited(false);
      }, cooldownMs);
    }
  }, [isRateLimited, cooldownMs]);

  const resetRateLimit = useCallback(() => {
    setIsRateLimited(false);
  }, []);

  const value: RateLimitContextType = {
    isRateLimited,
    setRateLimited,
    handle429Error,
    resetRateLimit,
  };

  return (
    <RateLimitContext.Provider value={value}>
      {children}
    </RateLimitContext.Provider>
  );
};
