import axios from 'axios';

// Create a master instance pointing to your Node.js server
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically attach the JWT token to every request if the user is logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lectro_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;