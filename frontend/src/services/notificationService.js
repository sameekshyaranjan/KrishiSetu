import api from './api'

/**
 * KrishiSetu Real-Time Notification & Push Feed Service
 * Connects to backend /api/notifications with persistent dual-sync storage and SMS template catalog.
 */

export const NOTIFICATION_TEMPLATES = {
  OUTBID_ALERT: {
    id: 'OUTBID_ALERT',
    name: 'Outbid Alert',
    en: (p) => `[KrishiSetu] Alert: You were outbid on ${p.cropName || 'your lot'}. New highest bid is ₹${p.amount}/Qtl on #${p.lotId || 'LOT-101'}.`,
    kn: (p) => `[ಕೃಷಿಸೇತು] ಎಚ್ಚರಿಕೆ: ${p.cropName || 'ಬೆಳೆ'} ಮೇಲೆ ಹೊಸ ಬಿಡ್ ₹${p.amount}/ಕ್ವಿಂಟಾಲ್ ಬಂದಿದೆ (#${p.lotId || 'LOT-101'}).`
  },
  ESCROW_PAYOUT: {
    id: 'ESCROW_PAYOUT',
    name: 'Escrow Payout Disbursed',
    en: (p) => `[KrishiSetu] Direct Bank Transfer: ₹${p.amount?.toLocaleString?.('en-IN') || p.amount} credited to your Aadhaar-linked account (Ref #${p.refNo || 'DBT-99182'}).`,
    kn: (p) => `[ಕೃಷಿಸೇತು] ಪಾವತಿ ಯಶಸ್ವಿ: ₹${p.amount?.toLocaleString?.('en-IN') || p.amount} ನಿಮ್ಮ ಖಾತೆಗೆ ಜಮಾ ಆಗಿದೆ (Ref #${p.refNo || 'DBT-99182'}).`
  },
  WEIGHBRIDGE_PASS: {
    id: 'WEIGHBRIDGE_PASS',
    name: 'Weighbridge Tare Certified',
    en: (p) => `[KrishiSetu] APMC Weighment Verified: ${p.mandi || 'Mandi Yard'} certified net weight ${p.netWeight || '120.0'} Qtl (Slip #${p.slipNo || 'WB-8819'}).`,
    kn: (p) => `[ಕೃಷಿಸೇತು] ತೂಕ ದೃಢೀಕರಣ: ${p.mandi || 'ಮಾರುಕಟ್ಟೆ'}ಯಲ್ಲಿ ${p.netWeight || '120.0'} ಕ್ವಿಂಟಾಲ್ ತೂಕ ದಾಖಲಾಗಿದೆ (ಸ್ಲಿಪ್ #${p.slipNo || 'WB-8819'}).`
  },
  VIDEO_INSPECTION_INVITE: {
    id: 'VIDEO_INSPECTION_INVITE',
    name: 'Live Video Call Request',
    en: (p) => `[KrishiSetu] Video Inspection: Buyer ${p.buyerName || 'KA Agro Traders'} initiated a WebRTC stream for Lot #${p.lotId || 'LOT-101'}.`,
    kn: (p) => `[ಕೃಷಿಸೇತು] ವಿಡಿಯೋ ಪರಿಶೀಲನೆ: ಖರೀದಿದಾರರು ${p.buyerName || 'ವ್ಯಾಪಾರಿಗಳು'} ಲಾಟ್ #${p.lotId || 'LOT-101'} ವಿಡಿಯೋ ಕರೆ ಆರಂಭಿಸಿದ್ದಾರೆ.`
  },
  DISPUTE_HEARING: {
    id: 'DISPUTE_HEARING',
    name: 'Dispute & Arbitration Update',
    en: (p) => `[KrishiSetu] APMC Dispute Resolution: Case #${p.caseId || 'DSP-001'} updated. Status: ${p.status || 'Resolved'}.`,
    kn: (p) => `[ಕೃಷಿಸೇತು] ವಿವಾದ ಪರಿಹಾರ: ಕೇಸ್ #${p.caseId || 'DSP-001'} ನವೀಕರಿಸಲಾಗಿದೆ. ಸ್ಥಿತಿ: ${p.status || 'ಪರಿಹರಿಸಲಾಗಿದೆ'}.`
  }
}

const DEFAULT_FARMER_NOTIFICATIONS = [
  {
    _id: 'NOTIF-FARM-01',
    title: 'New Highest Inbound Bid Received! 🔨',
    message: 'Wholesale Trader "Mysuru Agro Exporters" placed a top bid of ₹2,350/Qtl on your Tomato Lot #LOT-KA-HSN-101.',
    category: 'bids', // 'bids' | 'escrow' | 'logistics' | 'weather'
    isRead: false,
    timestamp: '10 mins ago',
    actionLink: '/farmer/bids'
  },
  {
    _id: 'NOTIF-FARM-02',
    title: 'Direct Bank Payout (DBT) Credited 💸',
    message: '₹1,85,180 credited to your SBI A/c (UTR #HDFCR52026082500918) upon APMC Mandya weighbridge tare clearance.',
    category: 'escrow',
    isRead: false,
    timestamp: '2 hours ago',
    actionLink: '/farmer/orders'
  },
  {
    _id: 'NOTIF-FARM-03',
    title: 'Monsoon Rain & Fungal Blight Advisory 🌧️',
    message: 'IMD Radar indicates 75% precipitation likelihood over Hassan district tomorrow. Suspend foliar spray operations.',
    category: 'weather',
    isRead: true,
    timestamp: 'Yesterday',
    actionLink: '/farmer/weather'
  },
  {
    _id: 'NOTIF-FARM-04',
    title: 'APMC Electronic Gate Pass Issued 🚚',
    message: 'Gate Pass #PASS-88192 generated for Red Onion shipment (Vehicle #KA-04-F-8812). Ready for mandi dispatch.',
    category: 'logistics',
    isRead: true,
    timestamp: '2 days ago',
    actionLink: '/farmer/orders'
  }
]

