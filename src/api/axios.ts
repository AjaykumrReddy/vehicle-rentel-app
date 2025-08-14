import axios from 'axios';

const api = axios.create({
  baseURL: 'https://24ad00acaeec.ngrok-free.app', // Android emulator maps this to host localhost
  timeout: 10000,
});

export default api;
