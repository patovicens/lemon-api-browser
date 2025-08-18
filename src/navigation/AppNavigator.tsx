import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import {
  RootStackParamList,
  MainTabParamList,
  HomeStackParamList,
  ExchangeStackParamList,
  ScannerStackParamList,
} from './types';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
  faCoins, 
  faExchangeAlt, 
  faQrcode
} from '@fortawesome/free-solid-svg-icons';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ExchangeScreen from '../screens/ExchangeScreen';
import ScannerScreen from '../screens/ScannerScreen';
import ScanResultSummary from '../components/scanner/ScanResultSummary';
import ScanHistory from '../components/scanner/ScanHistory';

import LoadingScreen from '../components/common/LoadingScreen';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const ExchangeStack = createStackNavigator<ExchangeStackParamList>();
const ScannerStack = createStackNavigator<ScannerStackParamList>();

const HomeNavigator = () => {
  return (
    <HomeStack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    </HomeStack.Navigator>
  );
};

const ExchangeNavigator = () => {
  return (
    <ExchangeStack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <ExchangeStack.Screen name="ExchangeMain" component={ExchangeScreen} />
    </ExchangeStack.Navigator>
  );
};

const ScannerNavigator = () => {
  return (
    <ScannerStack.Navigator 
      id={undefined} 
      screenOptions={{ 
        headerShown: false
      }}
    >
      <ScannerStack.Screen name="ScannerMain" component={ScannerScreen} />
      <ScannerStack.Screen name="ScanResult" component={ScanResultSummary} />
      <ScannerStack.Screen name="ScanHistory" component={ScanHistory} />
    </ScannerStack.Navigator>
  );
};

const HomeIcon = ({ color, size }: { color: string; size: number }) => (
  <FontAwesomeIcon icon={faCoins} size={size} color={color} />
);
const ExchangeIcon = ({ color, size }: { color: string; size: number }) => (
  <FontAwesomeIcon icon={faExchangeAlt} size={size} color={color} />
);
const ScannerIcon = ({ color, size }: { color: string; size: number }) => (
  <FontAwesomeIcon icon={faQrcode} size={size} color={color} />
);


const MainTabs = () => {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.lemon,
        tabBarInactiveTintColor: colors.themeTextSecondary,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.themeSurface,
          borderTopWidth: 1,
          borderTopColor: colors.themeBorder,
          paddingBottom: 20,
          paddingTop: 5,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeNavigator}
        options={{
          title: 'Home',
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen 
        name="Exchange" 
        component={ExchangeNavigator}
        options={{
          title: 'Exchange',
          tabBarIcon: ExchangeIcon,
        }}
      />
      <Tab.Screen 
        name="Scanner" 
        component={ScannerNavigator}
        options={{
          title: 'Scanner',
          tabBarIcon: ScannerIcon,
          tabBarStyle: { display: 'none' }
        }}
      />

    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="MainApp" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
