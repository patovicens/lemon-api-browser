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
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
  faChartLine, 
  faFilter, 
  faBolt,
  faSun,
  faMoon
} from '@fortawesome/free-solid-svg-icons';
import { signIn } from '../utils/googleAuth';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeColors } from '../theme';

const LoginScreen: React.FC = () => {
  const { handleLogin } = useAuth();
  const { colors, theme, toggleTheme } = useTheme();
  const styles = createStyles(colors);
  
  const [isLoading, setIsLoading] = useState(false);
  const handleGoogleSignIn = async () => {
    console.log('Starting Google Sign-In...');
    setIsLoading(true);
    try {
      const user = await signIn();
      console.log('Google Sign-In successful:', user);
      handleLogin(user);
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      
      if (error.message === 'Sign in was cancelled') {
        console.log('User cancelled sign-in - staying on login screen');
        return; 
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
      <View style={styles.themeToggleContainer}>
        <TouchableOpacity 
          style={styles.themeToggleButton}
          onPress={toggleTheme}
          activeOpacity={0.8}
        >
          <View style={styles.themeToggleContent}>
            <FontAwesomeIcon 
              icon={theme === 'dark' ? faSun : faMoon} 
              size={20} 
              color={colors.lemon} 
            />
            <Text style={styles.themeToggleText}>
              {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.backgroundGradient}>
        <View style={styles.topCircle} />
        <View style={styles.bottomCircle} />
      </View>

      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome</Text>
          <Text style={styles.welcomeSubtitle}>Sign in to access your crypto dashboard</Text>
        </View>

        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <FontAwesomeIcon icon={faChartLine} size={20} color={colors.lemon} />
            </View>
            <Text style={styles.featureText}>Real-time crypto tracking</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <FontAwesomeIcon icon={faFilter} size={20} color={colors.lemon} />
            </View>
            <Text style={styles.featureText}>Advanced filtering & sorting</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <FontAwesomeIcon icon={faBolt} size={20} color={colors.lemon} />
            </View>
            <Text style={styles.featureText}>Lightning-fast performance</Text>
          </View>
        </View>

        <View style={styles.signInSection}>
          <TouchableOpacity
            style={[styles.googleButton, isLoading && styles.googleButtonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.themeBackground} size="small" />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>
          
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.themeBackground,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topCircle: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.lemonGradient,
  },
  bottomCircle: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.lemonGradientLight,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  welcomeSection: {
    alignItems: 'center',
    marginTop: 60,
  },
  welcomeTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.themeText,
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: colors.themeTextSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresSection: {
    marginVertical: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lemonLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: colors.themeText,
    fontWeight: '500',
    flex: 1,
  },
  signInSection: {
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: colors.lemon,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 280,
    shadowColor: colors.lemon,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  googleButtonText: {
    color: colors.themeBackground,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.themeBackground,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  termsText: {
    fontSize: 12,
    color: colors.themeTextTertiary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  themeToggleContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  themeToggleButton: {
    backgroundColor: colors.themeSurface,
    borderWidth: 1,
    borderColor: colors.lemon,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: colors.lemon,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  themeToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.themeText,
  },
});

export default LoginScreen;
