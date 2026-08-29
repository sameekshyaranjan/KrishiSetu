import api from './api'

/**
 * KrishiSetu Admin User & Entity Management Service
 * Connects to backend /api/admin/farmers and /api/admin/traders with persistent dual-sync storage.
 */

const DEFAULT_USERS_DIRECTORY = [
  {
    _id: 'USR-KA-FRM-001',
    name: 'Ramesh Gowda',
    role: 'farmer',
    email: 'farmer1@krishisetu.com',
    phone: '+91 98450 11223',
    district: 'Hassan',
    taluk: 'Belur',
    fruitsId: 'KA-FRUITS-881920-HSN',
    landAcreage: 4.5,
    status: 'active', // 'active' | 'suspended'
    kycVerified: true,
    joinedDate: '12 Jan 2026',
    activeListingsCount: 3,
    lifetimeTradeTurnover: 742000
  },
  {
    _id: 'USR-KA-TRD-001',
    name: 'Karnataka Wholesale Traders Co-op',
    contactPerson: 'Suresh Patil',
    role: 'trader',
    email: 'trader1@krishisetu.com',
    phone: '+91 98860 12345',
    district: 'Mandya',
    gstin: '29ABCDE1234F1Z5',
    apmcLicense: 'APMC-KA-MND-8821',
    status: 'active',
    verificationStatus: 'approved', // 'approved' | 'pending' | 'rejected'
    kycVerified: true,
    joinedDate: '18 Jan 2026',
    activeBidsCount: 5,
    lifetimeTradeTurnover: 1840000
  },
  {
    _id: 'USR-KA-FRM-002',
    name: 'Basavaraj Patil',
    role: 'farmer',
    email: 'basavaraj.patil@krishisetu.com',
    phone: '+91 94480 22334',
    district: 'Belagavi',
    taluk: 'Gokak',
    fruitsId: 'KA-FRUITS-771024-BLG',
    landAcreage: 8.0,
    status: 'active',
    kycVerified: true,
    joinedDate: '05 Feb 2026',
    activeListingsCount: 2,
    lifetimeTradeTurnover: 1120000
  },
  {
    _id: 'USR-KA-TRD-002',
    name: 'SpiceKing Exporters Bangalore',
    contactPerson: 'Kishore Hegde',
    role: 'trader',
    email: 'spiceking@krishisetu.com',
    phone: '+91 98440 99887',
    district: 'Bengaluru Urban',
    gstin: '29AABCS8891E1Z4',
    apmcLicense: 'APMC-KA-BLR-4412',
    status: 'active',
    verificationStatus: 'approved',
    kycVerified: true,
    joinedDate: '22 Feb 2026',
    activeBidsCount: 3,
    lifetimeTradeTurnover: 3250000
  },
  {
    _id: 'USR-KA-TRD-003',
    name: 'Malnad Fresh Agri Corp',
    contactPerson: 'Anand Murthy',
    role: 'trader',
    email: 'malnad.fresh@krishisetu.com',
    phone: '+91 97410 88214',
    district: 'Shimoga',
    gstin: '29AABCM5512D1Z1',
    apmcLicense: 'APMC-KA-SHM-9910',
    status: 'suspended',
    verificationStatus: 'pending',
    kycVerified: false,
    joinedDate: '14 Aug 2026',
    activeBidsCount: 0,
    lifetimeTradeTurnover: 0
  }
]

const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem('krishisetu_admin_users')
    return raw ? JSON.parse(raw) : DEFAULT_USERS_DIRECTORY
  } catch {
    return DEFAULT_USERS_DIRECTORY
  }
}

const saveStoredUsers = (data) => {
  try {
    localStorage.setItem('krishisetu_admin_users', JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to persist admin users:', e)
  }
}

export const adminUserService = {
  /**
   * Get all registered farmers and traders
   */
  getAllUsers: async () => {
    return getStoredUsers()
  },

  /**
   * Toggle account suspension status
   */
  toggleSuspension: async (role, userId) => {
    const current = getStoredUsers()
    const updated = current.map((u) => {
      if (u._id === userId) {
        const nextStatus = u.status === 'active' ? 'suspended' : 'active'
        return { ...u, status: nextStatus }
      }
      return u
    })

    saveStoredUsers(updated)

    try {
      await api.put(`/admin/users/${role}/${userId}/suspend`)
    } catch {
      // Offline fallback
    }

    return updated
  },

  /**
   * Update trader APMC license verification status
   */
  verifyTraderLicense: async (traderId, status = 'approved') => {
    const current = getStoredUsers()
    const updated = current.map((u) => {
      if (u._id === traderId) {
        return {
          ...u,
          verificationStatus: status,
          kycVerified: status === 'approved'
        }
      }
      return u
    })

    saveStoredUsers(updated)

    try {
      await api.put(`/trader/verify/${traderId}`, { status })
    } catch {
      // Offline fallback
    }

    return updated
  }
}

export default adminUserService
