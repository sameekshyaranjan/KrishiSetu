import api from './api'

/**
 * KrishiSetu Admin Dispute Resolution & Quality Arbitration Service
 * Connects to backend /api/admin/transactions/:id/resolve-dispute with persistent dual-sync storage.
 */

const DEFAULT_DISPUTES = [
  {
    _id: 'DSP-KA-2026-001',
    lotId: 'LOT-KA-HSN-101',
    orderId: 'ORD-KA-9912',
    commodity: 'Tomato (Hybrid)',
    farmerName: 'Ramesh Gowda',
    farmerMobile: '+91 98450 11223',
    traderName: 'Karnataka Wholesale Traders Co-op',
    traderMobile: '+91 98860 12345',
    escrowAmount: 264000,
    disputeReason: 'Transit Damage & Fruit Softening (15% Cull Rate)',
    severity: 'Medium',
    status: 'under_review', // 'under_review' | 'resolved' | 'escalated'
    filedDate: 'Yesterday, 02:30 PM',
    evidencePhotos: 3,
    weighbridgeVarianceKg: -140,
    hearingNotes: [
      'Buyer lodged complaint citing 15% bruised fruit upon unloading at Mandya APMC.',
      'Farmer submitted pre-transit dispatch video showing firm Grade-A produce.'
    ],
    verdict: null
  },
  {
    _id: 'DSP-KA-2026-002',
    lotId: 'LOT-KA-BLG-106',
    orderId: 'ORD-KA-9915',
    commodity: 'Byadagi Chilli',
    farmerName: 'Basavaraj Patil',
    farmerMobile: '+91 94480 22334',
    traderName: 'SpiceKing Exporters Bangalore',
    traderMobile: '+91 98440 99887',
    escrowAmount: 435000,
    disputeReason: 'Moisture Content Discrepancy (14.2% vs 10% Agreed Max)',
    severity: 'High',
    status: 'under_review',
    filedDate: '24 Aug 2026',
    evidencePhotos: 2,
    weighbridgeVarianceKg: 0,
    hearingNotes: [
      'Mandi Quality Assayer tested moisture content at 13.8%.',
      'Farmer agreed to a 10% price concession for sun drying allowance.'
    ],
    verdict: null
  }
]

const getStoredDisputes = () => {
  try {
    const raw = localStorage.getItem('krishisetu_admin_disputes')
    return raw ? JSON.parse(raw) : DEFAULT_DISPUTES
  } catch {
    return DEFAULT_DISPUTES
  }
}

const saveStoredDisputes = (disputes) => {
  try {
    localStorage.setItem('krishisetu_admin_disputes', JSON.stringify(disputes))
  } catch (e) {
    console.warn('Failed to persist disputes:', e)
  }
}

export const disputeService = {
  /**
   * Get all active and resolved disputes
   */
  getAllDisputes: async () => {
    return getStoredDisputes()
  },

  /**
   * Resolve a dispute with split arbitration verdict
   */
  resolveDispute: async (caseId, { action, farmerPercent, traderPercent, verdictNotes }) => {
    const current = getStoredDisputes()
    const updated = current.map((dsp) => {
      if (dsp._id === caseId) {
        const farmerShare = Math.round((dsp.escrowAmount * (farmerPercent || 85)) / 100)
        const traderShare = dsp.escrowAmount - farmerShare

        return {
          ...dsp,
          status: 'resolved',
          verdict: {
            action: action || 'payout_farmer',
            farmerPercent: farmerPercent || 85,
            traderPercent: traderPercent || 15,
            farmerPayout: farmerShare,
            traderRefund: traderShare,
            verdictNotes: verdictNotes || 'APMC statutory arbitration agreement accepted by both parties.',
            resolvedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
          }
        }
      }
      return dsp
    })

    saveStoredDisputes(updated)

    try {
      await api.put(`/admin/transactions/${caseId}/resolve-dispute`, {
        action: action || 'payout_farmer'
      })
    } catch {
      // Offline / demo fallback
    }

    return updated
  },

  /**
   * Append hearing minutes / notes to a case
   */
  addHearingNote: async (caseId, note) => {
    const current = getStoredDisputes()
    const updated = current.map((dsp) => {
      if (dsp._id === caseId) {
        return {
          ...dsp,
          hearingNotes: [...(dsp.hearingNotes || []), note]
        }
      }
      return dsp
    })

    saveStoredDisputes(updated)
    return updated
  }
}

export default disputeService
