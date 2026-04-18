import axios from 'axios'

const HttpClient = axios.create({
  baseURL: import.meta.env.VITE_REST_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add interceptors here for security/auth
HttpClient.interceptors.request.use((config) => {
  const secret = import.meta.env.VITE_INTERNAL_API_SECRET;
  if (secret) {
    config.headers.Authorization = `Bearer ${secret}`;
  }
  return config;
});

export default HttpClient
