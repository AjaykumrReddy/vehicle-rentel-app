import axios from 'axios';
import Config from 'react-native-config';

const api = axios.create({
  baseURL: Config.API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
});

export default api;
