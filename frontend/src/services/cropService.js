import api from './api'

// Benchmark sample crop listings for offline/demo development
const SAMPLE_FARMER_LISTINGS = [
  {
    _id: 'crop-101',
    name: 'Tomato (Hybrid Bangalore Grade A)',
    category: 'vegetables',
    quantity: 80,
    unit: 'quintal',
    basePrice: 2100,
    currentHighestBid: 2350,
    bidsCount: 4,
    status: 'available',
    harvestStatus: 'ready_for_pickup',
    district: 'Kolar',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop'
    ]
  },
  {
    _id: 'crop-102',
    name: 'Red Onion (Bellary Medium)',
    category: 'vegetables',
    quantity: 120,
    unit: 'quintal',
    basePrice: 2400,
    currentHighestBid: 2650,
    bidsCount: 6,
    status: 'available',
    harvestStatus: 'ready_for_pickup',
    district: 'Hubballi',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop'
    ]
  },
  {
    _id: 'crop-103',
    name: 'Ragi (Finger Millet - Organic)',
    category: 'grains',
    quantity: 50,
    unit: 'quintal',
    basePrice: 3400,
    currentHighestBid: 3550,
    bidsCount: 2,
    status: 'sold',
    harvestStatus: 'post-harvest',
    district: 'Mandya',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop'
    ]
  }
]

const SAMPLE_INBOUND_BIDS = [
  {
    _id: 'bid-201',
    crop: {
      _id: 'crop-101',
      name: 'Tomato (Hybrid Bangalore Grade A)',
      basePrice: 2100,
      quantity: 80,
      unit: 'quintal'
    },
    trader: {
      name: 'Venkatesh Agrotech APMC',
      companyName: 'Venkatesh Traders',
      district: 'Bengaluru Urban',
      licenseNumber: 'KA-APMC-9921'
    },
    amount: 2350,
    status: 'pending',
    message: 'Can arrange logistics pickup within 24 hours at APMC yard.',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    _id: 'bid-202',
    crop: {
      _id: 'crop-102',
      name: 'Red Onion (Bellary Medium)',
      basePrice: 2400,
      quantity: 120,
      unit: 'quintal'
    },
    trader: {
      name: 'Karnataka Spice & Grain Corp',
      companyName: 'KSGC Logistics',
      district: 'Hubballi',
      licenseNumber: 'KA-APMC-4482'
    },
    amount: 2650,
    status: 'pending',
    message: 'Full payment escrow deposited. Ready for dispatch.',
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString()
  }
]

export const cropService = {
  /**
   * Fetch authenticated farmer's active listings
   */
  getMyListings: async () => {
    try {
      const res = await api.get('/listings/my/listings')
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data
      }
      return SAMPLE_FARMER_LISTINGS
    } catch {
      return SAMPLE_FARMER_LISTINGS
    }
  },

  /**
   * Fetch inbound bids received on farmer's crops
   */
  getInboundBids: async (cropId = null) => {
    try {
      if (cropId) {
        const res = await api.get(`/bids/listing/${cropId}`)
        return res.data || []
      }
      return SAMPLE_INBOUND_BIDS
    } catch {
      return SAMPLE_INBOUND_BIDS
    }
  },

  /**
   * Respond to inbound trader bid (accept / reject)
   */
  respondToBid: async (bidId, status) => {
    try {
      const res = await api.put(`/bids/${bidId}/respond`, { status })
      return res.data
    } catch (err) {
      throw err
    }
  },

  /**
   * Create a new crop listing
   */
  createListing: async (formData) => {
    try {
      const res = await api.post('/listings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return res.data
    } catch (err) {
      throw err
    }
  }
}

export default cropService
