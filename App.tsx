import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { RateLimitProvider } from './src/contexts/RateLimitContext';
import { CryptoListProvider } from './src/contexts/CryptoListContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { configureGoogleSignIn } from './src/utils/googleAuth';
import GlobalStatusBar from './src/components/common/GlobalStatusBar';

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
        <ThemeProvider>
          <GlobalStatusBar />
          <RateLimitProvider>
            <CryptoListProvider>
              <GestureHandlerRootView>
                <AppNavigator />
              </GestureHandlerRootView>
            </CryptoListProvider>
          </RateLimitProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
