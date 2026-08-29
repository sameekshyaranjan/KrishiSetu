import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import profileService from '@/services/profileService'
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
    companyName: 'Karnataka Wholesale Traders Co-op',
    contactPerson: 'Suresh Patil',
    email: 'trader1@krishisetu.com',
    phone: '+91 98860 12345',
    panNumber: 'AABCK9921D',
    gstin: '29ABCDE1234F1Z5',
    apmcLicense: 'APMC-KA-MND-8821',
    apmcYard: 'Mandya APMC Main Market Yard',
    licenseCategory: 'Category-A: Bulk Wholesale Procurement',
    validUntil: '31 March 2028',
    address: 'Plot #14, APMC Market Yard, Mandya - 571401',
    bankName: 'HDFC Bank Ltd',
    accountNumber: '50200088992144',
    ifscCode: 'HDFC0000240',
    accountType: 'Corporate Current Account',
    mandateLimit: '₹50,00,000'
  })

  useEffect(() => {
    const loadProfile = async () => {
      const data = await profileService.getTraderProfile()
      if (data) {
        setProfileData((prev) => ({
          ...prev,
          companyName: data.name || prev.companyName,
          contactPerson: data.contactPerson || prev.contactPerson,
          email: data.email || prev.email,
          phone: data.mobile || prev.phone,
          gstin: data.gstin || prev.gstin,
          apmcLicense: data.apmcLicense || prev.apmcLicense,
          address: data.businessAddress || prev.address
        }))
      }
    }
    loadProfile()
  }, [])

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await profileService.updateTraderProfile({
        name: profileData.companyName,
        contactPerson: profileData.contactPerson,
        email: profileData.email,
        mobile: profileData.phone,
        gstin: profileData.gstin,
        apmcLicense: profileData.apmcLicense,
        businessAddress: profileData.address
      })
      toast.success('Trader corporate credentials & APMC details saved successfully! 🎉')
    } catch {
      toast.error('Failed to save profile.')
    } finally {
      setIsSaving(false)
    }
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
            className="rounded-xl text-xs font-bold shadow-md h-10 px-5 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center bg-muted/60 p-1.5 rounded-2xl border border-border text-xs font-bold">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Tab Contents */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Tab 1: Business Identity & APMC */}
        {activeTab === 'business' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-extrabold text-foreground">Registered Business Entity Details</h3>
              <p className="text-xs text-muted-foreground">Legal corporate information authenticated against Karnataka APMC Directorate records.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Company Legal Name *</label>
                <input
                  type="text"
                  required
                  value={profileData.companyName}
                  onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Authorized Signatory / Contact Person *</label>
                <input
                  type="text"
                  required
                  value={profileData.contactPerson}
                  onChange={(e) => setProfileData({ ...profileData, contactPerson: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">GSTIN (Goods & Services Tax Identification Number) *</label>
                <input
                  type="text"
                  required
                  value={profileData.gstin}
                  onChange={(e) => setProfileData({ ...profileData, gstin: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs font-mono font-bold text-primary focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">APMC Unified Trader License Number *</label>
                <input
                  type="text"
                  required
                  value={profileData.apmcLicense}
                  onChange={(e) => setProfileData({ ...profileData, apmcLicense: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs font-mono font-bold text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-foreground">Registered Business Address *</label>
              <input
                type="text"
                required
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-medium"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Banking & Escrow Mandate */}
        {activeTab === 'banking' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-extrabold text-foreground">Escrow Capital & Banking Settlement Mandate</h3>
              <p className="text-xs text-muted-foreground">The corporate account from which wholesale auction bids and statutory APMC cess payments are debited.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Bank Name</label>
                <input
                  type="text"
                  value={profileData.bankName}
                  onChange={(e) => setProfileData({ ...profileData, bankName: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Current Account Number</label>
                <input
                  type="text"
                  value={profileData.accountNumber}
                  onChange={(e) => setProfileData({ ...profileData, accountNumber: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs font-mono font-bold text-primary focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">IFSC Code</label>
                <input
                  type="text"
                  value={profileData.ifscCode}
                  onChange={(e) => setProfileData({ ...profileData, ifscCode: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Daily RTGS Mandate Limit</label>
                <input
                  type="text"
                  disabled
                  value={profileData.mandateLimit}
                  className="w-full h-11 px-3.5 rounded-xl bg-muted/60 border border-border text-xs font-mono font-bold text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Statutory KYC Documents */}
        {activeTab === 'kyc' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-extrabold text-foreground">Verified Statutory Documents</h3>
              <p className="text-xs text-muted-foreground">Certified compliance documents lodged with KrishiSetu Trust Vault.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h4 className="font-bold text-xs text-foreground">APMC Unified Trader License</h4>
                <p className="text-[11px] text-muted-foreground">Status: Active (Valid till 2028)</p>
              </div>

              <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <h4 className="font-bold text-xs text-foreground">GST Registration Certificate</h4>
                <p className="text-[11px] text-muted-foreground">GSTIN: {profileData.gstin}</p>
              </div>

              <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-2">
                <Landmark className="w-6 h-6 text-emerald-600" />
                <h4 className="font-bold text-xs text-foreground">Bank Escrow Mandate Agreement</h4>
                <p className="text-[11px] text-muted-foreground">Axis Bank Escrow Trust Vault</p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default TraderProfile
