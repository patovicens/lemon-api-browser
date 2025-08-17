import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

type RootStackParamList = {
  Login: undefined;
  MainApp: undefined;
};

type MainTabParamList = {
  Home: undefined;
  Exchange: undefined;
  Scanner: undefined;
};
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

import LoadingScreen from '../components/common/LoadingScreen';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const HomeTab = () => <HomeScreen />;
const ExchangeTab = () => <ExchangeScreen />;
const ScannerTab = () => <ScannerScreen />;

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
        component={HomeTab}
        options={{
          title: 'Home',
          tabBarIcon: HomeIcon,
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
