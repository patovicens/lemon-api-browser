import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Alert } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import CryptoListScreen from '../screens/CryptoListScreen';
import ExchangeScreen from '../screens/ExchangeScreen';
import ScannerScreen from '../screens/ScannerScreen';
import { getCurrentUser, signOut } from '../utils/googleAuth';
import { getCurrentAuthUser, removeAuthSession, AuthUser } from '../utils/auth';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4285F4',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen 
        name="CryptoList" 
        options={{
          title: 'Crypto List',
        }}
      >
        {(props) => <CryptoListScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Exchange" 
        component={ExchangeScreen}
        options={{
          title: 'Exchange',
        }}
      />
      <Tab.Screen 
        name="Scanner" 
        component={ScannerScreen}
        options={{
          title: 'Scanner',
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [_user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing user session on app start
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
    return null; // TODO: Add loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="MainApp">
            {(props) => <MainTabs {...props} onLogout={handleLogout} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
