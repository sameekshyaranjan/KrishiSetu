import api from './api'

/**
 * KrishiSetu Profile & Karnataka FRUITS KYC Service
 * Connects to backend /api/farmer/profile and /api/trader/profile with persistent storage dual-sync.
 */

const DEFAULT_FARMER_PROFILE = {
  name: 'Ramesh Gowda',
  mobile: '+91 98450 11223',
  email: 'farmer1@krishisetu.com',
  role: 'farmer',
  fruitsId: 'KA-FRUITS-881920-HSN',
  isFruitsVerified: true,
  aadhaarNumber: 'XXXX-XXXX-8821',
  district: 'Hassan',
  taluk: 'Belur',
  village: 'Belur Village',
  primaryCrops: ['Tomato', 'Red Onion', 'Jyoti Potato'],
  landHoldingAcres: 4.5,
  irrigationType: 'Borewell & Drip Irrigation',
  bankAccount: {
    bankName: 'State Bank of India',
    accountNumber: '•••• •••• 3891',
    ifsc: 'SBIN0001244',
    dbtEnabled: true
  }
}

const DEFAULT_TRADER_PROFILE = {
  name: 'Karnataka Wholesale Traders Co-op',
  contactPerson: 'Suresh Patil',
  mobile: '+91 98860 12345',
  email: 'trader1@krishisetu.com',
  role: 'trader',
  apmcLicense: 'APMC-KA-MND-8821',
  isLicenseVerified: true,
  gstin: '29ABCDE1234F1Z5',
  district: 'Mandya',
  businessAddress: 'Plot #14, APMC Market Yard, Mandya - 571401',
  preferredCommodities: ['Tomato', 'Onion', 'Maize', 'Ragi'],
  annualProcurementVolume: '15,000 Quintals',
  virtualEscrowAccount: {
    bank: 'Axis Bank Escrow Trust',
    accountNumber: 'VIRT-KRISHI-88912',
    ifsc: 'UTIB0000123'
  }
}

const getStoredFarmerProfile = () => {
  try {
    const raw = localStorage.getItem('krishisetu_farmer_profile')
    return raw ? JSON.parse(raw) : DEFAULT_FARMER_PROFILE
  } catch {
    return DEFAULT_FARMER_PROFILE
  }
}

const saveStoredFarmerProfile = (data) => {
  try {
    localStorage.setItem('krishisetu_farmer_profile', JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to persist farmer profile:', e)
  }
}

const getStoredTraderProfile = () => {
  try {
    const raw = localStorage.getItem('krishisetu_trader_profile')
    return raw ? JSON.parse(raw) : DEFAULT_TRADER_PROFILE
  } catch {
    return DEFAULT_TRADER_PROFILE
  }
}

const saveStoredTraderProfile = (data) => {
  try {
    localStorage.setItem('krishisetu_trader_profile', JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to persist trader profile:', e)
  }
}

export const profileService = {
  /**
   * Get Farmer Profile
   */
  getFarmerProfile: async () => {
    const local = getStoredFarmerProfile()
    try {
      const res = await api.get('/farmer/profile')
      const data = res?.data || res
      if (data && data._id) {
        const merged = { ...local, ...data }
        saveStoredFarmerProfile(merged)
        return merged
      }
      return local
    } catch {
      return local
    }
  },

  /**
   * Update Farmer Profile
   */
  updateFarmerProfile: async (payload) => {
    const local = getStoredFarmerProfile()
    const updated = { ...local, ...payload }
    saveStoredFarmerProfile(updated)

    try {
      const res = await api.put('/farmer/profile', payload)
      return res?.data || updated
    } catch {
      return updated
    }
  },

  /**
   * Get Trader Profile
   */
  getTraderProfile: async () => {
    const local = getStoredTraderProfile()
    try {
      const res = await api.get('/trader/profile')
      const data = res?.data || res
      if (data && data._id) {
        const merged = { ...local, ...data }
        saveStoredTraderProfile(merged)
        return merged
      }
      return local
    } catch {
      return local
    }
  },

  /**
   * Update Trader Profile
   */
  updateTraderProfile: async (payload) => {
    const local = getStoredTraderProfile()
    const updated = { ...local, ...payload }
    saveStoredTraderProfile(updated)

    try {
      const res = await api.put('/trader/profile', payload)
      return res?.data || updated
    } catch {
      return updated
    }
  },

  /**
   * Verify Karnataka FRUITS ID via AgriStack simulation
   */
  verifyFruitsId: async (fruitsId) => {
    // Standard format: KA-FRUITS-XXXXXX-DIST
    const isValid = fruitsId.startsWith('KA-FRUITS-') || fruitsId.length >= 8
    return {
      valid: isValid,
      ownerName: 'Ramesh Gowda',
      surveyNumbers: ['104/1A', '104/2B', '108/4'],
      village: 'Belur Village',
      totalExtentAcre: 4.5,
      rtcStatus: 'Verified & Aadhaar-Seeded 🟢'
    }
  }
}

export default profileService
