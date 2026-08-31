import api from './api'

/**
 * KrishiSetu APMC Live Mandi Rates & Trends Service
 * 100% Authentic Government Data (agmarknet.gov.in / data.gov.in)
 * Strict Karnataka Mandi Scoping — Zero Mock/Fallback Data Contamination
 */

export const priceService = {
  /**
   * Get live Karnataka mandi prices with optional query filters
   */
  getLivePrices: async (params = {}) => {
    try {
      const res = await api.get('/prices', { params })
      const data = res?.data || res
      if (Array.isArray(data)) {
        return data
      }
      return []
    } catch (err) {
      console.warn('[priceService] Error fetching live prices:', err.message)
      return []
    }
  },

  /**
   * Trigger on-demand sync with data.gov.in Agmarknet API
   */
  syncLivePrices: async () => {
    try {
      const res = await api.post('/prices/sync')
      return res?.data || res
    } catch (err) {
      console.warn('[priceService] Sync failed:', err.message)
      return { success: false, count: 0, isLive: false, error: err.message }
    }
  },

  /**
   * Get historical price trend from MongoDB aggregation
   */
  getPriceTrend: async (commodity, district = '', days = 30) => {
    try {
      const res = await api.get('/prices/trend', {
        params: { commodity, district, days }
      })
      const data = res?.data || res
      if (data?.data && Array.isArray(data.data)) {
        return data.data
      }
      if (Array.isArray(data)) {
        return data
      }
      return []
    } catch (err) {
      console.warn('[priceService] Error fetching price trend:', err.message)
      return []
    }
  },

  /**
   * Subscribe to SMS Mandi Price Alert
   */
  subscribePriceAlert: async ({ mobile, commodity, targetPrice, district }) => {
    try {
      const res = await api.post('/sms/subscribe', {
        mobile,
        commodity,
        targetPrice,
        district
      })
      return res?.data || res
    } catch (err) {
      throw err
    }
  }
}

export default priceService
