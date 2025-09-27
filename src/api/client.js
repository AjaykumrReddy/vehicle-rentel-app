import { Config } from "../config";
import { getAuthToken } from "../utils/storage";
const API_BASE_URL = Config.API_BASE_URL;


const apiRequest = async (endpoint, options = {}) => {
  try {
    console.log("endpoint - ",endpoint , "options - ", options)
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`,
        ...options.headers
      },
      ...options
    });
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }
    console.log("data - ", data)
    return { success: response.ok, data, error: !response.ok ? data : null };
  } catch (error) {
    console.error('API request error:', error);
    return { success: false, error: error.message };
  }
};

export const apiClient = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, data) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
};