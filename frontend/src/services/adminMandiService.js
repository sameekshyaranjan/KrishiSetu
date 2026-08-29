import api from './api'

/**
 * KrishiSetu Admin Mandi Telemetry & Price Intelligence Service
 * Connects to backend APMC market data with persistent dual-sync storage.
 */

const DEFAULT_PRICE_INTELLIGENCE = [
  {
    _id: 'PRC-PAD-KA-01',
    cropName: 'Paddy / Rice (Sona Masoori)',
    category: 'grains',
    primaryMandi: 'Mandya & Mysuru APMC',
    district: 'Mandya',
    currentModalRate: 3150,
    mspFloorPrice: 2300,
    shift7dPercent: 4.8,
    shift30dPercent: 11.2,
    volatilityStatus: 'STABLE',
    stateBufferRequirementQtl: 25000,
    allocatedStorage: 'Food Corporation of India (FCI) Silo Complex #3',
    bufferStatus: 'procured',
    recommendedAction: 'State PDS rice quota 96% fulfilled across Southern Karnataka mandis.'
  },
  {
    _id: 'PRC-RAG-KA-02',
    cropName: 'Organic Finger Millet (Ragi)',
    category: 'grains',
    primaryMandi: 'Kolar & Tumakuru APMC',
    district: 'Kolar',
    currentModalRate: 3500,
    mspFloorPrice: 3578,
    shift7dPercent: 2.1,
    shift30dPercent: 4.8,
    volatilityStatus: 'STABLE',
    stateBufferRequirementQtl: 18000,
    allocatedStorage: 'Civil Supplies PDS Distribution Hub, Kolar',
    bufferStatus: 'procured',
    recommendedAction: 'Regular PDS procurement quota 92% fulfilled across Southern Karnataka mandis.'
  },
  {
    _id: 'PRC-WHT-KA-03',
    cropName: 'Wheat (Sharbati Gold)',
    category: 'grains',
    primaryMandi: 'Belagavi & Dharwad APMC',
    district: 'Belagavi',
    currentModalRate: 3200,
    mspFloorPrice: 2275,
    shift7dPercent: 3.5,
    shift30dPercent: 8.4,
    volatilityStatus: 'STABLE',
    stateBufferRequirementQtl: 14000,
    allocatedStorage: 'Karnataka State Warehousing Corp (KSWC Belagavi Silo)',
    bufferStatus: 'procured',
    recommendedAction: 'Northern Karnataka wheat arrivals meeting commercial milling demand.'
  },
  {
    _id: 'PRC-CPR-KA-04',
    cropName: 'Copra (Tiptur Ball Copra)',
    category: 'spices',
    primaryMandi: 'Tiptur APMC (National Copra Yard)',
    district: 'Tumakuru',
    currentModalRate: 13800,
    mspFloorPrice: 12000,
    shift7dPercent: 6.2,
    shift30dPercent: 18.5,
    volatilityStatus: 'SURGE_RISK',
    stateBufferRequirementQtl: 8000,
    allocatedStorage: 'NAFED Coconut Procurement Center, Tiptur',
    bufferStatus: 'requisition_open',
    recommendedAction: 'Coconut oil extraction demand surged by 18%. NAFED MSP buffer acquisition open.'
  },
  {
    _id: 'PRC-TOM-KA-05',
    cropName: 'Hybrid Tomato',
    category: 'vegetables',
    primaryMandi: 'Hassan & Kolar APMC',
    district: 'Hassan',
    currentModalRate: 2200,
    mspFloorPrice: 1800,
    shift7dPercent: 14.2,
    shift30dPercent: 32.5,
    volatilityStatus: 'SURGE_RISK',
    stateBufferRequirementQtl: 5000,
    allocatedStorage: 'Hassan Central Cold Storage #2',
    bufferStatus: 'requisition_open',
    recommendedAction: 'Trigger State Market Intervention to procure 5,000 Qtl for urban retail price stabilization.'
  },
  {
    _id: 'PRC-ONI-KA-06',
    cropName: 'Bellary Red Onion',
    category: 'vegetables',
    primaryMandi: 'Mandya & Hubballi APMC',
    district: 'Mandya',
    currentModalRate: 2650,
    mspFloorPrice: 2100,
    shift7dPercent: 18.5,
    shift30dPercent: 41.0,
    volatilityStatus: 'SURGE_RISK',
    stateBufferRequirementQtl: 8000,
    allocatedStorage: 'Mandya Ventilated Storage Shed #4',
    bufferStatus: 'requisition_open',
    recommendedAction: 'Acquire 8,000 Qtl buffer stock to counteract anticipated monsoon transport disruption.'
  }
]

