import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Centralized Axios Instance for KrishiSetu
 * Automatically handles baseURL, headers, timeouts, and auth interceptors.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15-second timeout for poor network resilience
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach JWT Bearer Token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('krishisetu_token') || localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Centralized error handling & session expiration
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Check for expired or invalid JWT token
    if (error.response && error.response.status === 401) {
      // Clear expired local session
      localStorage.removeItem('krishisetu_token')
      localStorage.removeItem('token')
      localStorage.removeItem('krishisetu_user')
      localStorage.removeItem('user')

      // Avoid infinite redirect loops if already on an auth page
      const currentPath = window.location.pathname
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        // Dispatch custom event so AuthContext can handle logout gracefully
        window.dispatchEvent(new Event('krishisetu_auth_expired'))
      }
    }

    return Promise.reject(error)
  }
)

export default api
export { api }
