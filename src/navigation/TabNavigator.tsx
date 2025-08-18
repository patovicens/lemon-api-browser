import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
  faExchangeAlt, 
  faLemon, 
  faQrcode
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../contexts/ThemeContext';

import HomeNavigator from './HomeNavigator';
import ExchangeNavigator from './ExchangeNavigator';
import ScannerNavigator from './ScannerNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const HomeIcon = ({ color, size }: { color: string; size: number }) => (
  <FontAwesomeIcon icon={faLemon} size={size} color={color} />
);

const ExchangeIcon = ({ color, size }: { color: string; size: number }) => (
  <FontAwesomeIcon icon={faExchangeAlt} size={size} color={color} />
);

const ScannerIcon = ({ color, size }: { color: string; size: number }) => (
  <FontAwesomeIcon icon={faQrcode} size={size} color={color} />
);

const TabNavigator = () => {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      id={undefined}
      initialRouteName="Home"
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
          height: Platform.OS === 'ios' ? 80 : 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen 
        name="Exchange" 
        component={ExchangeNavigator}
        options={{
          title: 'Exchange',
          tabBarIcon: ExchangeIcon,
        }}
      />
      <Tab.Screen 
        name="Home" 
        component={HomeNavigator}
        options={{
          title: 'Home',
          tabBarIcon: HomeIcon,
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

export default TabNavigator;
