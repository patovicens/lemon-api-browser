import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { AuthUser } from '../types/auth';
import { storeAuthSession, removeAuthSession } from './auth';

interface GoogleSignInError extends Error {
  code?: number;
}

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: '555057284072-0l787shsjnukmqj5euhguj3anmj8d6si.apps.googleusercontent.com',
    offlineAccess: true,
    hostedDomain: '',
    forceCodeForRefreshToken: true,
  });
};

export const signIn = async (): Promise<AuthUser> => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    // Check if the result indicates cancellation
    if (userInfo && typeof userInfo === 'object' && userInfo.type === 'cancelled') {
      throw new Error('Sign in was cancelled');
    }
    
    
    // Handle the nested data structure
    if (userInfo.data && userInfo.data.idToken) {
      const authUser: AuthUser = {
        id: userInfo.data.user.id,
        name: userInfo.data.user.name || '',
        email: userInfo.data.user.email || '',
        photo: userInfo.data.user.photo || null,
        familyName: userInfo.data.user.familyName || '',
        givenName: userInfo.data.user.givenName || '',
      };
      
      await storeAuthSession(authUser, userInfo.data.idToken);
      return authUser;
    } else {
      throw new Error('No ID token received from Google Sign-In');
    }
  } catch (error: unknown) {
    const googleError = error as GoogleSignInError;
    console.error('Google Sign-In error details:', {
      code: googleError.code,
      message: googleError.message,
      fullError: error
    });
    
    if (googleError.code && googleError.code === Number(statusCodes.SIGN_IN_CANCELLED)) {
      throw new Error('Sign in was cancelled');
    } else if (googleError.code && googleError.code === Number(statusCodes.IN_PROGRESS)) {
      throw new Error('Sign in is already in progress');
    } else if (googleError.code && googleError.code === Number(statusCodes.PLAY_SERVICES_NOT_AVAILABLE)) {
      throw new Error('Google Play Services not available on this device');
    } else if (googleError.code && googleError.code === Number(statusCodes.SIGN_IN_REQUIRED)) {
      throw new Error('Sign in required - please try again');
    } else {
      const errorMessage = googleError.message || 'Unknown error occurred';
      throw new Error(`Sign in failed: ${errorMessage}`);
    }
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await GoogleSignin.signOut();
    await removeAuthSession();
  } catch (error) {
    // Still try to remove local session even if Google sign out fails
    await removeAuthSession();
    throw error;
  }
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { getCurrentAuthUser } = await import('./auth');
    const authUser = await getCurrentAuthUser();
    
    if (authUser) {
      return authUser;
    }
    
    // Fallback to Google's getCurrentUser if no stored session
    const currentUser = await GoogleSignin.getCurrentUser();
    if (currentUser && currentUser.idToken) {
      const googleAuthUser: AuthUser = {
        id: currentUser.user.id,
        name: currentUser.user.name || '',
        email: currentUser.user.email || '',
        photo: currentUser.user.photo || null,
        familyName: currentUser.user.familyName || '',
        givenName: currentUser.user.givenName || '',
      };
      
      await storeAuthSession(googleAuthUser, currentUser.idToken);
      return googleAuthUser;
    }
    
    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

export const revokeAccess = async (): Promise<void> => {
  try {
    await GoogleSignin.revokeAccess();
    await removeAuthSession();
  } catch (error) {
    console.error('Revoke access error:', error);
    throw error;
  }
};
