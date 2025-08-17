import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { RateLimitProvider } from './src/contexts/RateLimitContext';
import { HomeProvider } from './src/contexts/HomeContext';
import { ExchangeProvider } from './src/contexts/ExchangeContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { ScannerProvider } from './src/contexts/ScannerContext';
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
            <HomeProvider>
              <ExchangeProvider>
                <ScannerProvider>
                  <GestureHandlerRootView>
                    <AppNavigator />
                  </GestureHandlerRootView>
                </ScannerProvider>
              </ExchangeProvider>
            </HomeProvider>
          </RateLimitProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
