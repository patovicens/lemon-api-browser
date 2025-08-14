import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { getCurrentUser, signOut } from '../utils/googleAuth';
import { AuthUser } from '../utils/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  handleLogin: (userData: AuthUser) => void;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkExistingUser();
  }, []);

  const checkExistingUser = async () => {
    try {
      console.log('Checking for existing user session...');
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

  const value = {
    isAuthenticated,
    user,
    isLoading,
    handleLogin,
    handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
