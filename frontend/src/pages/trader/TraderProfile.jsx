import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  Building2, 
  ShieldCheck, 
  Landmark, 
  FileText, 
  CheckCircle2, 
  Download, 
  Save, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Lock, 
  ExternalLink, 
  Upload, 
  AlertCircle, 
  Sparkles,
  RefreshCw,
  Copy
} from 'lucide-react'

const TABS = [
  { id: 'business', label: '🏢 Business Identity & APMC License' },
  { id: 'banking', label: '🏛️ Banking & Escrow Mandate' },
  { id: 'kyc', label: '📄 Statutory KYC Documents' }
]

export const TraderProfile = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('business')
  const [isSaving, setIsSaving] = useState(false)

  // Form State
  const [profileData, setProfileData] = useState({
    companyName: user?.name || 'Karnataka Agro Traders Pvt Ltd',
    contactPerson: 'Suresh Hegde',
    email: user?.email || 'trader1@krishisetu.com',
    phone: '+91 98860 55432',
    panNumber: 'AABCK9921D',
    gstin: '29AABCK9921D1Z8',
    apmcLicense: 'KA-BLR-TRD-2026',
    apmcYard: 'Yeshwanthpur APMC Main Market Yard, Bengaluru',
    licenseCategory: 'Category-A: Bulk Procurement & Food Processing',
    validUntil: '31 March 2028',
    address: 'Plot #42, APMC Yard Gate #4, Yeshwanthpur, Bengaluru - 560022',
    bankName: 'HDFC Bank Ltd',
    accountNumber: '50200088992144',
    ifscCode: 'HDFC0000240',
    accountType: 'Corporate Current Account',
    mandateLimit: '₹50,00,000'
  })

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const handleSave = (e) => {
    e.preventDefault()
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Trader corporate credentials & APMC details saved successfully! 🎉')
    }, 600)
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* 1. Header & Verification Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>APMC Karnataka Verified License #{profileData.apmcLicense}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Trader Profile & KYC Credentials 🛡️
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your legal entity credentials, APMC trading authorization, and corporate banking escrow settlement accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => toast.success('APMC Verified License Certificate PDF downloaded!')}
            variant="outline" 
            size="sm" 
            className="rounded-xl text-xs h-10 shadow-sm"
          >
            <Download className="w-4 h-4 mr-1.5" /> Download License
          </Button>

          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl text-xs h-10 px-5 font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1.5" />
            )}
            Save Profile
          </Button>
        </div>
      </div>

      {/* 2. 4 Statutory Verification KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">APMC License Validity</span>
          <p className="text-xl font-black text-emerald-600">Active (31 Mar 2028)</p>
          <span className="text-[11px] text-muted-foreground">Govt of Karnataka Approved</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Trading Jurisdiction</span>
          <p className="text-base font-extrabold text-foreground truncate">Yeshwanthpur APMC</p>
          <span className="text-[11px] text-muted-foreground">State-Wide Procurement</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">GSTIN Status</span>
          <p className="text-xl font-black text-primary">29AABCK9921D1Z8</p>
          <span className="text-[11px] text-emerald-600 font-bold">100% Tax Compliant</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">e-NACH Escrow Limit</span>
          <p className="text-xl font-black text-amber-600">₹50,00,000</p>
          <span className="text-[11px] text-muted-foreground">NPCI Direct Debit Active</span>
        </div>
      </div>

      {/* 3. Tabbed Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Tab 1: Business Identity & APMC License */}
      {activeTab === 'business' && (
        <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-extrabold text-foreground">Corporate Identity & Trading Authorization</h2>
            <p className="text-xs text-muted-foreground">Official business registration credentials verified under Karnataka APMC bylaws.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Registered Corporate Entity Name</label>
              <input
                type="text"
                value={profileData.companyName}
                onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-background border border-border font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Authorized Signatory / MD Name</label>
              <input
                type="text"
                value={profileData.contactPerson}
                onChange={(e) => setProfileData({ ...profileData, contactPerson: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-background border border-border font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Corporate Email Address</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-background border border-border font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Official Contact Mobile Number</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-background border border-border font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Corporate PAN Card Number</label>
              <input
                type="text"
                readOnly
                value={profileData.panNumber}
                className="w-full h-11 px-4 rounded-xl bg-muted/60 border border-border font-mono font-bold text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">GSTIN Identification Number</label>
              <input
                type="text"
                readOnly
                value={profileData.gstin}
                className="w-full h-11 px-4 rounded-xl bg-muted/60 border border-border font-mono font-bold text-muted-foreground"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-foreground">Principal Place of Business / Yard Address</label>
              <input
                type="text"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-background border border-border font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-extrabold text-amber-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" /> APMC Unified Trading License: {profileData.apmcLicense}
              </span>
              <p className="text-[11px] text-muted-foreground">{profileData.licenseCategory} • Valid until {profileData.validUntil}</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border border-emerald-500/20">
              Verified 🟢
            </span>
          </div>
        </form>
      )}

      {/* 5. Tab 2: Banking & Escrow Settlement Account */}
      {activeTab === 'banking' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-extrabold text-foreground">Banking & Automated Escrow Settlement</h2>
            <p className="text-xs text-muted-foreground">Connected institutional bank account for auction escrow deposits and direct farmer disbursements.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
              <span className="text-[11px] text-muted-foreground">Settlement Bank Name</span>
              <p className="font-black text-sm text-foreground flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-amber-600" /> {profileData.bankName}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground">Corporate Current A/C</span>
                <button 
                  onClick={() => handleCopy(profileData.accountNumber, 'Account Number')}
                  className="text-primary hover:underline flex items-center gap-0.5"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <p className="font-mono font-black text-sm text-foreground">•••• •••• •••• {profileData.accountNumber.slice(-4)}</p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground">Bank IFSC Code</span>
                <button 
                  onClick={() => handleCopy(profileData.ifscCode, 'IFSC Code')}
                  className="text-primary hover:underline flex items-center gap-0.5"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <p className="font-mono font-black text-sm text-primary">{profileData.ifscCode}</p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
              <span className="text-[11px] text-muted-foreground">Account Category</span>
              <p className="font-bold text-foreground">{profileData.accountType}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                e-NACH Direct Debit Mandate Status: Active
              </span>
              <span className="font-mono font-bold text-emerald-700">Limit: {profileData.mandateLimit}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Enables instant 1-click escrow bidding on lots up to ₹50 Lakhs without needing manual OTP verification on every individual auction increment.
            </p>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Statutory KYC Documents */}
      {activeTab === 'kyc' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-extrabold text-foreground">Verified Statutory Documents & Licenses</h2>
            <p className="text-xs text-muted-foreground">Government regulatory permits submitted and verified for legal agricultural commodity commerce.</p>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* Doc 1: APMC License */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Karnataka APMC Unified Wholesale Trading License</p>
                  <span className="text-[11px] text-muted-foreground font-mono">License #{profileData.apmcLicense} • Verified</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20">
                Active 🟢
              </span>
            </div>

            {/* Doc 2: FSSAI License */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-foreground">FSSAI Central Food Safety & Standards License</p>
                  <span className="text-[11px] text-muted-foreground font-mono">Reg #10020043000192 • Verified</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20">
                Active 🟢
              </span>
            </div>

            {/* Doc 3: Certificate of Incorporation */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Ministry of Corporate Affairs (MCA) Incorporation</p>
                  <span className="text-[11px] text-muted-foreground font-mono">CIN #U01111KA2020PTC138812 • Verified</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20">
                Active 🟢
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TraderProfile
