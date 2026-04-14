import axios from 'axios'

const HttpClient = axios.create({
  baseURL: import.meta.env.VITE_REST_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add interceptors here if needed (e.g., for security/auth)
HttpClient.interceptors.request.use((config) => {
  // Example: config.headers.Authorization = `Bearer ${token}`
  return config
})

export default HttpClient
