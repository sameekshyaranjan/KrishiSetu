import api from './api'

/**
 * KrishiSetu Escrow & Trader Wallet Service
 * Connects directly to backend /api/wallet endpoints for real-time balance & ledger management.
 * Production-ready architecture supporting both Sandbox Development Top-Up and Gateway integration.
 */

export const escrowService = {
  /**
   * Get real wallet balances, locked escrow, and transaction ledger
   */
  getWalletOverview: async () => {
    try {
      const res = await api.get('/wallet/overview')
      const data = res?.data || res
      return {
        availableBalance: Number(data.availableBalance) || 0,
        lockedEscrow: Number(data.lockedEscrow) || 0,
        totalDisbursed: Number(data.totalDisbursed) || 0,
        totalDeposited: Number(data.totalDeposited) || 0,
        transactions: Array.isArray(data.transactions) ? data.transactions : []
      }
    } catch (err) {
      console.warn('[escrowService] Failed to load wallet overview:', err.message)
      return {
        availableBalance: 0,
        lockedEscrow: 0,
        totalDisbursed: 0,
        totalDeposited: 0,
        transactions: []
      }
    }
  },

  /**
   * Top-Up Escrow Bidding Capital (Development Sandbox / Escrow Injection)
   */
  depositFunds: async (amount, paymentMethod) => {
    const idempotencyKey = `topup-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const payload = {
      amount: Number(amount),
      paymentMethod: paymentMethod || 'Instant NetBanking / UPI',
      idempotencyKey
    }

    const res = await api.post('/wallet/topup', payload)
    const data = res?.data || res
    return {
      availableBalance: Number(data.availableBalance) || 0,
      lockedEscrow: Number(data.lockedEscrow) || 0,
      totalDisbursed: Number(data.totalDisbursed) || 0,
      totalDeposited: Number(data.totalDeposited) || 0,
      transactions: Array.isArray(data.transactions) ? data.transactions : []
    }
  },

  /**
   * Release Escrow Payout upon Delivery / Weighbridge pass
   */
  releaseEscrowPayout: async (txId) => {
    const res = await api.put(`/transactions/${txId}/logistics`, { status: 'delivered' })
    const data = res?.data || res
    return data
  }
}

export default escrowService
