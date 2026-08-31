import api from './api'

/**
 * KrishiSetu APMC Mandi Service
 * 100% Real-Time Database Connection (MongoDB Atlas)
 * Strict Karnataka Mandi Data — Zero Mock/Fallback Contamination
 */

export const mandiService = {
  /**
   * Fetch live Karnataka commodity prices from MongoDB backend
   */
  getLivePrices: async (params = {}) => {
    try {
      const res = await api.get('/prices', { params })
      const data = res.data

      if (Array.isArray(data)) {
        return { prices: data, total: data.length, source: 'live_database' }
      }
      if (data && Array.isArray(data.prices)) {
        return { ...data, source: 'live_database' }
      }
      return { prices: [], total: 0, source: 'empty' }
    } catch (err) {
      console.warn('[MandiService] Failed to load live prices:', err.message)
      return { prices: [], total: 0, source: 'error' }
    }
  },

  /**
   * Fetch unique Karnataka APMC districts list from live data
   */
  getDistricts: async () => {
    try {
      const res = await api.get('/prices')
      const list = Array.isArray(res.data) ? res.data : []
      const unique = [...new Set(list.map(p => p.district).filter(Boolean))].sort()
      return ['All Districts', ...unique]
    } catch {
      return ['All Districts']
    }
  },

  /**
   * Fetch unique commodities list from live data
   */
  getCommodities: async () => {
    try {
      const res = await api.get('/prices')
      const list = Array.isArray(res.data) ? res.data : []
      const unique = [...new Set(list.map(p => p.commodity).filter(Boolean))].sort()
      return ['All Commodities', ...unique]
    } catch {
      return ['All Commodities']
    }
  }
}

export default mandiService
