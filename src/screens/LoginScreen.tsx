import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signIn } from '../utils/googleAuth';
import { AuthUser } from '../utils/auth';

interface LoginScreenProps {
  onLogin: (user: AuthUser) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    console.log('Starting Google Sign-In...');
    setIsLoading(true);
    try {
      const user = await signIn();
      console.log('Google Sign-In successful:', user);
      onLogin(user);
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      
      if (error.message === 'Sign in was cancelled') {
        console.log('User cancelled sign-in - staying on login screen');
        return; // This should prevent onLogin from being called
      }
      
      const errorMessage = error.message || 'An unexpected error occurred during sign-in';
      console.log('Showing error alert:', errorMessage);
      Alert.alert('Sign In Error', errorMessage);
    } finally {
      console.log('Setting loading to false');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Lemon Challenge</Text>
        <Text style={styles.subtitle}>Welcome to your crypto app</Text>
        <TouchableOpacity
          style={[styles.googleButton, isLoading && styles.googleButtonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 50,
    textAlign: 'center',
  },
  googleButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  googleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
});

export default LoginScreen;
