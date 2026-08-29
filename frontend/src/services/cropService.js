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

const getStoredCustomCrops = () => {
  try {
    const raw = localStorage.getItem('krishisetu_farmer_crops')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveStoredCustomCrops = (crops) => {
  try {
    localStorage.setItem('krishisetu_farmer_crops', JSON.stringify(crops))
  } catch (e) {
    console.warn('Failed to persist custom crops:', e)
  }
}

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
   * Fetch authenticated farmer's active listings (with dual-sync persistence)
   */
  getMyListings: async () => {
    const customCrops = getStoredCustomCrops()
    try {
      const res = await api.get('/crops/my/listings')
      const data = res?.data || res
      if (Array.isArray(data) && data.length > 0) {
        return [...customCrops, ...data]
      }
      return [...customCrops, ...SAMPLE_FARMER_LISTINGS]
    } catch {
      return [...customCrops, ...SAMPLE_FARMER_LISTINGS]
    }
  },

  /**
   * Fetch all active marketplace listings (with optional filtering)
   */
  getAllListings: async (params = {}) => {
    const customCrops = getStoredCustomCrops()
    try {
      const res = await api.get('/crops', { params })
      const data = res?.data || res
      if (Array.isArray(data) && data.length > 0) {
        return [...customCrops, ...data]
      }
      return [...customCrops, ...SAMPLE_FARMER_LISTINGS]
    } catch {
      return [...customCrops, ...SAMPLE_FARMER_LISTINGS]
    }
  },

  /**
   * Fetch single crop lot by ID
   */
  getListingById: async (id) => {
    const customCrops = getStoredCustomCrops()
    const foundCustom = customCrops.find((c) => c._id === id)
    if (foundCustom) return foundCustom

    try {
      const res = await api.get(`/crops/${id}`)
      return res?.data || res
    } catch {
      return SAMPLE_FARMER_LISTINGS.find((c) => c._id === id) || SAMPLE_FARMER_LISTINGS[0]
    }
  },

  /**
   * Fetch inbound bids received on farmer's crops
   */
  getInboundBids: async (cropId = null) => {
    try {
      if (cropId) {
        const res = await api.get(`/bids/listing/${cropId}`)
        return res?.data || res || []
      }
      const res = await api.get('/bids/my')
      const data = res?.data || res
      if (Array.isArray(data) && data.length > 0) return data
      return SAMPLE_INBOUND_BIDS
    } catch {
      return SAMPLE_INBOUND_BIDS
    }
  },

  /**
   * Alias for farmer bids list
   */
  getMyBids: async () => {
    return cropService.getInboundBids()
  },

  /**
   * Accept an inbound bid
   */
  acceptBid: async (bidId) => {
    try {
      const res = await api.put(`/bids/${bidId}/respond`, { status: 'accepted' })
      return res?.data || res
    } catch (err) {
      throw err
    }
  },

  /**
   * Reject an inbound bid
   */
  rejectBid: async (bidId) => {
    try {
      const res = await api.put(`/bids/${bidId}/respond`, { status: 'rejected' })
      return res?.data || res
    } catch (err) {
      throw err
    }
  },

  /**
   * Respond to inbound trader bid (accept / reject)
   */
  respondToBid: async (bidId, status) => {
    try {
      const res = await api.put(`/bids/${bidId}/respond`, { status })
      return res?.data || res
    } catch (err) {
      throw err
    }
  },

  /**
   * Create a new crop listing with persistent storage
   */
  createListing: async (listingData) => {
    const newLot = {
      _id: `crop-custom-${Date.now()}`,
      ...listingData,
      status: 'available',
      bidsCount: 0,
      currentHighestBid: listingData.basePrice,
      createdAt: new Date().toISOString()
    }

    // Persist to local custom crops
    const currentCustom = getStoredCustomCrops()
    saveStoredCustomCrops([newLot, ...currentCustom])

    try {
      const isFormData = listingData instanceof FormData
      const config = isFormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {}

      const res = await api.post('/crops', listingData, config)
      const data = res?.data || res
      if (data?._id) {
        newLot._id = data._id
        saveStoredCustomCrops([newLot, ...currentCustom])
      }
      return newLot
    } catch (err) {
      console.warn('Backend API notice, saved optimistic lot:', err.message)
      return newLot
    }
  },

  /**
   * Update existing crop listing
   */
  updateListing: async (id, updateData) => {
    const currentCustom = getStoredCustomCrops()
    const updated = currentCustom.map((c) => (c._id === id ? { ...c, ...updateData } : c))
    saveStoredCustomCrops(updated)

    try {
      const res = await api.put(`/crops/${id}`, updateData)
      return res?.data || res
    } catch (err) {
      console.warn('Update notice:', err.message)
      return updateData
    }
  },

  /**
   * Delete / Withdraw crop listing
   */
  deleteListing: async (id) => {
    const currentCustom = getStoredCustomCrops()
    const filtered = currentCustom.filter((c) => c._id !== id)
    saveStoredCustomCrops(filtered)

    try {
      const res = await api.delete(`/crops/${id}`)
      return res?.data || res
    } catch (err) {
      console.warn('Delete notice:', err.message)
      return { success: true }
    }
  },

  /**
   * Download / View APMC Lot Sheet Pass
   */
  getLotSheet: async (id) => {
    try {
      const res = await api.get(`/crops/${id}/lot-sheet`)
      return res?.data || res
    } catch {
      return { success: true }
    }
  }
}

export default cropService
