import api from './api'

/**
 * KrishiSetu Order & Logistics Service
 * Manages APMC electronic gate passes, GPS in-transit tracking, weighbridge clearance, and DBT release.
 */

const DEFAULT_FARMER_ORDERS = [
  {
    _id: 'ORD-KA-9912',
    date: '2026-08-25',
    crop: {
      name: 'Tomato (Hybrid Bangalore)',
      quantity: 80,
      unit: 'Quintals',
      rate: 2350,
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop'
    },
    trader: {
      name: 'Mysuru Agro Exporters Pvt Ltd',
      apmcLicense: 'APMC-MYS-8821',
      mobile: '+91 98450 12345',
      district: 'Mysuru'
    },
    escrowAmount: 188000,
    mandiCess: 2820,
    netFarmerPayout: 185180,
    paymentStatus: 'disbursed', // 'escrow_locked' | 'dispatched' | 'completed' | 'disbursed'
    stage: 4, // 1 to 4
    utrNumber: 'HDFCR52026082500918',
    logistics: {
      transporter: 'Kisan Express Agri-Logistics',
      vehicleNumber: 'KA-09-E-4421',
      driverName: 'Ramesh Gowda',
      driverPhone: '+91 98860 55432',
      status: 'Delivered & DBT Settled at APMC Yard'
    }
  },
  {
    _id: 'ORD-KA-9915',
    date: '2026-08-26',
    crop: {
      name: 'Red Onion (Bellary)',
      quantity: 150,
      unit: 'Quintals',
      rate: 2600,
      image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&auto=format&fit=crop'
    },
    trader: {
      name: 'Karnataka Wholesale Traders Co-op',
      apmcLicense: 'APMC-BLG-5512',
      mobile: '+91 94480 88776',
      district: 'Belagavi'
    },
    escrowAmount: 390000,
    mandiCess: 5850,
    netFarmerPayout: 384150,
    paymentStatus: 'dispatched',
    stage: 2,
    utrNumber: 'ESC-LCK-881920',
    logistics: {
      transporter: 'VRL Agri Cargo Service',
      vehicleNumber: 'KA-25-C-9901',
      driverName: 'Somanna K',
      driverPhone: '+91 97410 33211',
      status: 'In Transit — Near Davanagere Toll Plaza'
    }
  }
]

const DEFAULT_TRADER_ORDERS = [
  {
    _id: 'ORD-KA-TRD-9912',
    cropName: 'Grade-A Fresh Hybrid Tomato',
    variety: 'Shiva Hybrid (Firm Red Skin)',
    grade: 'Grade-A Premium',
    quantity: 120,
    unit: 'Quintals',
    agreedRate: 2200,
    grossEscrow: 264000,
    statutoryCess: 3960,
    freightCharges: 3200,
    totalEscrowLocked: 271160,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80',
    farmer: {
      name: 'Ramesh Gowda',
      mobile: '+91 98450 11223',
      village: 'Belur Village',
      taluk: 'Belur',
      district: 'Hassan'
    },
    transporter: {
      agency: 'Kisan Express Logistics Ltd',
      vehicleNumber: 'KA-04-F-8812',
      driverName: 'Manjunath Gowda',
      driverPhone: '+91 98860 55432',
      currentLocation: 'Nelamangala Highway Plaza',
      speed: '54 km/h',
      eta: 'Today, 06:30 PM (34 km away)'
    },
    weighment: {
      declaredWeight: 12000,
      grossWeight: 14280,
      tareWeight: 2280,
      netCertifiedWeight: 12000,
      variationKg: 0,
      variationPercent: '0.00%',
      certificateNo: 'KA-HSN-WB-88192',
      isVerified: true
    },
    status: 'in_transit', // 'escrow_locked' | 'in_transit' | 'weighment_verified' | 'dbt_released'
    currentStage: 2,
    createdAt: '28 Aug 2026'
  }
]

const getStoredFarmerOrders = () => {
  try {
    const raw = localStorage.getItem('krishisetu_farmer_orders')
    return raw ? JSON.parse(raw) : DEFAULT_FARMER_ORDERS
  } catch {
    return DEFAULT_FARMER_ORDERS
  }
}

const saveStoredFarmerOrders = (orders) => {
  try {
    localStorage.setItem('krishisetu_farmer_orders', JSON.stringify(orders))
  } catch (e) {
    console.warn('Failed to persist farmer orders:', e)
  }
}

const getStoredTraderOrders = () => {
  try {
    const raw = localStorage.getItem('krishisetu_trader_orders')
    return raw ? JSON.parse(raw) : DEFAULT_TRADER_ORDERS
  } catch {
    return DEFAULT_TRADER_ORDERS
  }
}

const saveStoredTraderOrders = (orders) => {
  try {
    localStorage.setItem('krishisetu_trader_orders', JSON.stringify(orders))
  } catch (e) {
    console.warn('Failed to persist trader orders:', e)
  }
}

export const orderService = {
  /**
   * Get all orders for Farmer Portal
   */
  getFarmerOrders: async () => {
    const local = getStoredFarmerOrders()
    try {
      const res = await api.get('/transactions/my-transactions')
      const data = res?.data || res
      if (Array.isArray(data) && data.length > 0) {
        return local
      }
      return local
    } catch {
      return local
    }
  },

  /**
   * Get all procurement orders for Trader Portal
   */
  getTraderOrders: async () => {
    const local = getStoredTraderOrders()
    try {
      const res = await api.get('/transactions/my-transactions')
      const data = res?.data || res
      if (Array.isArray(data) && data.length > 0) {
        return local
      }
      return local
    } catch {
      return local
    }
  },

  /**
   * Advance Order Milestone (e.g., Gate Pass Issued ➔ In Transit ➔ Weighbridge Verified ➔ DBT Disbursed)
   */
  advanceFarmerOrderStage: async (orderId, newStage) => {
    const current = getStoredFarmerOrders()
    const updated = current.map((ord) => {
      if (ord._id === orderId) {
        const nextStatus = newStage === 4 ? 'disbursed' : newStage === 3 ? 'completed' : 'dispatched'
        return {
          ...ord,
          stage: newStage,
          paymentStatus: nextStatus,
          utrNumber: newStage === 4 ? `HDFCR520260829${Date.now().toString().slice(-5)}` : ord.utrNumber
        }
      }
      return ord
    })

    saveStoredFarmerOrders(updated)
    return updated
  },

  /**
   * Advance Trader Procurement Milestone
   */
  advanceTraderOrderStage: async (orderId, newStage) => {
    const current = getStoredTraderOrders()
    const updated = current.map((ord) => {
      if (ord._id === orderId) {
        const statusMap = {
          1: 'escrow_locked',
          2: 'in_transit',
          3: 'weighment_verified',
          4: 'dbt_released'
        }
        return {
          ...ord,
          currentStage: newStage,
          status: statusMap[newStage] || ord.status
        }
      }
      return ord
    })

    saveStoredTraderOrders(updated)
    return updated
  }
}

export default orderService
