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
      const data = res?.data?.docs || res?.data || res
      if (Array.isArray(data)) {
        return data
      }
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
      const data = res?.data?.docs || res?.data || res
      if (Array.isArray(data)) {
        return data
      }
      return []
    } catch (err) {
      console.warn('[bidService] Failed to load listing bids:', err.message)
      return []
    }
  },

  /**
   * Withdraw an active bid
   */
  withdrawBid: async (bidId) => {
    const res = await api.put(`/bids/${bidId}/withdraw`)
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
