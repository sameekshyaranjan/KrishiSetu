import api from './api'

/**
 * KrishiSetu Crop & Harvest Lot Service
 * 100% Real-Time Database Connection (MongoDB Atlas)
 * Strict User Scoping: Zero Dummy / Fallback Data Contamination
 */

export const cropService = {
  /**
   * Fetch authenticated farmer's active crop listings from MongoDB
   */
  getMyListings: async () => {
    try {
      const res = await api.get('/crops/my/listings')
      const data = res?.data || res
      if (Array.isArray(data)) {
        return data
      }
      if (data?.docs && Array.isArray(data.docs)) {
        return data.docs
      }
      return []
    } catch (err) {
      console.warn('[cropService] Failed to load my listings:', err.message)
      return []
    }
  },

  /**
   * Fetch all active marketplace listings for traders & buyers
   */
  getAllListings: async (params = {}) => {
    try {
      // NOTE: axios interceptor already returns response.data
      // So `res` here IS the HTTP body: { source: 'mongodb'|'redis', data: { success, data: [...crops] } }
      const res = await api.get('/crops', { params })
      console.log('[cropService.getAllListings] RAW RESPONSE:', JSON.stringify(res)?.slice(0, 500))

      // res = { source, data: paginateResult }
      // paginateResult = { success, count, total, page, pages, data: [crops] }
      if (Array.isArray(res)) return res
      if (Array.isArray(res?.data?.data)) return res.data.data   // { source, data: { data: [crops] } }
      if (Array.isArray(res?.data?.docs)) return res.data.docs   // paginate with docs key
      if (Array.isArray(res?.data)) return res.data              // { source, data: [crops] }
      if (Array.isArray(res?.docs)) return res.docs              // { docs: [crops] }
      console.warn('[cropService.getAllListings] Unexpected response shape:', res)
      return []
    } catch (err) {
      console.warn('[cropService] Failed to load marketplace listings:', err.message)
      return []
    }
  },


  /**
   * Fetch single crop lot by ID
   */
  getListingById: async (id) => {
    try {
      const res = await api.get(`/crops/${id}`)
      const payload = res?.data
      return payload?.data || payload || null
    } catch (err) {
      console.warn('[cropService] Listing not found:', id, err.message)
      return null
    }
  },

  /**
   * Fetch inbound bids received on farmer's crops from MongoDB
   */
  getInboundBids: async (cropId = null) => {
    try {
      const endpoint = cropId ? `/bids/listing/${cropId}` : '/bids/my'
      const res = await api.get(endpoint)
      const payload = res?.data
      if (Array.isArray(payload)) return payload
      if (Array.isArray(payload?.data)) return payload.data
      if (Array.isArray(payload?.docs)) return payload.docs
      return []
    } catch (err) {
      console.warn('[cropService] Failed to load inbound bids:', err.message)
      return []
    }
  },

  /**
   * Alias for getInboundBids
   */
  getMyBids: async (cropId = null) => {
    return cropService.getInboundBids(cropId)
  },

  /**
   * Accept an inbound bid
   */
  acceptBid: async (bidId, expectedAmount = null) => {
    const payload = { status: 'accepted' }
    if (expectedAmount) payload.expectedAmount = expectedAmount
    const res = await api.put(`/bids/${bidId}/respond`, payload)
    return res?.data || res
  },

  /**
   * Reject an inbound bid
   */
  rejectBid: async (bidId) => {
    const res = await api.put(`/bids/${bidId}/respond`, { status: 'rejected' })
    return res?.data || res
  },

  /**
   * Respond to bid (Accept / Reject)
   */
  respondToBid: async (bidId, status, expectedAmount = null) => {
    const payload = { status }
    if (expectedAmount) payload.expectedAmount = expectedAmount
    const res = await api.put(`/bids/${bidId}/respond`, payload)
    return res?.data || res
  },

  /**
   * Create new harvest listing in MongoDB
   */
  createListing: async (formData) => {
    const res = await api.post('/crops', formData)
    return res?.data || res
  },

  /**
   * Update an existing crop listing
   */
  updateListing: async (cropId, formData) => {
    const res = await api.put(`/crops/${cropId}`, formData)
    return res?.data || res
  },

  /**
   * Delete a crop listing
   */
  deleteListing: async (cropId) => {
    const res = await api.delete(`/crops/${cropId}`)
    return res?.data || res
  }
}

export default cropService
