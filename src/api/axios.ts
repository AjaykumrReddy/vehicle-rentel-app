import axios from 'axios';

const api = axios.create({
  baseURL: 'https://c9e41cc93170.ngrok-free.app', // Android emulator maps this to host localhost
  timeout: 10000,
});

export default api;
