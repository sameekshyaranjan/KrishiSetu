import { createContext, useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import useAuth from '@/hooks/useAuth'

export const SocketContext = createContext(null)

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const { token, isAuthenticated } = useAuth()

  useEffect(() => {
    // Only establish a real-time socket connection when authenticated
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    // Initialize Socket.io client with auth handshake payload
    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      autoConnect: true,
    })

    socketInstance.on('connect', () => {
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
    })

    socketInstance.on('connect_error', (err) => {
      console.warn('[Socket.io] Connection notice:', err.message)
      setIsConnected(false)
    })

    setSocket(socketInstance)

    // Cleanup and disconnect socket when component unmounts or token changes
    return () => {
      socketInstance.disconnect()
    }
  }, [isAuthenticated, token])

  const value = {
    socket,
    isConnected,
    socketUrl: SOCKET_URL,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export default SocketContext
