import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { RateLimitProvider } from './src/contexts/RateLimitContext';
import { HomeProvider } from './src/contexts/HomeContext';
import { ExchangeProvider } from './src/contexts/ExchangeContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { ScannerProvider } from './src/contexts/ScannerContext';
import GlobalStatusBar from './src/components/common/GlobalStatusBar';
import SplashScreen from './src/components/common/SplashScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return (
      <ThemeProvider>
        <SplashScreen onAnimationComplete={handleSplashComplete} />
      </ThemeProvider>
    );
  }

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
