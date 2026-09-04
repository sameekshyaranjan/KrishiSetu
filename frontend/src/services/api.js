import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor: Inject JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('krishisetu_token') || localStorage.getItem('token')
    if (token) {
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`)
      } else {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
        config.headers['Authorization'] = `Bearer ${token}`
      }
    }
    if (config.data instanceof FormData) {
      if (config.headers && typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type')
      } else if (config.headers) {
        delete config.headers['Content-Type']
        delete config.headers['content-type']
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle Global 401 Expiry & Error Extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message || 'API request failed'
    const isLoginEndpoint = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/admin/login')

    if (status === 401 && !isLoginEndpoint) {
      console.warn('Session expired or unauthorized. Clearing stored auth tokens.')
      localStorage.removeItem('token')
      localStorage.removeItem('krishisetu_token')
      localStorage.removeItem('user')
      localStorage.removeItem('krishisetu_user')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('krishisetu_auth_expired'))
      }
    }

    const customError = new Error(message)
    customError.response = error.response
    customError.status = status
    return Promise.reject(customError)
  }
)

/**
 * Auth API Endpoints
 */
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
  registerFarmer: (data) => api.post('/auth/register/farmer', data),
  registerTrader: (data) => api.post('/auth/register/trader', data),
  verifyOTP: (data) => api.post('/auth/register/verify', data),
  sendLoginOTP: (email) => api.post('/auth/login/otp', { email }),
  verifyLoginOTP: (data) => api.post('/auth/login/otp/verify', data),
  forgotPassword: (email) => api.post('/auth/password/forgot', { email }),
  resetPassword: (data) => api.post('/auth/password/reset', data),
  logout: () => api.post('/auth/logout')
}

/**
 * Mandi & Market Intelligence API
 */
export const mandiAPI = {
  getPrices: (params) => api.get('/prices/live', { params }),
  getTrends: (cropName) => api.get(`/prices/trends/${cropName}`)
}

/**
 * Government Welfare Schemes API
 */
export const schemesAPI = {
  getAll: (params) => api.get('/schemes', { params }),
  getById: (id) => api.get(`/schemes/${id}`)
}

export default api
