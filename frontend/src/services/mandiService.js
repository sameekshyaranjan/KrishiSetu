import api from './api'

// Benchmark fallback data for Karnataka APMC Mandis (Agmarknet simulation)
const KARNATAKA_MANDI_FALLBACK = [
  {
    _id: 'm1',
    commodity: 'Tomato',
    state: 'Karnataka',
    district: 'Kolar',
    market: 'Kolar APMC Market',
    minPrice: 1800,
    maxPrice: 2600,
    modalPrice: 2200,
    arrivals: 450,
    unit: 'Quintal',
    trend: 'up',
    date: new Date().toISOString()
  },
  {
    _id: 'm2',
    commodity: 'Onion',
    state: 'Karnataka',
    district: 'Hubli',
    market: 'Hubli Amargol APMC Yard',
    minPrice: 2100,
    maxPrice: 2900,
    modalPrice: 2550,
    arrivals: 680,
    unit: 'Quintal',
    trend: 'down',
    date: new Date().toISOString()
  },
  {
    _id: 'm3',
    commodity: 'Maize',
    state: 'Karnataka',
    district: 'Davanagere',
    market: 'Davanagere Main APMC',
    minPrice: 1950,
    maxPrice: 2250,
    modalPrice: 2100,
    arrivals: 1200,
    unit: 'Quintal',
    trend: 'steady',
    date: new Date().toISOString()
  },
  {
    _id: 'm4',
    commodity: 'Ragi (Finger Millet)',
    state: 'Karnataka',
    district: 'Mandya',
    market: 'Mandya APMC Market',
    minPrice: 3200,
    maxPrice: 3800,
    modalPrice: 3500,
    arrivals: 310,
    unit: 'Quintal',
    trend: 'up',
    date: new Date().toISOString()
  },
  {
    _id: 'm5',
    commodity: 'Cotton (Kapas)',
    state: 'Karnataka',
    district: 'Ballari',
    market: 'Ballari Cotton APMC',
    minPrice: 6800,
    maxPrice: 7600,
    modalPrice: 7250,
    arrivals: 540,
    unit: 'Quintal',
    trend: 'up',
    date: new Date().toISOString()
  },
  {
    _id: 'm6',
    commodity: 'Paddy (Basmati / Sona Masuri)',
    state: 'Karnataka',
    district: 'Belagavi',
    market: 'Belagavi APMC Yard',
    minPrice: 2400,
    maxPrice: 3100,
    modalPrice: 2850,
    arrivals: 890,
    unit: 'Quintal',
    trend: 'steady',
    date: new Date().toISOString()
  },
  {
    _id: 'm7',
    commodity: 'Turmeric (Haldi)',
    state: 'Karnataka',
    district: 'Chamarajanagar',
    market: 'Chamarajanagar Mandi',
    minPrice: 12500,
    maxPrice: 14800,
    modalPrice: 13900,
    arrivals: 160,
    unit: 'Quintal',
    trend: 'up',
    date: new Date().toISOString()
  },
  {
    _id: 'm8',
    commodity: 'Green Chilli',
    state: 'Karnataka',
    district: 'Haveri',
    market: 'Byadgi Chilli Market',
    minPrice: 4200,
    maxPrice: 5800,
    modalPrice: 5100,
    arrivals: 340,
    unit: 'Quintal',
    trend: 'down',
    date: new Date().toISOString()
  }
]

export const mandiService = {
  /**
   * Fetch live commodity prices from MongoDB backend
   */
  getLivePrices: async (params = {}) => {
    try {
      const res = await api.get('/prices', { params })
      const data = res.data

      if (Array.isArray(data) && data.length > 0) {
        return { prices: data, total: data.length, source: 'live_database' }
      }
      if (data && Array.isArray(data.prices) && data.prices.length > 0) {
        return { ...data, source: 'live_database' }
      }
      return { prices: KARNATAKA_MANDI_FALLBACK, total: KARNATAKA_MANDI_FALLBACK.length, source: 'fallback' }
    } catch (err) {
      console.warn('[MandiService] API unavailable, using cached Karnataka Mandi benchmark data.')
      return { prices: KARNATAKA_MANDI_FALLBACK, total: KARNATAKA_MANDI_FALLBACK.length, source: 'fallback' }
    }
  },

  /**
   * Fetch unique APMC districts list
   */
  getDistricts: async () => {
    try {
      const res = await api.get('/prices')
      if (Array.isArray(res.data) && res.data.length > 0) {
        const unique = [...new Set(res.data.map(p => p.district).filter(Boolean))]
        return ['All Districts', ...unique]
      }
      return ['All Districts', 'Bengaluru Urban', 'Mysuru', 'Hubballi', 'Belagavi', 'Kolar', 'Mandya']
    } catch {
      return ['All Districts', 'Bengaluru Urban', 'Mysuru', 'Hubballi', 'Belagavi', 'Kolar', 'Mandya']
    }
  },

  /**
   * Fetch unique commodities list
   */
  getCommodities: async () => {
    try {
      const res = await api.get('/prices')
      if (Array.isArray(res.data) && res.data.length > 0) {
        const unique = [...new Set(res.data.map(p => p.commodity).filter(Boolean))]
        return ['All Commodities', ...unique]
      }
      return ['All Commodities', 'Tomato', 'Potato', 'Onion', 'Rice', 'Wheat']
    } catch {
      return ['All Commodities', 'Tomato', 'Potato', 'Onion', 'Rice', 'Wheat']
    }
  }
}

export default mandiService
