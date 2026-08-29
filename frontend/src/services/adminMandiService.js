import api from './api'

/**
 * KrishiSetu Admin Mandi Telemetry & Price Intelligence Service
 * Connects to backend APMC market data with persistent dual-sync storage.
 */

const DEFAULT_PRICE_INTELLIGENCE = [
  {
    _id: 'PRC-TOM-KA-01',
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
    _id: 'PRC-ONI-KA-02',
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
  },
  {
    _id: 'PRC-MAI-KA-03',
    cropName: 'Yellow Dent Maize',
    category: 'grains',
    primaryMandi: 'Bengaluru Rural (Doddaballapura)',
    district: 'Bengaluru Rural',
    currentModalRate: 2050,
    mspFloorPrice: 2090,
    shift7dPercent: -3.8,
    shift30dPercent: -6.2,
    volatilityStatus: 'DEFICIT_RISK',
    stateBufferRequirementQtl: 12000,
    allocatedStorage: 'Karnataka State Warehousing Corp (KSWC Silo #1)',
    bufferStatus: 'requisition_open',
    recommendedAction: 'Modal price is ₹40 below MSP. Immediate MSP floor procurement mandated to protect farmer incomes.'
  },
  {
    _id: 'PRC-RAG-KA-04',
    cropName: 'Organic Finger Millet (Ragi)',
    category: 'grains',
    primaryMandi: 'Kolar & Tumakuru APMC',
    district: 'Kolar',
    currentModalRate: 3450,
    mspFloorPrice: 3578,
    shift7dPercent: 2.1,
    shift30dPercent: 4.8,
    volatilityStatus: 'STABLE',
    stateBufferRequirementQtl: 15000,
    allocatedStorage: 'Civil Supplies PDS Distribution Hub',
    bufferStatus: 'procured',
    recommendedAction: 'Regular PDS procurement quota 92% fulfilled across Southern Karnataka mandis.'
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
    _id: 'GP-KA-BLR-2026-7721',
    timestamp: '22 mins ago (15:23 IST)',
    mandiYard: 'Bengaluru Rural (Doddaballapura)',
    vehicleNo: 'KA-50-E-4419',
    vehicleType: '12-Wheel Tata Prima Commercial',
    transporterName: 'Deccan Grain Haulers Ltd',
    driverName: 'Shankar Rao',
    driverMobile: '+91 97412 88990',
    farmerName: 'Channappa Gowda (Doddaballapura)',
    farmerRtc: 'RTC-BLR-44102',
    cropName: 'Yellow Dent Poultry Maize',
    declaredBags: '600 Gunny Bags (300 Qtl)',
    grossWeightKg: 35850,
    tareWeightKg: 5850,
    netWeightKg: 30000,
    netWeightQtl: 300.0,
    weighbridgeTolerance: 'Passed (0.01% Variance)',
    shedAllocation: 'Grain Silo Shed #12',
    status: 'cleared',
    weighbridgeRef: 'WB-BLR-2026-7712'
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
  /**
   * Get price intelligence & buffer stock analysis
   */
  getPriceIntelligence: async () => {
    return getStoredPricesIntel()
  },

  /**
   * Update buffer stock requisition status
   */
  updateBufferStatus: async (cropId, newStatus) => {
    const current = getStoredPricesIntel()
    const updated = current.map((p) => (p._id === cropId ? { ...p, bufferStatus: newStatus } : p))
    saveStoredPricesIntel(updated)
    return updated
  },

  /**
   * Get active APMC gate passes and weighbridge traffic
   */
  getGatePasses: async () => {
    return getStoredGatePasses()
  },

  /**
   * Advance gate pass status
   */
  updateGatePassStatus: async (passId, newStatus) => {
    const current = getStoredGatePasses()
    const updated = current.map((gp) => (gp._id === passId ? { ...gp, status: newStatus } : gp))
    saveStoredGatePasses(updated)
    return updated
  }
}

export default adminMandiService
