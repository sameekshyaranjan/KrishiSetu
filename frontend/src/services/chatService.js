import api from './api'

/**
 * KrishiSetu Real-Time Chat & Direct Negotiation Service
 * Connects Farmer & Trader directly via MongoDB Persistence & WebSockets
 * 100% Real Database Persistence — Zero Mock Data
 */

export const chatService = {
  /**
   * Get all conversation threads for the logged-in user with crop references & unread counts
   */
  getMyConversations: async () => {
    try {
      const res = await api.get('/messages/conversations')
      const data = res?.data || res
      return Array.isArray(data) ? data : []
    } catch (err) {
      console.warn('[chatService] Failed to load conversations:', err.message)
      return []
    }
  },

  /**
   * Get conversation and messages with a specific user (optionally scoped to a crop listing)
   */
  getConversationWithUser: async (otherUserId, listingId = null) => {
    try {
      const params = listingId ? { listingId } : {}
      const res = await api.get(`/messages/with/${otherUserId}`, { params })
      return res?.data || { conversation: null, messages: [] }
    } catch (err) {
      console.warn('[chatService] Failed to load conversation with user:', err.message)
      return { conversation: null, messages: [] }
    }
  },

  /**
   * Get messages for a specific conversation ID
   */
  getConversationMessages: async (conversationId) => {
    try {
      const res = await api.get(`/messages/conversations/${conversationId}`)
      const data = res?.data || res
      if (data && Array.isArray(data.messages)) {
        return data
      }
      if (Array.isArray(data)) {
        return { conversation: null, messages: data }
      }
      return { conversation: null, messages: [] }
    } catch (err) {
      console.warn('[chatService] Failed to load conversation messages:', err.message)
      return { conversation: null, messages: [] }
    }
  },

  /**
   * Mark all unread messages in a conversation as read
   */
  markAsRead: async (conversationId) => {
    try {
      const res = await api.patch(`/messages/conversations/${conversationId}/read`)
      return res?.data || res
    } catch (err) {
      console.warn('[chatService] Failed to mark messages read:', err.message)
      return { success: false }
    }
  },

  /**
   * Send a direct message
   */
  sendMessage: async ({ receiverId, receiverModel, content, listingId, conversationId }) => {
    const payload = {
      content: content.trim(),
      ...(receiverId && { receiverId }),
      ...(receiverModel && { receiverModel }),
      ...(listingId && { listingId }),
      ...(conversationId && { conversationId })
    }
    const res = await api.post('/messages', payload)
    return res?.data || res
  }
}

export default chatService
