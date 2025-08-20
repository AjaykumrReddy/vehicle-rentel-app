import axios from 'axios';
import { Config } from '../config';

const api = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: Config.API_TIMEOUT,
});

export default api;
