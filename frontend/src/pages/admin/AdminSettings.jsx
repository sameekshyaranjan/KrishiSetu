import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import settingsService from '@/services/settingsService'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  Settings, 
  Landmark, 
  ShieldCheck, 
  Gavel, 
  Smartphone, 
  Save, 
  RotateCcw, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  ToggleLeft, 
  ToggleRight, 
  Radio, 
  Sparkles, 
  Layers, 
  Lock, 
  Globe
} from 'lucide-react'

export const AdminSettings = () => {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    apmcCessPercent: 1.50,
    ruralCessPercent: 0.50,
    escrowAdvancePercent: 100,
    minTradeValue: 10000,
    autoVerifyBhoomiRtc: true,
    requireGstinForBidding: true,
    requireFssaiForProcessed: true,
    minLicenseValidityMonths: 6,
    defaultAuctionHours: 24,
    minBidIncrementRupees: 50,
    antiSnipingExtensionMinutes: 5,
    maxBuyoutPremiumPercent: 25,
    smsGatewayProvider: 'CDAC e-Gov Mobile Gateway (Govt of India)',
    enableKannadaSms: true,
    socketPushIntervalSeconds: 3,
    maintenanceMode: false
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      const data = await settingsService.getSettings()
      if (data) setSettings(data)
    }
    loadSettings()
  }, [])

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async (e) => {
    e?.preventDefault()
    setIsSaving(true)
    try {
      await settingsService.updateSettings(settings)
      toast.success('State APMC regulatory policy & platform parameters updated successfully! 🟢')
    } catch {
      toast.error('Failed to update settings.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    const defaults = await settingsService.resetDefaults()
    setSettings(defaults)
    toast.success('Statutory default parameters restored.')
  }

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(settings, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `krishisetu_admin_policy_${Date.now()}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    toast.success('Policy configuration exported to JSON!')
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-semibold border border-purple-500/20 mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Karnataka State APMC Regulatory Rules Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Platform Governance & APMC Policy Config ⚙️
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure statutory market fee percentages, Bhoomi land record verification toggles, and auction engine anti-sniping rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            className="rounded-xl text-xs h-10 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Restore Defaults
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
            className="rounded-xl text-xs h-10 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export JSON
          </Button>

          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl text-xs h-10 px-5 font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md"
          >
            <Save className={`w-4 h-4 mr-1.5 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Saving...' : 'Save Parameters'}
          </Button>
        </div>
      </div>

      {/* 2. 4 Policy Parameter KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Statutory APMC Fee</span>
          <p className="text-2xl font-black text-emerald-600">{settings.apmcCessPercent}%</p>
          <span className="text-[11px] text-emerald-600 font-bold">Section 65 Karnataka Act</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Rural Dev Cess Rate</span>
          <p className="text-2xl font-black text-purple-600">{settings.ruralCessPercent}%</p>
          <span className="text-[11px] text-muted-foreground">Mandi Road Maintenance</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Escrow Security Deposit</span>
          <p className="text-2xl font-black text-primary">{settings.escrowAdvancePercent}%</p>
          <span className="text-[11px] text-primary font-bold">100% Upfront Buyer Lock</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Bhoomi RTC Integration</span>
          <p className="text-2xl font-black text-foreground">Active 🟢</p>
          <span className="text-[11px] text-emerald-600 font-bold">Govt API Synchronized</span>
        </div>
      </div>

      {/* 3. Main 4-Section Configuration Form */}
      <form onSubmit={handleSave} className="space-y-6 text-xs">
        
        {/* Section 1: Statutory Cess & Escrow Ratios */}
        <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border space-y-5 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-foreground">
                1. Statutory APMC Market Cess & Escrow Ratios
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Govern fiscal percentages remitted directly into the Karnataka State Treasury.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">APMC Market Fee (%)</label>
              <input
                type="number"
                step="0.01"
                value={settings.apmcCessPercent}
                onChange={(e) => handleChange('apmcCessPercent', parseFloat(e.target.value))}
                className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-mono"
              />
              <span className="text-[10px] text-muted-foreground block">Statutory standard: 1.50%</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Rural Dev Cess (%)</label>
              <input
                type="number"
                step="0.01"
                value={settings.ruralCessPercent}
                onChange={(e) => handleChange('ruralCessPercent', parseFloat(e.target.value))}
                className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-mono"
              />
              <span className="text-[10px] text-muted-foreground block">Rural roads levy: 0.50%</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Escrow Upfront Lock (%)</label>
              <input
                type="number"
                value={settings.escrowAdvancePercent}
                onChange={(e) => handleChange('escrowAdvancePercent', parseInt(e.target.value, 10))}
                className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-mono"
              />
              <span className="text-[10px] text-muted-foreground block">Mandatory 100% full lock</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Minimum Lot Value (₹)</label>
              <input
                type="number"
                value={settings.minTradeValue}
                onChange={(e) => handleChange('minTradeValue', parseInt(e.target.value, 10))}
                className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-mono"
              />
              <span className="text-[10px] text-muted-foreground block">Minimum auction threshold</span>
            </div>
          </div>
        </div>

        {/* Section 2: Auction Engine & Anti-Sniping Parameters */}
        <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border space-y-5 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold">
              <Gavel className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-foreground">
                2. Real-Time Auction Engine & Anti-Sniping Windows
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Fair-trade bidding extensions preventing last-second algorithmic sniping.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Anti-Sniping Extension (Minutes)</label>
              <input
                type="number"
                value={settings.antiSnipingExtensionMinutes}
                onChange={(e) => handleChange('antiSnipingExtensionMinutes', parseInt(e.target.value, 10))}
                className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
              />
              <span className="text-[10px] text-muted-foreground block">Adds +5m if bid in final 2 mins</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Minimum Bid Increment (₹ / Qtl)</label>
              <input
                type="number"
                value={settings.minBidIncrementRupees}
                onChange={(e) => handleChange('minBidIncrementRupees', parseInt(e.target.value, 10))}
                className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
              />
              <span className="text-[10px] text-muted-foreground block">Minimum auction tick</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Default Auction Duration (Hours)</label>
              <input
                type="number"
                value={settings.defaultAuctionHours}
                onChange={(e) => handleChange('defaultAuctionHours', parseInt(e.target.value, 10))}
                className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
              />
              <span className="text-[10px] text-muted-foreground block">Standard lot expiration</span>
            </div>
          </div>
        </div>

        {/* Section 3: SMS Gateway & Emergency Maintenance */}
        <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border space-y-5 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-foreground">
                3. CDAC e-Gov SMS Gateway & Platform Operational Status
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Manage bilingual push notification gateways and system-wide maintenance locks.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">SMS Gateway Provider</label>
              <input
                type="text"
                value={settings.smsGatewayProvider}
                onChange={(e) => handleChange('smsGatewayProvider', e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border border-border">
              <div>
                <span className="font-bold text-foreground block">Platform Maintenance Lock</span>
                <span className="text-[11px] text-muted-foreground">Temporarily halt live auctions for APMC annual audits</span>
              </div>
              <button
                type="button"
                onClick={() => handleChange('maintenanceMode', !settings.maintenanceMode)}
                className="cursor-pointer"
              >
                {settings.maintenanceMode ? (
                  <ToggleRight className="w-8 h-8 text-rose-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AdminSettings
