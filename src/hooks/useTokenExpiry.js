import { useAlert } from './useAlert';
import { clearAuthData } from '../utils/storage';

export const useTokenExpiry = (navigation) => {
  const { showError } = useAlert();

  const handleTokenExpiry = async () => {
    await clearAuthData();
    
    showError(
      'Session Expired',
      'Your session has expired. Please log in again.',
      [
        {
          text: 'Login',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  const checkTokenExpiry = (error) => {
    if (
      error?.response?.status === 401 &&
      (error?.response?.data?.detail?.includes('expired') ||
       error?.response?.data?.detail?.includes('Token has expired'))
    ) {
      handleTokenExpiry();
      return true;
    }
    return false;
  };

  return { checkTokenExpiry };
};