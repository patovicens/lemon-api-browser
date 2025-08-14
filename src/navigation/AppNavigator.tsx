import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
  faCoins, 
  faExchangeAlt, 
  faQrcode
} from '@fortawesome/free-solid-svg-icons';

import LoginScreen from '../screens/LoginScreen';
import CryptoListScreen from '../screens/CryptoListScreen';
import ExchangeScreen from '../screens/ExchangeScreen';
import ScannerScreen from '../screens/ScannerScreen';

import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../contexts/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const CryptoListTab = () => <CryptoListScreen />;
const ExchangeTab = () => <ExchangeScreen />;
const ScannerTab = () => <ScannerScreen />;

const CryptoListIcon = ({ color, size }: { color: string; size: number }) => (
  <FontAwesomeIcon icon={faCoins} size={size} color={color} />
);
const ExchangeIcon = ({ color, size }: { color: string; size: number }) => (
  <FontAwesomeIcon icon={faExchangeAlt} size={size} color={color} />
);
const ScannerIcon = ({ color, size }: { color: string; size: number }) => (
  <FontAwesomeIcon icon={faQrcode} size={size} color={color} />
);


const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4285F4',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
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
        name="CryptoList" 
        component={CryptoListTab}
        options={{
          title: 'Crypto List',
          tabBarIcon: CryptoListIcon,
        }}
      />
      <Tab.Screen 
        name="Exchange" 
        component={ExchangeTab}
        options={{
          title: 'Exchange',
          tabBarIcon: ExchangeIcon,
        }}
      />
      <Tab.Screen 
        name="Scanner" 
        component={ScannerTab}
        options={{
          title: 'Scanner',
          tabBarIcon: ScannerIcon,
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
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
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
