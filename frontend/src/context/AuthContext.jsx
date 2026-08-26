import { createContext, useState, useEffect, useCallback } from 'react'
import authService from '@/services/authService'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state from storage on app load
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = authService.getStoredToken()
        const storedUser = authService.getStoredUser()

        if (storedToken && storedUser) {
          if (!storedUser.role) {
            storedUser.role = storedUser.gstNumber ? 'trader' : 'farmer'
          }
          setToken(storedToken)
          setUser(storedUser)
        } else {
          setToken(null)
          setUser(null)
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err)
        authService.clearAuthSession()
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for session expiration events from Axios interceptor (HTTP 401)
    const handleAuthExpired = () => {
      setUser(null)
      setToken(null)
    }

    // Listen for cross-tab auth state changes
    const handleStorageChange = (e) => {
      if (e.key === 'krishisetu_token' || e.key === 'krishisetu_user') {
        initializeAuth()
      }
    }

    window.addEventListener('krishisetu_auth_expired', handleAuthExpired)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('krishisetu_auth_expired', handleAuthExpired)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Standard Login (Farmer, Trader, or Admin)
  const login = useCallback(async ({ email, password, role }) => {
    setLoading(true)
    try {
      let data
      if (role === 'admin') {
        data = await authService.adminLogin({ email, password })
      } else {
        data = await authService.login({ email, password, role })
      }

      const token = data.accessToken || data.token
      setToken(token)
      setUser(data.user)
      return { success: true, user: data.user, data }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed'
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Convenient helper functions
  const loginWithPassword = useCallback(async (email, password, role) => {
    return login({ email, password, role })
  }, [login])

  const loginWithAdmin = useCallback(async (email, password) => {
    return login({ email, password, role: 'admin' })
  }, [login])

  // Verify OTP Login/Registration and set active session
  const verifyAndSetSession = useCallback(async ({ email, otp, isRegistration = false }) => {
    setLoading(true)
    try {
      let data
      if (isRegistration) {
        data = await authService.verifyRegistrationOTP({ email, otp })
      } else {
        data = await authService.verifyLoginOTP({ email, otp })
      }

      const token = data.accessToken || data.token
      setToken(token)
      setUser(data.user)
      return { success: true, user: data.user, data }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Verification failed'
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Direct Session Setter (for registration or mock testing)
  const setSession = useCallback((newToken, newUser) => {
    authService.setAuthSession(newToken, null, newUser)
    setToken(newToken)
    setUser(newUser)
  }, [])

  // Logout
  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await authService.logout()
    } finally {
      setUser(null)
      setToken(null)
      setLoading(false)
    }
  }, [])

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    isFarmer: user?.role === 'farmer',
    isTrader: user?.role === 'trader',
    isAdmin: user?.role === 'admin',
    loading,
    login,
    loginWithPassword,
    loginWithAdmin,
    verifyAndSetSession,
    setSession,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
