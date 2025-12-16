import { NavigationContainerRef } from '@react-navigation/native';
import { clearAuthData } from '../utils/storage';

let navigationRef: NavigationContainerRef<any> | null = null;

export const setNavigationRef = (ref: NavigationContainerRef<any>) => {
  navigationRef = ref;
};

export const handleTokenExpiry = async () => {
  try {
    // Clear all auth data
    await clearAuthData();
    
    // Navigate to login screen
    if (navigationRef) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  } catch (error) {
    console.error('Error handling token expiry:', error);
  }
};

export const isTokenExpiredError = (error: any): boolean => {
  return (
    error?.response?.status === 401 &&
    (error?.response?.data?.detail?.includes('expired') ||
     error?.response?.data?.detail?.includes('Token has expired'))
  );
};