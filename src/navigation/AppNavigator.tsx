import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Alert, StatusBar } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
  faCoins, 
  faExchangeAlt, 
  faQrcode, 
  faUser 
} from '@fortawesome/free-solid-svg-icons';

import LoginScreen from '../screens/LoginScreen';
import CryptoListScreen from '../screens/CryptoListScreen';
import ExchangeScreen from '../screens/ExchangeScreen';
import ScannerScreen from '../screens/ScannerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoadingScreen from '../components/LoadingScreen';
import { getCurrentUser, signOut } from '../utils/googleAuth';
import { getCurrentAuthUser, removeAuthSession, AuthUser } from '../utils/auth';

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
const ProfileIcon = ({ color, size }: { color: string; size: number }) => (
  <FontAwesomeIcon icon={faUser} size={size} color={color} />
);

const MainTabs = ({ user, onLogout }: { user: AuthUser; onLogout: () => void }) => {
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
      <Tab.Screen 
        name="Profile" 
        options={{
          title: 'Profile',
          tabBarIcon: ProfileIcon,
        }}
      >
        {() => <ProfileScreen user={user} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkExistingUser();
  }, []);

  const checkExistingUser = async () => {
    try {
      console.log('Checking for existing user session...');
      // First try our auth system
      const authUser = await getCurrentAuthUser();
      if (authUser) {
        console.log('Found existing auth user:', authUser);
        setUser(authUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }
      
      // Fallback to Google's getCurrentUser
      const currentUser = await getCurrentUser();
      console.log('getCurrentUser result:', currentUser);
      if (currentUser) {
        console.log('Found existing user, setting authenticated to true');
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        console.log('No existing user found');
      }
    } catch (error) {
      console.log('No existing user session found');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (userData: AuthUser) => {
    console.log('handleLogin called with userData:', userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              await removeAuthSession();
              setUser(null);
              setIsAuthenticated(false);
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="MainApp">
            {(props) => <MainTabs {...props} user={user!} onLogout={handleLogout} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
