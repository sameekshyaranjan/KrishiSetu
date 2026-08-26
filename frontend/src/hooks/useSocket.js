import { useContext, useCallback } from 'react'
import { SocketContext } from '@/context/SocketContext'

/**
 * Custom hook to consume the real-time SocketContext
 * Provides the raw socket instance, isConnected state, and safe emission/listener helpers.
 */
export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }

  const { socket, isConnected, socketUrl } = context

  // Safe emitter helper that checks connection before emitting
  const emit = useCallback(
    (event, data) => {
      if (socket && isConnected) {
        socket.emit(event, data)
      } else {
        console.warn(`[Socket] Cannot emit "${event}": socket is not connected.`)
      }
    },
    [socket, isConnected]
  )

  // Helper to attach event listeners
  const on = useCallback(
    (event, handler) => {
      if (socket) {
        socket.on(event, handler)
      }
    },
    [socket]
  )

  // Helper to remove event listeners
  const off = useCallback(
    (event, handler) => {
      if (socket) {
        socket.off(event, handler)
      }
    },
    [socket]
  )

  return {
    socket,
    isConnected,
    socketUrl,
    emit,
    on,
    off,
  }
}

export default useSocket
