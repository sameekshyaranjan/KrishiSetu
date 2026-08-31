import api from './api'

/**
 * KrishiSetu Real-Time Chat & Direct Negotiation Service
 * Connects Farmer & Trader directly via MongoDB Persistence & WebSockets
 */

export const chatService = {
  /**
   * Get all conversation threads for the logged-in user
   */
  getMyConversations: async () => {
    try {
      const res = await api.get('/messages/conversations')
      return res?.data || res || []
    } catch (err) {
      console.warn('[chatService] Failed to load conversations:', err.message)
      return []
    }
  },

  /**
   * Get conversation and messages with a specific user
   */
  getConversationWithUser: async (otherUserId) => {
    try {
      const res = await api.get(`/messages/with/${otherUserId}`)
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
      return res?.data || res || []
    } catch (err) {
      console.warn('[chatService] Failed to load conversation messages:', err.message)
      return []
    }
  },

  /**
   * Send a direct message
   */
  sendMessage: async ({ receiverId, receiverModel, content, listingId }) => {
    const payload = {
      receiverId,
      receiverModel,
      content,
      listingId
    }
    const res = await api.post('/messages', payload)
    return res?.data || res
  }
}

export default chatService
