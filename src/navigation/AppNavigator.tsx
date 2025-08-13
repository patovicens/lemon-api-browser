import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Alert } from 'react-native';

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

const MainTabs = ({ user, onLogout }: { user: AuthUser; onLogout: () => void }) => {
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
        component={CryptoListScreen}
        options={{
          title: 'Crypto List',
        }}
      />
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
      <Tab.Screen 
        name="Profile" 
        options={{
          title: 'Profile',
        }}
      >
        {(props) => <ProfileScreen {...props} user={user} onLogout={onLogout} />}
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
