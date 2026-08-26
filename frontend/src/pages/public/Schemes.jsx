import { useState, useEffect, useMemo } from 'react'
import schemeService from '@/services/schemeService'
import { Button } from '@/components/ui/button'
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
  Award
} from 'lucide-react'
import SchemeEligibilityModal from '@/components/common/SchemeEligibilityModal'

const CATEGORIES = [
  'All',
  'Income Support',
  'Crop Insurance',
  'Credit & Loans',
  'State Subsidy',
  'Irrigation',
  'Soil & Fertilizer'
]

export const Schemes = () => {
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedState, setSelectedState] = useState('All')
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false)

  const fetchSchemes = async () => {
    setLoading(true)
    try {
      const data = await schemeService.getSchemes()
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

  // Filtered scheme list
  const filteredSchemes = useMemo(() => {
    return schemes.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ministry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
      const matchesState = selectedState === 'All' || item.state === selectedState

      return matchesSearch && matchesCategory && matchesState
    })
  }, [schemes, searchQuery, selectedCategory, selectedState])

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-2">
            <Landmark className="w-3.5 h-3.5" />
            <span>Official Government Welfare Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Agricultural Schemes & Subsidies
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Discover verified Central and Karnataka State financial assistance, crop insurance, and irrigation subsidy schemes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={() => setIsEligibilityModalOpen(true)}
            className="rounded-xl text-xs font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white h-9"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Check My Eligibility
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSchemes} 
            disabled={loading}
            className="rounded-xl text-xs shadow-sm h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Directory
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Active Schemes</span>
          <p className="text-2xl font-extrabold text-foreground">{schemes.length} Programs</p>
          <span className="text-[10px] text-emerald-500 font-medium">Central & Karnataka</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Direct Income Support</span>
          <p className="text-2xl font-extrabold text-primary">₹6,000 / yr</p>
          <span className="text-[10px] text-muted-foreground">PM-KISAN DBT Transfer</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">KCC Credit Subvention</span>
          <p className="text-2xl font-extrabold text-amber-500">4% p.a.</p>
          <span className="text-[10px] text-muted-foreground">Subsidized farm credit</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Millet Cultivation Grant</span>
          <p className="text-2xl font-extrabold text-emerald-600">₹10,000 / ha</p>
          <span className="text-[10px] text-muted-foreground">Karnataka Raitha Siri</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-4">
        
        {/* Search Bar & State Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scheme name, ministry, or benefits..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="All">All Jurisdictions (Central & State)</option>
              <option value="Central">Central Government Schemes</option>
              <option value="Karnataka">Karnataka State Only</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Category:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted border border-border'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
          <span>Showing <strong>{filteredSchemes.length}</strong> government schemes</span>
          {(searchQuery || selectedCategory !== 'All' || selectedState !== 'All') && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedState('All'); }}
              className="text-primary hover:underline font-medium cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Scheme Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSchemes.map((scheme) => {
          return (
            <div 
              key={scheme._id}
              className="rounded-3xl bg-card border border-border hover:border-primary/50 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                
                {/* Header Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                        {scheme.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium border border-border">
                        {scheme.state === 'Central' ? '🏛️ Central Scheme' : '🌾 Karnataka State'}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-xl text-foreground tracking-tight pt-1">
                      {scheme.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {scheme.ministry}
                    </p>
                  </div>
                </div>

                {/* Direct Benefit Highlight Banner */}
                {scheme.benefitSummary && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                    <Award className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{scheme.benefitSummary}</span>
                  </div>
                )}

                {/* Key Benefits */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Key Entitlements & Benefits:
                  </span>
                  <ul className="space-y-1.5 text-xs text-foreground/90">
                    {Array.isArray(scheme.benefits) ? (
                      scheme.benefits.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{scheme.benefits}</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Eligibility Criteria */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Eligibility Criteria:
                  </span>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {Array.isArray(scheme.eligibility) ? (
                      scheme.eligibility.map((e, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 shrink-0 mt-1.5"></span>
                          <span>{e}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 shrink-0 mt-1.5"></span>
                        <span>{scheme.eligibility}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEligibilityModalOpen(true)}
                  className="rounded-xl text-xs text-primary font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Check Eligibility
                </Button>

                <Button asChild size="sm" className="rounded-xl text-xs font-semibold shadow-sm">
                  <a 
                    href={scheme.officialLink || 'https://myscheme.gov.in'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5"
                  >
                    Apply on Official Portal <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredSchemes.length === 0 && !loading && (
        <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
          <p className="text-base font-bold text-foreground">No government schemes matched your criteria</p>
          <p className="text-xs text-muted-foreground">Try clearing your search keyword or selecting a different category.</p>
          <Button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedState('All'); }} size="sm" variant="outline">
            Reset Filters
          </Button>
        </div>
      )}

      {/* Official Government Helpline Contact Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-foreground text-base">
              National Kisan Call Centre (Toll-Free Helpline)
            </h4>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              Get direct assistance on application guidelines, DBT status, and eligibility documents from agricultural experts in Kannada, Hindi, and English.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="tel:18001801551"
            className="px-5 py-2.5 rounded-2xl bg-amber-500 text-white font-extrabold text-sm hover:bg-amber-600 transition-colors shadow-md flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4" /> 1800-180-1551
          </a>
        </div>
      </div>

      {/* Interactive Scheme Eligibility Checker Modal */}
      <SchemeEligibilityModal
        isOpen={isEligibilityModalOpen}
        onClose={() => setIsEligibilityModalOpen(false)}
        schemes={schemes}
      />
    </div>
  )
}

export default Schemes
