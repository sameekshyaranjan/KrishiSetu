import api from './api'

/**
 * KrishiSetu Government Schemes & Subsidies Service
 * Connects to backend /api/schemes with Karnataka state and central subsidy catalog.
 */

const DEFAULT_SCHEMES_CATALOG = [
  {
    _id: 'SCH-PM-KISAN-01',
    name: 'PM-KISAN Samman Nidhi Yojana',
    category: 'Direct Income Support',
    authority: 'Ministry of Agriculture & Farmers Welfare, GoI',
    purpose: 'Income support of ₹6,000 per year in three equal 4-monthly installments of ₹2,000 directly into Aadhaar-linked bank accounts.',
    eligibility: 'All landholding farmer families with cultivable landholding in their names across Karnataka.',
    benefits: '₹6,000 / year direct bank transfer (DBT)',
    subsidyPercent: '100% Direct Grant',
    officialLink: 'https://pmkisan.gov.in',
    isPublished: true,
    applicationCount: 1420
  },
  {
    _id: 'SCH-KA-RAITHA-02',
    name: 'Karnataka Raitha Siri Scheme',
    category: 'Millet & Dryland Subsidy',
    authority: 'Department of Agriculture, Government of Karnataka',
    purpose: 'Financial assistance of ₹10,000 per hectare directly credited to millet growers to promote minor millets like Ragi, Navane, and Same.',
    eligibility: 'Farmers cultivating millets (Ragi, Foxtail, Little Millet) in Karnataka dryland districts.',
    benefits: '₹10,000 per hectare incentive via DBT',
    subsidyPercent: 'Direct Per-Hectare Grant',
    officialLink: 'https://raitamitra.karnataka.gov.in',
    isPublished: true,
    applicationCount: 890
  },
  {
    _id: 'SCH-KA-KRISHI-BHAGYA-03',
    name: 'Krishi Bhagya Scheme (Farm Ponds & Drip Irrigation)',
    category: 'Irrigation & Water Conservation',
    authority: 'Government of Karnataka Water Resources & Agri Dept',
    purpose: 'Construction of on-farm polyhouse-lined water storage ponds and 90% subsidized drip/sprinkler irrigation systems.',
    eligibility: 'Rainfed agricultural landholders in 131 drought-prone taluks of Karnataka.',
    benefits: 'Up to 90% subsidy for SC/ST farmers, 80% for general category',
    subsidyPercent: '80% - 90% Equipment Subsidy',
    officialLink: 'https://raitamitra.karnataka.gov.in/krishibhagya',
    isPublished: true,
    applicationCount: 640
  },
  {
    _id: 'SCH-PM-FASAL-BIMA-04',
    name: 'PM Fasal Bima Yojana (PMFBY Crop Insurance)',
    category: 'Crop Insurance & Risk Shield',
    authority: 'Central & Karnataka State Crop Insurance Cell',
    purpose: 'Comprehensive risk insurance covering yield losses due to non-preventable natural risks (drought, flood, unseasonal rain, pests).',
    eligibility: 'All farmers growing notified crops in notified areas (both loanee and non-loanee farmers).',
    benefits: 'Max 2% premium for Kharif, 1.5% for Rabi, 100% claim settlement',
    subsidyPercent: 'Govt Pays 98% Premium',
    officialLink: 'https://pmfby.gov.in',
    isPublished: true,
    applicationCount: 1120
  },
  {
    _id: 'SCH-PM-KUSUM-05',
    name: 'PM-KUSUM Solar Agri-Pump Scheme',
    category: 'Renewable Energy & Power',
    authority: 'KREDL (Karnataka Renewable Energy Development Ltd)',
    purpose: 'Installation of standalone off-grid solar agricultural pumps (3HP to 7.5HP) with zero electricity bill liability.',
    eligibility: 'Individual farmers, farmer producer organizations (FPOs), and water user associations.',
    benefits: '60% subsidy (30% Central + 30% State Govt), 30% bank loan',
    subsidyPercent: '60% Direct Subsidy',
    officialLink: 'https://kredl.karnataka.gov.in',
    isPublished: true,
    applicationCount: 510
  }
]

const getStoredApplications = () => {
  try {
    const raw = localStorage.getItem('krishisetu_scheme_applications')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveStoredApplications = (apps) => {
  try {
    localStorage.setItem('krishisetu_scheme_applications', JSON.stringify(apps))
  } catch (e) {
    console.warn('Failed to persist scheme applications:', e)
  }
}

export const schemeService = {
  /**
   * Get all published schemes for public and farmer portal
   */
  getPublishedSchemes: async () => {
    try {
      const res = await api.get('/schemes')
      const data = res?.data || res
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
      return DEFAULT_SCHEMES_CATALOG
    } catch {
      return DEFAULT_SCHEMES_CATALOG
    }
  },

  /**
   * Get all schemes including drafts for Admin Portal
   */
  getAllSchemes: async (status) => {
    try {
      const res = await api.get('/schemes/all', { params: { status } })
      const data = res?.data || res
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
      return DEFAULT_SCHEMES_CATALOG
    } catch {
      return DEFAULT_SCHEMES_CATALOG
    }
  },

  /**
   * Publish Scheme (Admin Action)
   */
  publishScheme: async (schemeId) => {
    const res = await api.put(`/schemes/${schemeId}/publish`, {})
    return res?.data || res
  },

  /**
   * Reject Scheme (Admin Action)
   */
  rejectScheme: async (schemeId) => {
    const res = await api.put(`/schemes/${schemeId}/reject`, {})
    return res?.data || res
  },

  /**
   * Sync official government schemes from .gov.in and .nic.in portals
   */
  syncSchemes: async () => {
    const res = await api.post('/schemes/sync', {})
    return res?.data || res
  },

  /**
   * Admin Create New Scheme
   */
  createScheme: async (schemeData) => {
    try {
      const res = await api.post('/schemes', schemeData)
      return res?.data || res
    } catch {
      const newScheme = {
        _id: `SCH-${Date.now()}`,
        ...schemeData,
        isPublished: true,
        status: 'published',
        applicationCount: 0
      }
      return newScheme
    }
  },

  /**
   * Apply for Scheme (Farmer Direct Benefit Application)
   */
  applyForScheme: async (applicationPayload) => {
    const newApplication = {
      _id: `APP-SCH-${Date.now()}`,
      ...applicationPayload,
      status: 'submitted', // 'submitted' | 'under_review' | 'dbt_approved'
      appliedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      acknowledgementNo: `KA-AGRI-2026-${Math.floor(100000 + Math.random() * 900000)}`
    }

    const current = getStoredApplications()
    saveStoredApplications([newApplication, ...current])
    return newApplication
  },

  /**
   * Get Farmer's submitted applications
   */
  getMyApplications: () => {
    return getStoredApplications()
  }
}

export default schemeService
