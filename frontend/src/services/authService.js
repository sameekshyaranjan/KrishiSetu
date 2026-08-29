import api from './api'

/**
 * KrishiSetu Authentication Service
 * Communicates with backend /api/auth routes.
 */
export const authService = {
  /**
   * Send OTP for Farmer registration
   */
  registerFarmer: async (formData) => {
    const res = await api.post('/auth/register/farmer', formData)
    return res?.data || res
  },

  /**
   * Send OTP for Trader registration
   */
  registerTrader: async (formData) => {
    const res = await api.post('/auth/register/trader', formData)
    return res?.data || res
  },

  /**
   * Verify Registration OTP and create user account
   */
  verifyRegistrationOTP: async ({ email, otp }) => {
    const res = await api.post('/auth/register/verify', { email, otp })
    const data = res?.data || res
    const token = data.accessToken || data.token
    if (token && data.user) {
      authService.setAuthSession(token, data.refreshToken, data.user)
    }
    return { ...data, token }
  },

  /**
   * Login with Email & Password (Farmer or Trader)
   */
  login: async ({ email, password, role }) => {
    const res = await api.post('/auth/login', { email, password, role })
    const data = res?.data || res
    const token = data.accessToken || data.token
    if (token && data.user) {
      authService.setAuthSession(token, data.refreshToken, data.user)
    }
    return { ...data, token }
  },

  /**
   * Request OTP for passwordless login
   */
  sendLoginOTP: async (email) => {
    const res = await api.post('/auth/login/otp', { email })
    return res?.data || res
  },

  /**
   * Verify Passwordless Login OTP
   */
  verifyLoginOTP: async ({ email, otp }) => {
    const res = await api.post('/auth/login/otp/verify', { email, otp })
    const data = res?.data || res
    const token = data.accessToken || data.token
    if (token && data.user) {
      authService.setAuthSession(token, data.refreshToken, data.user)
    }
    return { ...data, token }
  },

  /**
   * Admin Portal Direct Login
   */
  adminLogin: async ({ email, password }) => {
    const res = await api.post('/auth/admin/login', { email, password })
    const data = res?.data || res
    const token = data.accessToken || data.token
    if (token && data.user) {
      authService.setAuthSession(token, data.refreshToken, data.user)
    }
    return { ...data, token }
  },

  /**
   * Send Password Reset Email
   */
  forgotPassword: async (email) => {
    const res = await api.post('/auth/password/forgot', { email })
    return res?.data || res
  },

  /**
   * Reset Password with Token
   */
  resetPassword: async ({ token, newPassword }) => {
    const res = await api.post('/auth/password/reset', { token, newPassword })
    return res?.data || res
  },

  /**
   * Refresh Expired Access Token
   */
  refreshToken: async (refreshToken) => {
    const res = await api.post('/auth/refresh-token', { refreshToken })
    const data = res?.data || res
    const token = data.accessToken || data.token
    if (token) {
      localStorage.setItem('krishisetu_token', token)
    }
    return { ...data, token }
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
    if (token) {
      localStorage.setItem('krishisetu_token', token)
      localStorage.setItem('token', token)
    }
    if (refreshToken) localStorage.setItem('krishisetu_refresh_token', refreshToken)
    if (user) {
      localStorage.setItem('krishisetu_user', JSON.stringify(user))
      localStorage.setItem('user', JSON.stringify(user))
    }
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
    localStorage.removeItem('krishisetu_farmer_crops')
    localStorage.removeItem('krishisetu_farmer_orders')
    localStorage.removeItem('krishisetu_trader_orders')
    localStorage.removeItem('krishisetu_farmer_notifs')
    localStorage.removeItem('krishisetu_trader_notifs')
    localStorage.removeItem('krishisetu_trader_bids')
    localStorage.removeItem('krishisetu_trader_escrow')
    localStorage.removeItem('krishisetu_disputes')
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
