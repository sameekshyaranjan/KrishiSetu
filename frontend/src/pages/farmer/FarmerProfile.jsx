import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Sprout, 
  CreditCard, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  Sparkles, 
  Save, 
  Languages, 
  Layers, 
  FileText, 
  Landmark, 
  Award,
  Lock
} from 'lucide-react'

export const FarmerProfile = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('personal') // 'personal' | 'farm' | 'bank'
  const [saving, setSaving] = useState(false)

  // Profile Form State
  const [profileData, setProfileData] = useState({
    // Personal
    name: user?.name || 'Lori Osinski-Rodriguez',
    mobile: user?.mobile || '9845011223',
    email: user?.email || 'farmer1@krishisetu.com',
    language: 'kn', // 'kn' | 'en'
    village: 'Belur Village',
    taluk: 'Belur Taluk',
    district: user?.district || 'Hassan',
    state: 'Karnataka',
    pincode: '573115',

    // Farm & Land
    surveyNumber: 'KA-HSN-SRV-4412/A',
    landArea: 4.5,
    landUnit: 'Acres',
    soilType: 'Red Loam (Suitable for Horticulture)',
    irrigationSource: 'Borewell with Solar Drip Irrigation',
    sowingSeason: 'Kharif & Rabi Dual Season',
    cropsGrown: ['Tomato', 'Red Onion', 'Ragi', 'Yellow Maize', 'Potato'],

    // Banking & Escrow Settlement
    accountHolderName: user?.name || 'Lori Osinski-Rodriguez',
    accountNumber: '•••• •••• •••• 4492',
    rawAccountNumber: '50100492814492',
    ifscCode: 'HDFC0001234',
    bankName: 'HDFC Bank Ltd',
    branchName: 'Hassan Central Branch',
    upiId: 'farmer1@okhdfcbank',
    autoDisburse: true,
    kccLinked: true,
    kccCardNumber: 'KCC-KA-2026-8812'
  })

  const handleSave = (e) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('Farmer profile & bank payout details saved successfully!')
    }, 600)
  }

  return (
    <div className="space-y-8">
      
      {/* 1. Header & Verification Status Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>APMC eNAM & KYC Verified Producer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Farmer Profile & Payout Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your land demographics, regional language, and bank accounts for direct escrow disbursements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="rounded-xl text-xs font-bold shadow-md h-10 px-5 bg-primary text-primary-foreground"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>

      {/* 2. Top Farmer Summary Banner */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl border border-primary/20 shrink-0">
            <Sprout className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-foreground">{profileData.name}</h2>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border border-emerald-500/20">
                100% KYC Complete
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
              <span><MapPin className="w-3.5 h-3.5 inline text-primary mr-1" />{profileData.district}, Karnataka</span>
              <span>•</span>
              <span>{profileData.landArea} {profileData.landUnit} Landholding</span>
            </p>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <div className="px-3 py-1.5 rounded-xl bg-muted/60 border border-border text-foreground flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Kisan Credit Card (KCC) Active</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Direct Escrow Bank Linked</span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center bg-muted/60 p-1.5 rounded-2xl border border-border text-xs font-bold">
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'personal' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className="w-4 h-4 text-primary" />
          <span>Personal & Language</span>
        </button>

        <button
          onClick={() => setActiveTab('farm')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'farm' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sprout className="w-4 h-4 text-emerald-500" />
          <span>Farm & Land Demographics</span>
        </button>

        <button
          onClick={() => setActiveTab('bank')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'bank' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Landmark className="w-4 h-4 text-amber-500" />
          <span>Bank & Escrow Payouts</span>
        </button>
      </div>

      {/* 4. Form Content Area */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Tab 1: Personal Information */}
        {activeTab === 'personal' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-extrabold text-foreground">Personal Details & Preferences</h3>
              <p className="text-xs text-muted-foreground">Information used on official APMC lot sheets and SMS alerts.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Full Name (As per Aadhaar)</label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">10-Digit Mobile Number</label>
                <input
                  type="text"
                  required
                  value={profileData.mobile}
                  onChange={(e) => setProfileData({ ...profileData, mobile: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Primary Platform Language</label>
                <select
                  value={profileData.language}
                  onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl bg-background border border-border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="kn">ಕನ್ನಡ (Kannada) - Regional Default</option>
                  <option value="en">English - Primary</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Village / Habitation</label>
                <input
                  type="text"
                  value={profileData.village}
                  onChange={(e) => setProfileData({ ...profileData, village: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">District</label>
                <input
                  type="text"
                  disabled
                  value={profileData.district}
                  className="w-full h-11 px-3 rounded-xl bg-muted/60 border border-border text-xs font-semibold text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Postal Pin Code</label>
                <input
                  type="text"
                  value={profileData.pincode}
                  onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Farm & Land Demographics */}
        {activeTab === 'farm' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-extrabold text-foreground">Farm Holdings & Soil Demographics</h3>
              <p className="text-xs text-muted-foreground">Agricultural specifications used to tailor government schemes and APMC verification.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Land Parcel / RTC Survey Number</label>
                <input
                  type="text"
                  value={profileData.surveyNumber}
                  onChange={(e) => setProfileData({ ...profileData, surveyNumber: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl bg-background border border-border text-xs font-mono font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Total Cultivable Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profileData.landArea}
                  onChange={(e) => setProfileData({ ...profileData, landArea: Number(e.target.value) })}
                  className="w-full h-11 px-3 rounded-xl bg-background border border-border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Soil Classification</label>
                <input
                  type="text"
                  value={profileData.soilType}
                  onChange={(e) => setProfileData({ ...profileData, soilType: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Irrigation Infrastructure</label>
                <input
                  type="text"
                  value={profileData.irrigationSource}
                  onChange={(e) => setProfileData({ ...profileData, irrigationSource: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-foreground">Primary Crops Cultivated This Year</label>
              <div className="flex flex-wrap gap-2">
                {profileData.cropsGrown.map((crop, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5" /> {crop}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Bank Account & Escrow Settlement */}
        {activeTab === 'bank' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-foreground">Direct Bank Payout & Escrow Settlement</h3>
                <p className="text-xs text-muted-foreground">Buyer funds are deposited directly into this account upon APMC weighment confirmation.</p>
              </div>
              <div className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Direct DBT Enabled
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Beneficiary Name (Bank Account)</label>
                <input
                  type="text"
                  value={profileData.accountHolderName}
                  onChange={(e) => setProfileData({ ...profileData, accountHolderName: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Bank Account Number</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={profileData.rawAccountNumber}
                    onChange={(e) => setProfileData({ ...profileData, rawAccountNumber: e.target.value })}
                    className="w-full h-11 pl-9 pr-3 rounded-xl bg-background border border-border text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Bank IFSC Code</label>
                <input
                  type="text"
                  value={profileData.ifscCode}
                  onChange={(e) => setProfileData({ ...profileData, ifscCode: e.target.value.toUpperCase() })}
                  className="w-full h-11 px-3 rounded-xl bg-background border border-border text-xs font-mono font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Bank & Branch Name</label>
                <input
                  type="text"
                  value={`${profileData.bankName}, ${profileData.branchName}`}
                  disabled
                  className="w-full h-11 px-3 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">UPI ID (For Instant Payouts)</label>
                <input
                  type="text"
                  value={profileData.upiId}
                  onChange={(e) => setProfileData({ ...profileData, upiId: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Kisan Credit Card (KCC) ID</label>
                <input
                  type="text"
                  disabled
                  value={profileData.kccCardNumber}
                  className="w-full h-11 px-3 rounded-xl bg-muted/60 border border-border text-xs font-mono text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button 
            type="submit" 
            disabled={saving}
            className="rounded-2xl text-xs font-bold shadow-md h-11 px-8 bg-primary text-primary-foreground"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default FarmerProfile
