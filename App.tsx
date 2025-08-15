import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { RateLimitProvider } from './src/contexts/RateLimitContext';
import { CryptoListProvider } from './src/contexts/CryptoListContext';
import { configureGoogleSignIn } from './src/utils/googleAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});

const App = () => {
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RateLimitProvider>
          <CryptoListProvider>
            <AppNavigator />
          </CryptoListProvider>
        </RateLimitProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
