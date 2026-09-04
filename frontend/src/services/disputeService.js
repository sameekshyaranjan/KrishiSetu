import api from './api'

/**
 * KrishiSetu Admin Dispute Resolution & Quality Arbitration Service
 * Connected directly to live MongoDB database via /api/admin/disputes
 */

export const disputeService = {
  /**
   * Fetch all disputes from the backend MongoDB collection
   */
  getAllDisputes: async () => {
    try {
      const res = await api.get('/admin/disputes')
      // Safely extract disputes array from unwrapped or wrapped axios response
      if (Array.isArray(res)) return res
      if (Array.isArray(res?.disputes)) return res.disputes
      if (Array.isArray(res?.data?.disputes)) return res.data.disputes
      if (Array.isArray(res?.data)) return res.data
      return []
    } catch (err) {
      console.error('[disputeService] Failed to load disputes:', err)
      return []
    }
  },

  /**
   * Resolve a dispute with real wallet & ledger execution
   * @param {string} disputeId 
   * @param {object} param1 { action: 'refund_trader' | 'split_85_15' | 'payout_farmer', notes: string }
   */
  resolveDispute: async (disputeId, { action, notes }) => {
    const res = await api.put(`/admin/disputes/${disputeId}/resolve`, {
      action,
      notes
    })
    return res?.data || res
  }
}

export default disputeService
