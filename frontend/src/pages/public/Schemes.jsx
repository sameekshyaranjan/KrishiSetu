import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import schemeService from '@/services/schemeService'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  BookOpen, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  Landmark, 
  Sparkles, 
  PhoneCall, 
  RefreshCw, 
  Filter,
  Layers,
  Award,
  FileText,
  X,
  UserCheck,
  CreditCard,
  Download
} from 'lucide-react'
import SchemeEligibilityModal from '@/components/common/SchemeEligibilityModal'

const CATEGORIES = [
  'All',
  'Direct Income Support',
  'Millet & Dryland Subsidy',
  'Irrigation & Water Conservation',
  'Crop Insurance & Risk Shield',
  'Renewable Energy & Power'
]

export const Schemes = () => {
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Direct Application Modal
  const [selectedSchemeForApply, setSelectedSchemeForApply] = useState(null)
  const [applicantName, setApplicantName] = useState('Ramesh Gowda')
  const [aadhaarNumber, setAadhaarNumber] = useState('XXXX-XXXX-8821')
  const [landHolding, setLandHolding] = useState('3.5 Acres')
  const [bankAccount, setBankAccount] = useState('SBI - 3891028192')
  const [applying, setApplying] = useState(false)

  const fetchSchemes = async () => {
    setLoading(true)
    try {
      const data = await schemeService.getPublishedSchemes()
      setSchemes(data || [])
    } catch (err) {
      console.error('[Schemes] Error fetching schemes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchemes()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchSchemes()
    setIsRefreshing(false)
    toast.success('Government scheme directory & eligibility rules updated! ⚡')
  }

  const handleApplySubmit = async (e) => {
    e.preventDefault()
    setApplying(true)
    try {
      const application = await schemeService.applyForScheme({
        schemeId: selectedSchemeForApply._id,
        schemeName: selectedSchemeForApply.name,
        applicantName,
        aadhaarNumber,
        landHolding,
        bankAccount
      })

      toast.success(`Application submitted successfully! Ref #${application.acknowledgementNo} 🎉`)
      setSelectedSchemeForApply(null)
    } catch (err) {
      toast.error('Failed to submit application.')
    } finally {
      setApplying(false)
    }
  }

  // Filtered scheme list
  const filteredSchemes = useMemo(() => {
    return schemes.filter((item) => {
      const matchesSearch = 
        (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.authority || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.purpose || '').toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [schemes, searchQuery, selectedCategory])

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20 mb-2">
            <Landmark className="w-3.5 h-3.5" />
            <span>Official Government Welfare & Subsidy Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Agricultural Schemes & Subsidies 🏛️
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Discover verified Central and Karnataka State financial assistance, crop insurance, solar pump grants, and PM-KISAN income support.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={() => setIsEligibilityModalOpen(true)}
            className="rounded-xl text-xs font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-4 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Check My Eligibility
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="rounded-xl text-xs shadow-sm h-10 px-4"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Directory
          </Button>
        </div>
      </div>

      {/* 2. Key Subsidy Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-border space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Universal Income Support</span>
          <p className="text-2xl font-black text-primary">₹6,000 / yr</p>
          <span className="text-[10px] text-emerald-600 font-bold">PM-KISAN DBT Direct Payout</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Millet Cultivation Grant</span>
          <p className="text-2xl font-black text-emerald-600">₹10,000 / ha</p>
          <span className="text-[10px] text-muted-foreground">Karnataka Raitha Siri</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Irrigation Pond Subsidy</span>
          <p className="text-2xl font-black text-amber-600">Up to 90%</p>
          <span className="text-[10px] text-muted-foreground">Krishi Bhagya Scheme</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Solar Pump Grant</span>
          <p className="text-2xl font-black text-foreground">60% Subsidy</p>
          <span className="text-[10px] text-emerald-600 font-bold">PM-KUSUM Component-B</span>
        </div>
      </div>

      {/* 3. Search & Category Filters */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scheme title, ministry authority, or eligibility criteria..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter Category:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted border border-border'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. Schemes Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSchemes.map((scheme) => (
          <div
            key={scheme._id}
            className="p-6 sm:p-7 rounded-3xl bg-card border border-border hover:border-primary/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              
              {/* Header: Title, Authority & Category */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {scheme.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-600 bg-emerald-500/10">
                    {scheme.subsidyPercent || 'Government Sponsored'}
                  </span>
                </div>
                <h3 className="text-lg font-black text-foreground">
                  {scheme.name}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                  <Landmark className="w-3.5 h-3.5 text-primary" /> {scheme.authority}
                </p>
              </div>

              {/* Purpose & Benefits */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                {scheme.purpose}
              </p>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-foreground block">Key Benefit:</span>
                    <span className="text-muted-foreground">{scheme.benefits}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2 border-t border-border/60">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-foreground block">Eligibility:</span>
                    <span className="text-muted-foreground">{scheme.eligibility}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card CTA Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-border/80">
              <Button
                size="sm"
                onClick={() => setSelectedSchemeForApply(scheme)}
                className="flex-1 rounded-xl text-xs font-bold h-10 bg-primary text-primary-foreground shadow-sm flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" /> Apply for Subsidy
              </Button>

              {scheme.officialLink && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs font-semibold h-10 px-4"
                >
                  <a href={scheme.officialLink} target="_blank" rel="noopener noreferrer">
                    Portal <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 5. Direct Subsidy Application Modal */}
      {selectedSchemeForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedSchemeForApply(null)}
              className="absolute right-5 top-5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20 mb-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Direct Benefit Application (DBT)</span>
              </div>
              <h2 className="text-xl font-extrabold text-foreground">
                Apply for {selectedSchemeForApply.name}
              </h2>
              <p className="text-xs text-muted-foreground">
                Submit your verified land and bank details for automated government subsidy processing.
              </p>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Beneficiary / Farmer Name *</label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Aadhaar Linked UID *</label>
                  <input
                    type="text"
                    required
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Cultivable Land Size *</label>
                  <input
                    type="text"
                    required
                    value={landHolding}
                    onChange={(e) => setLandHolding(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Aadhaar-Linked Bank Account (for DBT) *</label>
                <input
                  type="text"
                  required
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono font-bold text-primary"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1 text-[11px] text-muted-foreground">
                <span className="font-bold text-foreground flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Karnataka FRUITS (Farmer Registration) Integrated
                </span>
                <p>Your land records and DBT bank mandate are verified through the Karnataka State AgriStack database.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedSchemeForApply(null)}
                  className="rounded-xl text-xs h-10 px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={applying}
                  className="rounded-xl text-xs font-bold h-10 px-6 bg-primary text-primary-foreground shadow-md"
                >
                  {applying ? 'Submitting Application...' : 'Submit Subsidy Application 🚀'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Eligibility Modal */}
      <SchemeEligibilityModal
        isOpen={isEligibilityModalOpen}
        onClose={() => setIsEligibilityModalOpen(false)}
      />
    </div>
  )
}

export default Schemes
