import api from './api'

/**
 * KrishiSetu Bidding & Escrow Commitments Service
 * 100% Real-Time Database Connection (MongoDB Atlas)
 * Strict User Scoping: Zero Dummy / Fallback Data Contamination
 */

export const bidService = {
  /**
   * Place a new binding auction bid on a crop lot in MongoDB
   */
  placeBid: async ({ cropId, amount, message }) => {
    const res = await api.post('/bids', { cropId, amount: Number(amount), message })
    return res?.data || res
  },

  /**
   * Get all bids placed by the authenticated trader from MongoDB
   */
  getMyBids: async () => {
    try {
      const res = await api.get('/bids/my')
      if (Array.isArray(res)) return res
      if (Array.isArray(res?.data)) return res.data
      if (Array.isArray(res?.docs)) return res.docs
      if (Array.isArray(res?.data?.data)) return res.data.data
      return []
    } catch (err) {
      console.warn('[bidService] Failed to load my bids:', err.message)
      return []
    }
  },

  /**
   * Get all bids placed on a specific crop listing from MongoDB
   */
  getBidsForListing: async (cropId) => {
    try {
      const res = await api.get(`/bids/listing/${cropId}`)
      if (Array.isArray(res)) return res
      if (Array.isArray(res?.data)) return res.data
      if (Array.isArray(res?.docs)) return res.docs
      if (Array.isArray(res?.data?.data)) return res.data.data
      return []
    } catch (err) {
      console.warn('[bidService] Failed to load listing bids:', err.message)
      return []
    }
  },

  /**
   * Cancel an active / pending bid (Trader action)
   */
  cancelBid: async (bidId) => {
    const res = await api.put(`/bids/${bidId}/cancel`)
    return res?.data || res
  },

  /**
   * Withdraw an active bid
   */
  withdrawBid: async (bidId) => {
    const res = await api.put(`/bids/${bidId}/cancel`)
    return res?.data || res
  },

  /**
   * Update an existing bid amount
   */
  updateBid: async (bidId, amount, message) => {
    const res = await api.put(`/bids/${bidId}`, { amount: Number(amount), message })
    return res?.data || res
  }
}

export default bidService
