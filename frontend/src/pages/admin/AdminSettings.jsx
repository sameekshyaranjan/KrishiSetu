import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
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

export const AdminSettings = () => {
  const { user } = useAuth()
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = (e) => {
    e?.preventDefault()
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('State APMC regulatory policy & platform parameters updated successfully! 🟢')
    }, 600)
  }

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS)
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
              <span className="text-[10px] text-muted-foreground block">Statutory standard: 0.50%</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Escrow Buyer Lock (%)</label>
              <input
                type="number"
                value={settings.escrowAdvancePercent}
                onChange={(e) => handleChange('escrowAdvancePercent', parseInt(e.target.value))}
                className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-mono"
              />
              <span className="text-[10px] text-muted-foreground block">Default: 100% upfront lock</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Min Trade Lot Value (₹)</label>
              <input
                type="number"
                step="1000"
                value={settings.minTradeValue}
                onChange={(e) => handleChange('minTradeValue', parseInt(e.target.value))}
                className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-mono"
              />
              <span className="text-[10px] text-muted-foreground block">Minimum auction threshold</span>
            </div>
          </div>
        </div>

        {/* Section 2: Stakeholder KYC & Land Record Integration */}
        <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border space-y-5 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-foreground">
                2. Stakeholder KYC & Bhoomi Land Registry Integration
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Automate real-time verification against the Karnataka Revenue Department Bhoomi database.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border">
              <div>
                <p className="font-extrabold text-foreground">Auto-Verify Bhoomi RTC Landholdings</p>
                <span className="text-[11px] text-muted-foreground">
                  Match farmer survey numbers with Bhoomi state database automatically
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleChange('autoVerifyBhoomiRtc', !settings.autoVerifyBhoomiRtc)}
                className="text-purple-600 ml-4"
              >
                {settings.autoVerifyBhoomiRtc ? (
                  <ToggleRight className="w-8 h-8 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border">
              <div>
                <p className="font-extrabold text-foreground">Mandatory GSTIN for Wholesale Bidders</p>
                <span className="text-[11px] text-muted-foreground">
                  Enforce active 29AABCK... state GST identification before bidding
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleChange('requireGstinForBidding', !settings.requireGstinForBidding)}
                className="text-purple-600 ml-4"
              >
                {settings.requireGstinForBidding ? (
                  <ToggleRight className="w-8 h-8 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border">
              <div>
                <p className="font-extrabold text-foreground">Mandatory FSSAI for Grain Lots</p>
                <span className="text-[11px] text-muted-foreground">
                  Require food safety registration for processed pulses and grains
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleChange('requireFssaiForProcessed', !settings.requireFssaiForProcessed)}
                className="text-purple-600 ml-4"
              >
                {settings.requireFssaiForProcessed ? (
                  <ToggleRight className="w-8 h-8 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                )}
              </button>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-muted/40 border border-border">
              <label className="font-bold text-foreground">Min APMC License Buffer (Months)</label>
              <input
                type="number"
                value={settings.minLicenseValidityMonths}
                onChange={(e) => handleChange('minLicenseValidityMonths', parseInt(e.target.value))}
                className="w-full h-9 px-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-mono"
              />
              <span className="text-[10px] text-muted-foreground block">
                Flag renewal notice when license expiry is within X months
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Digital Auction & Market Rules Engine */}
        <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border space-y-5 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold">
              <Gavel className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-foreground">
                3. Digital Auction Engine & Anti-Sniping Rules
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Configure fair bidding parameters and automatic auction extension triggers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Default Auction Window (Hours)</label>
              <input
                type="number"
                value={settings.defaultAuctionHours}
                onChange={(e) => handleChange('defaultAuctionHours', parseInt(e.target.value))}
                className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-mono"
              />
              <span className="text-[10px] text-muted-foreground block">Default: 24 Hours</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Min Bid Increment (₹/Qtl)</label>
              <input
                type="number"
                value={settings.minBidIncrementRupees}
                onChange={(e) => handleChange('minBidIncrementRupees', parseInt(e.target.value))}
                className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-mono"
              />
              <span className="text-[10px] text-muted-foreground block">Default: ₹50 / Quintal</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Anti-Sniping Extension (Mins)</label>
              <input
                type="number"
                value={settings.antiSnipingExtensionMinutes}
                onChange={(e) => handleChange('antiSnipingExtensionMinutes', parseInt(e.target.value))}
                className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-mono"
              />
              <span className="text-[10px] text-muted-foreground block">Auto-extends if bid placed in last 5m</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Buyout Premium Cap (%)</label>
              <input
                type="number"
                value={settings.maxBuyoutPremiumPercent}
                onChange={(e) => handleChange('maxBuyoutPremiumPercent', parseInt(e.target.value))}
                className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-mono"
              />
              <span className="text-[10px] text-muted-foreground block">Instant Buyout Cap vs Reserve</span>
            </div>
          </div>
        </div>

        {/* Section 4: Communication Gateways & Telemetry */}
        <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border space-y-5 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-foreground">
                4. Communication Gateways & Real-Time Telemetry
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Configure regional SMS messaging hubs and live WebSocket push frequencies.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Official SMS Gateway Provider</label>
              <input
                type="text"
                value={settings.smsGatewayProvider}
                onChange={(e) => handleChange('smsGatewayProvider', e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-mono"
              />
              <span className="text-[10px] text-muted-foreground block">CDAC e-Gov SMS Hub (State Agriculture)</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border">
              <div>
                <p className="font-extrabold text-foreground">Automatic Kannada SMS Translation</p>
                <span className="text-[11px] text-muted-foreground">
                  Send transactional SMS alerts in Kannada (ಕನ್ನಡ) for rural farmers
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleChange('enableKannadaSms', !settings.enableKannadaSms)}
                className="text-purple-600 ml-4"
              >
                {settings.enableKannadaSms ? (
                  <ToggleRight className="w-8 h-8 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Save Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button 
            type="button"
            variant="outline" 
            onClick={handleReset}
            className="rounded-xl text-xs h-11 px-6 shadow-sm"
          >
            Discard Changes
          </Button>

          <Button 
            type="submit"
            disabled={isSaving}
            className="rounded-xl text-xs font-bold h-11 px-8 bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
          >
            <Save className={`w-4 h-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Saving Parameters...' : 'Apply & Publish Policy Rules 🚀'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AdminSettings
