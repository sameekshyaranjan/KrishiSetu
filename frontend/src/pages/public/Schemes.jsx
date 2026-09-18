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
    <div className="py-10 px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            Official Government Welfare & Subsidy Directory
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl font-normal leading-tight text-foreground">
            Agricultural Schemes & Subsidies
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            Discover verified Central and Karnataka State financial assistance, crop insurance, solar pump grants, and PM-KISAN direct income support.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="farmer"
            size="sm"
            onClick={() => setIsEligibilityModalOpen(true)}
            className="rounded-sm text-xs font-semibold shadow-xs h-9 px-4 flex items-center gap-1.5"
          >
            <Sparkles className="size-3.5" /> Check My Eligibility
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="rounded-sm text-xs h-9 px-4 shadow-xs"
          >
            <RefreshCw className={`size-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Directory
          </Button>
        </div>
      </div>

      {/* 2. Key Subsidy Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-md bg-card border border-border space-y-1 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Universal Income Support</span>
          <p className="text-2xl font-display font-normal text-primary">₹6,000 / yr</p>
          <span className="text-[10px] text-primary font-bold">PM-KISAN DBT Direct Payout</span>
        </div>

        <div className="p-5 rounded-md bg-card border border-border space-y-1 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Millet Cultivation Grant</span>
          <p className="text-2xl font-display font-normal text-primary">₹10,000 / ha</p>
          <span className="text-[10px] text-muted-foreground">Karnataka Raitha Siri</span>
        </div>

        <div className="p-5 rounded-md bg-card border border-border space-y-1 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Irrigation Pond Subsidy</span>
          <p className="text-2xl font-display font-normal text-trader">Up to 90%</p>
          <span className="text-[10px] text-muted-foreground">Krishi Bhagya Scheme</span>
        </div>

        <div className="p-5 rounded-md bg-card border border-border space-y-1 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Solar Pump Grant</span>
          <p className="text-2xl font-display font-normal text-foreground">60% Subsidy</p>
          <span className="text-[10px] text-primary font-bold">PM-KUSUM Component-B</span>
        </div>
      </div>

      {/* 3. Search & Category Filters */}
      <div className="p-5 rounded-md bg-card border border-border shadow-xs space-y-4">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scheme title, ministry authority, or eligibility criteria..."
            className="w-full h-10 pl-9 pr-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1 mr-1 uppercase tracking-wider">
            <Filter className="size-3" /> Category:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-xs'
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
            className="p-6 rounded-md bg-card border border-border hover:border-primary/50 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              
              {/* Header: Title, Authority & Category */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {scheme.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold text-primary bg-primary/10">
                    {scheme.subsidyPercent || 'Government Sponsored'}
                  </span>
                </div>
                <h3 className="text-xl font-display font-normal text-foreground">
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

              <div className="p-4 rounded-sm bg-muted/40 border border-border/80 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">Key Benefit:</span>
                    <span className="text-muted-foreground">{scheme.benefits}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2 border-t border-border/60">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">Eligibility:</span>
                    <span className="text-muted-foreground">{scheme.eligibility}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card CTA Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-border/80">
              <Button
                size="sm"
                variant="farmer"
                onClick={() => setSelectedSchemeForApply(scheme)}
                className="flex-1 rounded-sm text-xs font-semibold h-9 shadow-xs flex items-center justify-center gap-1.5"
              >
                <FileText className="size-3.5" /> Apply for Subsidy
              </Button>

              {scheme.officialLink && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-sm text-xs font-semibold h-9 px-3"
                >
                  <a href={scheme.officialLink} target="_blank" rel="noopener noreferrer">
                    Official Portal <ExternalLink className="size-3 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 5. Direct Subsidy Application Modal */}
      {selectedSchemeForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-md p-6 sm:p-8 shadow-xl space-y-6 max-h-[92vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedSchemeForApply(null)}
              className="absolute right-4 top-4 p-1.5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                Direct Benefit Application (DBT)
              </p>
              <h2 className="text-2xl font-display font-normal text-foreground">
                Apply for {selectedSchemeForApply.name}
              </h2>
              <p className="text-xs text-muted-foreground">
                Submit your verified land and bank details for automated government subsidy processing.
              </p>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Beneficiary / Farmer Name *</label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Aadhaar Linked UID *</label>
                  <input
                    type="text"
                    required
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Cultivable Land Size *</label>
                  <input
                    type="text"
                    required
                    value={landHolding}
                    onChange={(e) => setLandHolding(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Aadhaar-Linked Bank Account (for DBT) *</label>
                <input
                  type="text"
                  required
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono font-bold text-primary"
                />
              </div>

              <div className="p-3.5 rounded-sm bg-muted/40 border border-border space-y-1 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Karnataka FRUITS (Farmer Registration) Integrated
                </span>
                <p>Your land records and DBT bank mandate are verified through the Karnataka State AgriStack database.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSchemeForApply(null)}
                  className="rounded-sm text-xs h-9 px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={applying}
                  variant="farmer"
                  size="sm"
                  className="rounded-sm text-xs font-bold h-9 px-5 shadow-xs"
                >
                  {applying ? 'Submitting Application...' : 'Submit Application'}
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
