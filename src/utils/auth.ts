import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser, AuthSession } from '../types/auth';

const AUTH_SESSION_KEY = '@auth_session';

export const storeAuthSession = async (user: AuthUser, idToken: string): Promise<void> => {
  try {
    const session: AuthSession = {
      user,
      idToken,
      expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour from now
    };
    
    await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    console.log('Auth session stored successfully');
  } catch (error) {
    console.error('Error storing auth session:', error);
    throw new Error('Failed to store authentication session');
  }
};


export const getAuthSession = async (): Promise<AuthSession | null> => {
  try {
    const sessionData = await AsyncStorage.getItem(AUTH_SESSION_KEY);
    if (!sessionData) {
      return null;
    }

    const session: AuthSession = JSON.parse(sessionData);
    
    if (Date.now() > session.expiresAt) {
      console.log('Auth session expired, removing...');
      await removeAuthSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error getting auth session:', error);
    return null;
  }
};

export const removeAuthSession = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_SESSION_KEY);
    console.log('Auth session removed successfully');
  } catch (error) {
    console.error('Error removing auth session:', error);
    throw new Error('Failed to remove authentication session');
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getAuthSession();
  return session !== null;
};

export const getCurrentAuthUser = async (): Promise<AuthUser | null> => {
  const session = await getAuthSession();
  return session?.user || null;
};

export const getCurrentIdToken = async (): Promise<string | null> => {
  const session = await getAuthSession();
  return session?.idToken || null;
};

export const refreshAuthSession = async (): Promise<void> => {
  const session = await getAuthSession();
  if (session) {
    await storeAuthSession(session.user, session.idToken);
  }
};
