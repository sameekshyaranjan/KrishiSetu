import api from './api'

/**
 * KrishiSetu Authentication Service
 * Communicates with backend /api/auth routes.
 */
export const authService = {
  /**
   * Send OTP for Farmer registration
   */
  registerFarmer: async (data) => {
    const response = await api.post('/auth/register/farmer', data)
    return response.data
  },

  /**
   * Send OTP for Trader registration
   */
  registerTrader: async (data) => {
    const response = await api.post('/auth/register/trader', data)
    return response.data
  },

  /**
   * Verify Registration OTP and create user account
   */
  verifyRegistrationOTP: async ({ email, otp }) => {
    const response = await api.post('/auth/register/verify', { email, otp })
    const token = response.data.accessToken || response.data.token
    if (token && response.data.user) {
      authService.setAuthSession(token, response.data.refreshToken, response.data.user)
    }
    return { ...response.data, token }
  },

  /**
   * Login with Email & Password (Farmer or Trader)
   */
  login: async ({ email, password, role }) => {
    const response = await api.post('/auth/login', { email, password, role })
    const token = response.data.accessToken || response.data.token
    if (token && response.data.user) {
      authService.setAuthSession(token, response.data.refreshToken, response.data.user)
    }
    return { ...response.data, token }
  },

  /**
   * Request OTP for passwordless login
   */
  sendLoginOTP: async (email) => {
    const response = await api.post('/auth/login/otp', { email })
    return response.data
  },

  /**
   * Verify Passwordless Login OTP
   */
  verifyLoginOTP: async ({ email, otp }) => {
    const response = await api.post('/auth/login/otp/verify', { email, otp })
    const token = response.data.accessToken || response.data.token
    if (token && response.data.user) {
      authService.setAuthSession(token, response.data.refreshToken, response.data.user)
    }
    return { ...response.data, token }
  },

  /**
   * Admin Portal Direct Login
   */
  adminLogin: async ({ email, password }) => {
    const response = await api.post('/auth/admin/login', { email, password })
    const token = response.data.accessToken || response.data.token
    if (token && response.data.user) {
      authService.setAuthSession(token, response.data.refreshToken, response.data.user)
    }
    return { ...response.data, token }
  },

  /**
   * Send Password Reset Email
   */
  forgotPassword: async (email) => {
    const response = await api.post('/auth/password/forgot', { email })
    return response.data
  },

  /**
   * Reset Password with Token
   */
  resetPassword: async ({ token, newPassword }) => {
    const response = await api.post('/auth/password/reset', { token, newPassword })
    return response.data
  },

  /**
   * Refresh Expired Access Token
   */
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh-token', { refreshToken })
    const token = response.data.accessToken || response.data.token
    if (token) {
      localStorage.setItem('krishisetu_token', token)
    }
    return { ...response.data, token }
  },

  /**
   * Logout user and invalidate session
   */
  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore network errors during logout
    } finally {
      authService.clearAuthSession()
    }
  },

  /**
   * Store Auth Session in LocalStorage
   */
  setAuthSession: (token, refreshToken, user) => {
    localStorage.setItem('krishisetu_token', token)
    if (refreshToken) localStorage.setItem('krishisetu_refresh_token', refreshToken)
    if (user) localStorage.setItem('krishisetu_user', JSON.stringify(user))
  },

  /**
   * Clear Auth Session from LocalStorage
   */
  clearAuthSession: () => {
    localStorage.removeItem('krishisetu_token')
    localStorage.removeItem('krishisetu_refresh_token')
    localStorage.removeItem('krishisetu_user')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  /**
   * Get Current Stored User Object
   */
  getStoredUser: () => {
    try {
      const userStr = localStorage.getItem('krishisetu_user') || localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch {
      return null
    }
  },

  /**
   * Get Current Stored JWT Token
   */
  getStoredToken: () => {
    return localStorage.getItem('krishisetu_token') || localStorage.getItem('token') || null
  },
}

export default authService
