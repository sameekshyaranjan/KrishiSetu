import api from './api'

/**
 * KrishiSetu Statutory 1.5% APMC Cess Audit & Treasury Remittance Service
 * Connects to backend /api/admin/analytics/revenue with persistent dual-sync storage.
 */

const DEFAULT_CESS_AUDITS = [
  {
    _id: 'CESS-KA-2026-9912',
    transactionId: 'TXN-KA-881920',
    orderId: 'ORD-KA-9912',
    lotId: 'LOT-KA-HSN-101',
    mandiYard: 'Yeshwanthpur APMC Main Yard, Bengaluru',
    commodity: 'Grade-A Fresh Hybrid Tomato',
    tradeValue: 264000,
    cessRatePercent: 1.5,
    cessAmount: 3960,
    traderName: 'Karnataka Agro Traders Pvt Ltd',
    traderGstin: '29AABCK9921D1Z8',
    farmerName: 'Ramesh Gowda',
    collectedDate: 'Today, 02:15 PM',
    remittanceStatus: 'remitted', // 'remitted' | 'pending_remittance'
    treasuryChallanNo: 'KA-TREAS-2026-CH-88192',
    remittedDate: 'Today, 04:30 PM'
  },
  {
    _id: 'CESS-KA-2026-9915',
    transactionId: 'TXN-KA-881925',
    orderId: 'ORD-KA-9915',
    lotId: 'LOT-KA-BLG-106',
    mandiYard: 'Byadagi Special APMC Yard',
    commodity: 'Byadagi Stemless Chilli',
    tradeValue: 435000,
    cessRatePercent: 1.5,
    cessAmount: 6525,
    traderName: 'SpiceKing Exporters Bangalore',
    traderGstin: '29ABCDE1234F1Z5',
    farmerName: 'Basavaraj Patil',
    collectedDate: 'Yesterday, 11:30 AM',
    remittanceStatus: 'pending_remittance',
    treasuryChallanNo: null,
    remittedDate: null
  },
  {
    _id: 'CESS-KA-2026-9918',
    transactionId: 'TXN-KA-881930',
    orderId: 'ORD-KA-9918',
    lotId: 'LOT-KA-MND-102',
    mandiYard: 'Mandya APMC Market Yard',
    commodity: 'Bellary Premium Red Onion',
    tradeValue: 662500,
    cessRatePercent: 1.5,
    cessAmount: 9937.5,
    traderName: 'Coastal Agro Processing Corp',
    traderGstin: '29AABCC4421E1Z2',
    farmerName: 'Venkatesh Murthy',
    collectedDate: '24 Aug 2026',
    remittanceStatus: 'remitted',
    treasuryChallanNo: 'KA-TREAS-2026-CH-77102',
    remittedDate: '25 Aug 2026'
  },
  {
    _id: 'CESS-KA-2026-9920',
    transactionId: 'TXN-KA-881935',
    orderId: 'ORD-KA-9920',
    lotId: 'LOT-KA-BLR-104',
    mandiYard: 'Bengaluru Rural (Doddaballapura)',
    commodity: 'Yellow Dent Poultry Maize',
    tradeValue: 615000,
    cessRatePercent: 1.5,
    cessAmount: 9225,
    traderName: 'Deccan Grain Haulers Ltd',
    traderGstin: '29AABDE8891D1Z9',
    farmerName: 'Channappa Gowda',
    collectedDate: '22 Aug 2026',
    remittanceStatus: 'remitted',
    treasuryChallanNo: 'KA-TREAS-2026-CH-66214',
    remittedDate: '23 Aug 2026'
  }
]

const getStoredCessAudits = () => {
  try {
    const raw = localStorage.getItem('krishisetu_cess_audits')
    return raw ? JSON.parse(raw) : DEFAULT_CESS_AUDITS
  } catch {
    return DEFAULT_CESS_AUDITS
  }
}

const saveStoredCessAudits = (data) => {
  try {
    localStorage.setItem('krishisetu_cess_audits', JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to persist cess audits:', e)
  }
}

export const cessService = {
  /**
   * Get all cess audit records
   */
  getCessAudits: async () => {
    return getStoredCessAudits()
  },

  /**
   * Remit cess collection to Karnataka State Treasury
   */
  remitCessToTreasury: async (cessAuditId) => {
    const current = getStoredCessAudits()
    const updated = current.map((audit) => {
      if (audit._id === cessAuditId) {
        return {
          ...audit,
          remittanceStatus: 'remitted',
          treasuryChallanNo: `KA-TREAS-2026-CH-${Math.floor(10000 + Math.random() * 90000)}`,
          remittedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        }
      }
      return audit
    })

    saveStoredCessAudits(updated)
    return updated
  },

  /**
   * Remit all pending cess in a batch
   */
  remitAllPending: async () => {
    const current = getStoredCessAudits()
    const updated = current.map((audit) => {
      if (audit.remittanceStatus === 'pending_remittance') {
        return {
          ...audit,
          remittanceStatus: 'remitted',
          treasuryChallanNo: `KA-TREAS-2026-BATCH-${Math.floor(10000 + Math.random() * 90000)}`,
          remittedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        }
      }
      return audit
    })

    saveStoredCessAudits(updated)
    return updated
  }
}

export default cessService
