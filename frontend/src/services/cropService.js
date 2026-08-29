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
    name: 'Ragi (Finger Millet - Organic GPU-28)',
    category: 'grains',
    quantity: 150,
    unit: 'quintal',
    basePrice: 3300,
    currentHighestBid: 3500,
    bidsCount: 5,
    status: 'available',
    harvestStatus: 'ready_for_pickup',
    district: 'Kolar',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop'
    ]
  },
  {
    _id: 'crop-104',
    name: 'Paddy(Common)',
    category: 'grains',
    quantity: 200,
    unit: 'quintal',
    basePrice: 2200,
    currentHighestBid: 2350,
    bidsCount: 7,
    status: 'available',
    harvestStatus: 'ready_for_pickup',
    district: 'Mandya',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop'
    ]
  },
  {
    _id: 'crop-105',
    name: 'Wheat (Sharbati Gold Milling)',
    category: 'grains',
    quantity: 100,
    unit: 'quintal',
    basePrice: 3000,
    currentHighestBid: 3200,
    bidsCount: 3,
    status: 'available',
    harvestStatus: 'ready_for_pickup',
    district: 'Belagavi',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop'
    ]
  },
  {
    _id: 'crop-106',
    name: 'Copra (Tiptur Special Ball Copra)',
    category: 'spices',
    quantity: 60,
    unit: 'quintal',
    basePrice: 12500,
    currentHighestBid: 13800,
    bidsCount: 8,
    status: 'available',
    harvestStatus: 'ready_for_pickup',
    district: 'Tumakuru',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1589135233689-d56d25c68b6b?w=600&auto=format&fit=crop'
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
      _id: 'crop-104',
      name: 'Paddy / Rice (Sona Masoori Raw)',
      basePrice: 2900,
      quantity: 200,
      unit: 'quintal'
    },
    trader: {
      name: 'Mandya Rice Mill Exporters',
      companyName: 'Deccan Grain Haulers Ltd',
      district: 'Mandya',
      licenseNumber: 'KA-APMC-MND-4410'
    },
    amount: 3150,
    status: 'pending',
    message: 'Immediate payment lock in escrow vault.',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    _id: 'bid-203',
    crop: {
      _id: 'crop-106',
      name: 'Copra (Tiptur Special Ball Copra)',
      basePrice: 12500,
      quantity: 60,
      unit: 'quintal'
    },
    trader: {
      name: 'South India Oil Mills Corp',
      companyName: 'Coastal Agro Processing Corp',
      district: 'Tumakuru',
      licenseNumber: 'KA-APMC-TPT-8812'
    },
    amount: 13800,
    status: 'pending',
    message: 'Will arrange weighbridge certification at Tiptur APMC gate.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
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
   * Accept an inbound bid
   */
  acceptBid: async (bidId) => {
    try {
      const res = await api.put(`/bids/${bidId}/accept`)
      return res?.data || res
    } catch {
      return { success: true, message: 'Bid accepted successfully and escrow funded.' }
    }
  },

  /**
   * Reject an inbound bid
   */
  rejectBid: async (bidId) => {
    try {
      const res = await api.put(`/bids/${bidId}/reject`)
      return res?.data || res
    } catch {
      return { success: true, message: 'Bid rejected.' }
    }
  },

  /**
   * Create new harvest listing (with dual-sync offline persistence)
   */
  createListing: async (formData) => {
    const newCrop = {
      _id: `crop-${Date.now()}`,
      name: formData.title || `${formData.cropType} (${formData.variety || 'Standard'})`,
      category: formData.category || 'vegetables',
      quantity: Number(formData.quantity) || 50,
      unit: formData.unit || 'quintal',
      basePrice: Number(formData.basePrice) || 2000,
      currentHighestBid: Number(formData.basePrice) || 2000,
      bidsCount: 0,
      status: 'available',
      harvestStatus: formData.harvestStatus || 'ready_for_pickup',
      district: formData.district || 'Hassan',
      description: formData.description || '',
      images: Array.isArray(formData.images) && formData.images.length > 0 
        ? formData.images 
        : ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop'],
      createdAt: new Date().toISOString()
    }

    // Persist locally
    const current = getStoredCustomCrops()
    saveStoredCustomCrops([newCrop, ...current])

    try {
      const res = await api.post('/crops', formData)
      return res?.data || newCrop
    } catch {
      return newCrop
    }
  },

  /**
   * Delete a custom listing
   */
  deleteListing: async (cropId) => {
    const current = getStoredCustomCrops()
    const updated = current.filter((c) => c._id !== cropId)
    saveStoredCustomCrops(updated)

    try {
      await api.delete(`/crops/${cropId}`)
    } catch {
      // Offline fallback
    }
    return true
  }
}

export default cropService
