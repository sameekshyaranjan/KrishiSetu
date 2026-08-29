import api from './api'

/**
 * KrishiSetu Platform Settings & APMC Regulatory Policy Service
 * Manages statutory market cess rates, anti-sniping auction windows, and SMS gateway configs.
 */

const DEFAULT_SETTINGS = {
  // 1. Statutory Cess & Escrow
  apmcCessPercent: 1.50,
  ruralCessPercent: 0.50,
  escrowAdvancePercent: 100,
  minTradeValue: 10000,

  // 2. KYC & Bhoomi Land Registry
  autoVerifyBhoomiRtc: true,
  requireGstinForBidding: true,
  requireFssaiForProcessed: true,
  minLicenseValidityMonths: 6,

  // 3. Auction Engine & Market Rules
  defaultAuctionHours: 24,
  minBidIncrementRupees: 50,
  antiSnipingExtensionMinutes: 5,
  maxBuyoutPremiumPercent: 25,

  // 4. Gateways & Telemetry
  smsGatewayProvider: 'CDAC e-Gov Mobile Gateway (Govt of India)',
  enableKannadaSms: true,
  socketPushIntervalSeconds: 3,
  maintenanceMode: false
}

const getStoredSettings = () => {
  try {
    const raw = localStorage.getItem('krishisetu_platform_settings')
    return raw ? JSON.parse(raw) : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

const saveStoredSettings = (data) => {
  try {
    localStorage.setItem('krishisetu_platform_settings', JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to persist settings:', e)
  }
}

export const settingsService = {
  /**
   * Get current platform settings
   */
  getSettings: async () => {
    return getStoredSettings()
  },

  /**
   * Save updated policy configurations
   */
  updateSettings: async (payload) => {
    const current = getStoredSettings()
    const updated = { ...current, ...payload }
    saveStoredSettings(updated)
    return updated
  },

  /**
   * Reset to statutory defaults
   */
  resetDefaults: async () => {
    saveStoredSettings(DEFAULT_SETTINGS)
    return DEFAULT_SETTINGS
  }
}

export default settingsService
