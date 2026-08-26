import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

/**
 * Custom hook to consume the AuthContext
 * Guarantees that the consumer is within an AuthProvider tree.
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default useAuth
