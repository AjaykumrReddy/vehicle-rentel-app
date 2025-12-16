import axios from 'axios';
import { Config } from '../config';
import { handleTokenExpiry, isTokenExpiredError } from '../services/authInterceptor';

const api = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: Config.API_TIMEOUT,
});

// Response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (isTokenExpiredError(error)) {
      await handleTokenExpiry();
    }
    return Promise.reject(error);
  }
);

export default api;
