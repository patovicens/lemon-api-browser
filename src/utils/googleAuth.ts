import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { storeAuthSession, removeAuthSession, AuthUser } from './auth';

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: '555057284072-9a6ki7sf5pgpikka3kaft4f2upgsi8fj.apps.googleusercontent.com',
    offlineAccess: true,
    hostedDomain: '',
    forceCodeForRefreshToken: true,
  });
};

export const signIn = async (): Promise<AuthUser> => {
  try {
    console.log('Checking Play Services...');
    await GoogleSignin.hasPlayServices();
    console.log('Play Services available, attempting sign-in...');
    const userInfo = await GoogleSignin.signIn();
    console.log('Sign-in result:', userInfo);
    
    // Check if the result indicates cancellation
    if (userInfo && typeof userInfo === 'object' && userInfo.type === 'cancelled') {
      console.log('User cancelled sign-in (detected from result type)');
      throw new Error('Sign in was cancelled');
    }
    
    console.log('Sign-in successful, userInfo:', userInfo);
    
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
  } catch (error: any) {
    console.error('Google Sign-In error details:', {
      code: error.code,
      message: error.message,
      fullError: error
    });
    
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error('Sign in was cancelled');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      throw new Error('Sign in is already in progress');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Google Play Services not available on this device');
    } else if (error.code === statusCodes.SIGN_IN_REQUIRED) {
      throw new Error('Sign in required - please try again');
    } else {
      throw new Error(`Sign in failed: ${error.message || 'Unknown error occurred'}`);
    }
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await GoogleSignin.signOut();
    await removeAuthSession();
    console.log('Sign out successful');
  } catch (error) {
    console.error('Sign out error:', error);
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
      console.log('Found existing auth user:', authUser);
      return authUser;
    }
    
    // Fallback to Google's getCurrentUser if no stored session
    const currentUser = await GoogleSignin.getCurrentUser();
    if (currentUser && currentUser.idToken) {
      console.log('Found Google current user, storing session...');
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