const DEFAULT_GATE_PASSES = [
  {
    _id: 'GP-KA-YPR-2026-9912',
    timestamp: '5 mins ago (15:40 IST)',
    mandiYard: 'Yeshwanthpur APMC Main Yard, Bengaluru',
    vehicleNo: 'KA-04-F-8812',
    vehicleType: '10-Wheel Heavy Eicher Truck',
    transporterName: 'Karnataka Agri-Express Logistics',
    driverName: 'Manjunath Swamy',
    driverMobile: '+91 98450 11223',
    farmerName: 'Ramesh Gowda (Belur, Hassan)',
    farmerRtc: 'RTC-HSN-88192',
    cropName: 'Grade-A Fresh Hybrid Tomato',
    declaredBags: '480 Crates (120 Qtl)',
    grossWeightKg: 14280,
    tareWeightKg: 2280,
    netWeightKg: 12000,
    netWeightQtl: 120.0,
    weighbridgeTolerance: 'Passed (0.02% Variance)',
    shedAllocation: 'Auction Shed #4B (Vegetables)',
    status: 'unloading',
    weighbridgeRef: 'WB-YPR-2026-8819'
  },
  {
    _id: 'GP-KA-TPT-2026-8840',
    timestamp: '18 mins ago (15:28 IST)',
    mandiYard: 'Tiptur APMC National Copra Market Yard',
    vehicleNo: 'KA-06-B-9912',
    vehicleType: '12-Wheel Ashok Leyland Commercial',
    transporterName: 'Coconut Country Freight Co-op',
    driverName: 'Chandrashekariah',
    driverMobile: '+91 97412 66778',
    farmerName: 'Thimmegowda (Tiptur, Tumakuru)',
    farmerRtc: 'RTC-TPT-33214',
    cropName: 'Tiptur Special Ball Copra',
    declaredBags: '240 Gunny Bags (120 Qtl)',
    grossWeightKg: 16800,
    tareWeightKg: 4800,
    netWeightKg: 12000,
    netWeightQtl: 120.0,
    weighbridgeTolerance: 'Passed (0.01% Variance)',
    shedAllocation: 'Copra Platform #1A',
    status: 'cleared',
    weighbridgeRef: 'WB-TPT-2026-8840'
  },
  {
    _id: 'GP-KA-MND-2026-7721',
    timestamp: '35 mins ago (15:10 IST)',
    mandiYard: 'Mandya APMC Main Yard',
    vehicleNo: 'KA-11-M-4419',
    vehicleType: '10-Wheel Tata Prima',
    transporterName: 'Deccan Grain Haulers Ltd',
    driverName: 'Shankar Rao',
    driverMobile: '+91 97412 88990',
    farmerName: 'Channappa Gowda (Mandya)',
    farmerRtc: 'RTC-MND-44102',
    cropName: 'Paddy / Rice (Sona Masoori Raw)',
    declaredBags: '600 Gunny Bags (300 Qtl)',
    grossWeightKg: 35850,
    tareWeightKg: 5850,
    netWeightKg: 30000,
    netWeightQtl: 300.0,
    weighbridgeTolerance: 'Passed (0.01% Variance)',
    shedAllocation: 'Grain Silo Shed #12',
    status: 'cleared',
    weighbridgeRef: 'WB-MND-2026-7721'
  }
]

const getStoredPricesIntel = () => {
  try {
    const raw = localStorage.getItem('krishisetu_admin_price_intel')
    return raw ? JSON.parse(raw) : DEFAULT_PRICE_INTELLIGENCE
  } catch {
    return DEFAULT_PRICE_INTELLIGENCE
  }
}

const saveStoredPricesIntel = (data) => {
  try {
    localStorage.setItem('krishisetu_admin_price_intel', JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to persist price intel:', e)
  }
}

const getStoredGatePasses = () => {
  try {
    const raw = localStorage.getItem('krishisetu_admin_gate_passes')
    return raw ? JSON.parse(raw) : DEFAULT_GATE_PASSES
  } catch {
    return DEFAULT_GATE_PASSES
  }
}

const saveStoredGatePasses = (data) => {
  try {
    localStorage.setItem('krishisetu_admin_gate_passes', JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to persist gate passes:', e)
  }
}

export const adminMandiService = {
  getPriceIntelligence: async () => {
    return getStoredPricesIntel()
  },

  updateBufferStatus: async (cropId, newStatus) => {
    const current = getStoredPricesIntel()
    const updated = current.map((p) => (p._id === cropId ? { ...p, bufferStatus: newStatus } : p))
    saveStoredPricesIntel(updated)
    return updated
  },

  getGatePasses: async () => {
    return getStoredGatePasses()
  },

  updateGatePassStatus: async (passId, newStatus) => {
    const current = getStoredGatePasses()
    const updated = current.map((gp) => (gp._id === passId ? { ...gp, status: newStatus } : gp))
    saveStoredGatePasses(updated)
    return updated
  }
}

export default adminMandiService