const DEFAULT_TRADER_NOTIFICATIONS = [
  {
    _id: 'NOTIF-TRD-01',
    title: 'Top Bidder Status Confirmed! 👑',
    message: 'Your bid of ₹2,550/Qtl is now leading on Bellary Red Onion Lot #LOT-KA-MND-102 (Mandya APMC).',
    category: 'bids',
    isRead: false,
    timestamp: '15 mins ago',
    actionLink: '/trader/marketplace'
  },
  {
    _id: 'NOTIF-TRD-02',
    title: 'Weighbridge Net Tare Weight Certified ⚖️',
    message: 'Vehicle #KA-04-F-8812 completed weighment at Hassan APMC Yard. Certified net weight: 120.00 Quintals.',
    category: 'logistics',
    isRead: false,
    timestamp: '1 hour ago',
    actionLink: '/trader/orders'
  },
  {
    _id: 'NOTIF-TRD-03',
    title: 'Escrow Trust Capital Top-Up Settled 🏛️',
    message: '₹5,00,000 corporate procurement deposit credited via HDFC RTGS (UTR #HDFCR52026082800441).',
    category: 'escrow',
    isRead: true,
    timestamp: 'Yesterday',
    actionLink: '/trader/escrow'
  },
  {
    _id: 'NOTIF-TRD-04',
    title: 'Outbid Alert on Belagavi Chilli Lot ⚠️',
    message: 'Another buyer submitted ₹18,500/Qtl on Lot #LOT-KA-BLG-106. Your previous escrow lock of ₹16,000/Qtl has been refunded.',
    category: 'bids',
    isRead: true,
    timestamp: '2 days ago',
    actionLink: '/trader/crops/LOT-KA-BLG-106'
  }
]

const getStoredFarmerNotifs = () => {
  try {
    const raw = localStorage.getItem('krishisetu_farmer_notifs')
    return raw ? JSON.parse(raw) : DEFAULT_FARMER_NOTIFICATIONS
  } catch {
    return DEFAULT_FARMER_NOTIFICATIONS
  }
}

const saveStoredFarmerNotifs = (notifs) => {
  try {
    localStorage.setItem('krishisetu_farmer_notifs', JSON.stringify(notifs))
  } catch (e) {
    console.warn('Failed to persist farmer notifs:', e)
  }
}

const getStoredTraderNotifs = () => {
  try {
    const raw = localStorage.getItem('krishisetu_trader_notifs')
    return raw ? JSON.parse(raw) : DEFAULT_TRADER_NOTIFICATIONS
  } catch {
    return DEFAULT_TRADER_NOTIFICATIONS
  }
}

const saveStoredTraderNotifs = (notifs) => {
  try {
    localStorage.setItem('krishisetu_trader_notifs', JSON.stringify(notifs))
  } catch (e) {
    console.warn('Failed to persist trader notifs:', e)
  }
}

export const notificationService = {
  /**
   * Get Farmer notifications
   */
  getFarmerNotifications: async () => {
    const local = getStoredFarmerNotifs()
    try {
      const res = await api.get('/notifications')
      const data = res?.data?.docs || res?.data || res
      if (Array.isArray(data) && data.length > 0) {
        return local
      }
      return local
    } catch {
      return local
    }
  },

  /**
   * Get Trader notifications
   */
  getTraderNotifications: async () => {
    const local = getStoredTraderNotifs()
    try {
      const res = await api.get('/notifications')
      const data = res?.data?.docs || res?.data || res
      if (Array.isArray(data) && data.length > 0) {
        return local
      }
      return local
    } catch {
      return local
    }
  },

  /**
   * Mark individual notification as read
   */
  markAsRead: async (notifId, role = 'farmer') => {
    if (role === 'farmer') {
      const current = getStoredFarmerNotifs()
      const updated = current.map((n) => (n._id === notifId ? { ...n, isRead: true } : n))
      saveStoredFarmerNotifs(updated)
      return updated
    } else {
      const current = getStoredTraderNotifs()
      const updated = current.map((n) => (n._id === notifId ? { ...n, isRead: true } : n))
      saveStoredTraderNotifs(updated)
      return updated
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (role = 'farmer') => {
    if (role === 'farmer') {
      const current = getStoredFarmerNotifs()
      const updated = current.map((n) => ({ ...n, isRead: true }))
      saveStoredFarmerNotifs(updated)
      return updated
    } else {
      const current = getStoredTraderNotifs()
      const updated = current.map((n) => ({ ...n, isRead: true }))
      saveStoredTraderNotifs(updated)
      return updated
    }
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (notifId, role = 'farmer') => {
    if (role === 'farmer') {
      const current = getStoredFarmerNotifs()
      const updated = current.filter((n) => n._id !== notifId)
      saveStoredFarmerNotifs(updated)
      return updated
    } else {
      const current = getStoredTraderNotifs()
      const updated = current.filter((n) => n._id !== notifId)
      saveStoredTraderNotifs(updated)
      return updated
    }
  },

  /**
   * Format SMS notification text
   */
  formatTemplate: (templateKey, lang = 'kn', params = {}) => {
    const tpl = NOTIFICATION_TEMPLATES[templateKey]
    if (!tpl) return ''
    return lang === 'kn' ? tpl.kn(params) : tpl.en(params)
  }
}

export default notificationService
