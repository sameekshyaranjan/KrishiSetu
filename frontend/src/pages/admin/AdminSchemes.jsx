import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  BookOpen, 
  Landmark, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Search, 
  Download, 
  RefreshCw, 
  FileText, 
  Calendar, 
  ShieldCheck, 
  ArrowUpRight, 
  X, 
  Sparkles, 
  Edit3, 
  ToggleLeft, 
  ToggleRight,
  TrendingUp,
  Layers
} from 'lucide-react'

const INITIAL_SCHEMES = [
  {
    _id: 'SCH-KA-2026-01',
    title: 'Karnataka Raitha Siri Scheme',
    category: 'state',
    ministry: 'Dept of Agriculture, Govt of Karnataka',
    benefit: '₹10,000 / Hectare Direct Incentive',
    budgetTotal: 120000000, // ₹12 Cr
    budgetUtilized: 98000000, // ₹9.8 Cr (81.6%)
    beneficiariesCount: 9800,
    targetProduce: 'Millets (Ragi, Jowar, Bajra, Foxtail)',
    status: 'active',
    deadline: '31 Oct 2026',
    description: 'Direct financial assistance deposited into Aadhaar-linked bank accounts for farmers cultivating minor millets across dryland zones.'
  },
  {
    _id: 'SCH-GOI-2026-02',
    title: 'PM-KISAN Samman Nidhi',
    category: 'central',
    ministry: 'Ministry of Agriculture & Farmers Welfare, GoI',
    benefit: '₹6,000 / Year in 3 Tranches',
    budgetTotal: 180000000, // ₹18 Cr
    budgetUtilized: 144000000, // ₹14.4 Cr (80%)
    beneficiariesCount: 24000,
    targetProduce: 'All Landholding Farmers',
    status: 'active',
    deadline: 'Ongoing FY 2026-27',
    description: 'Universal income support for small and marginal landholding farmer families to procure agricultural inputs.'
  },
  {
    _id: 'SCH-KA-2026-03',
    title: 'Krishi Bhagya Farm Pond & Polyhouse Subsidy',
    category: 'state',
    ministry: 'Watershed Development Dept, Karnataka',
    benefit: 'Up to ₹1,50,000 (80% Subsidy)',
    budgetTotal: 60000000, // ₹6 Cr
    budgetUtilized: 42000000, // ₹4.2 Cr (70%)
    beneficiariesCount: 2800,
    targetProduce: 'Horticulture & Rainfed Crops',
    status: 'active',
    deadline: '15 Dec 2026',
    description: 'Construct on-farm rainwater harvesting ponds with polythene lining and diesel water pump sets in rain-shadow districts.'
  },
  {
    _id: 'SCH-GOI-2026-04',
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    category: 'central',
    ministry: 'Ministry of Agriculture, GoI',
    benefit: 'Comprehensive Crop Loss Insurance (1.5% Premium)',
    budgetTotal: 50000000, // ₹5 Cr
    budgetUtilized: 31000000, // ₹3.1 Cr (62%)
    beneficiariesCount: 8200,
    targetProduce: 'Kharif Tomato, Onion, Maize & Cotton',
    status: 'active',
    deadline: '30 Sep 2026',
    description: 'Actuarial yield-loss risk coverage against drought, unseasonal cloudbursts, and pest attacks.'
  },
  {
    _id: 'SCH-KA-2026-05',
    title: 'Ganga Kalyana Borewell Scheme',
    category: 'state',
    ministry: 'Karnataka Minorities Development Corp',
    benefit: '100% Free Borewell Drilling + Submersible Pump',
    budgetTotal: 30000000, // ₹3 Cr
    budgetUtilized: 29000000, // ₹2.9 Cr (96.6%)
    beneficiariesCount: 1450,
    targetProduce: 'Small & Marginal Landholders',
    status: 'active',
    deadline: '30 Nov 2026',
    description: 'Free exploratory borewell drilling, casing, and solar pump integration for small farmers with under 5 acres.'
  },
  {
    _id: 'SCH-GOI-2026-06',
    title: 'Kisan Credit Card (KCC) Low-Interest Loans',
    category: 'central',
    ministry: 'NABARD & Reserve Bank of India',
    benefit: 'Up to ₹3,00,000 at 4% Concessional Interest',
    budgetTotal: 15000000, // ₹1.5 Cr
    budgetUtilized: 15000000, // ₹1.5 Cr (100%)
    beneficiariesCount: 3000,
    targetProduce: 'Seasonal Cultivation Inputs',
    status: 'exhausted',
    deadline: 'FY 2026 Quota Reached',
    description: 'Short-term revolving credit for seeds, fertilizers, and pesticide working capital requirements.'
  }
]

const CATEGORY_TABS = [
  { id: 'all', label: 'All Schemes' },
  { id: 'state', label: 'Karnataka State (ಕೃಷಿ ಯೋಜನೆ)' },
  { id: 'central', label: 'Central Govt (GoI)' },
  { id: 'active', label: 'Active & Enrolling 🟢' },
  { id: 'exhausted', label: 'Budget Exhausted 🔴' }
]

export const AdminSchemes = () => {
  const { user } = useAuth()
  const [schemes, setSchemes] = useState(INITIAL_SCHEMES)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  // New Scheme Form State
  const [newScheme, setNewScheme] = useState({
    title: '',
    category: 'state',
    ministry: 'Dept of Agriculture, Govt of Karnataka',
    benefit: '',
    budgetTotalCr: '',
    targetProduce: '',
    deadline: '',
    description: ''
  })

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('State welfare schemes & DBT treasury allocations synchronized!')
    }, 600)
  }

  const handleToggleStatus = (id) => {
    setSchemes((prev) =>
      prev.map((s) => {
        if (s._id === id) {
          const nextStatus = s.status === 'active' ? 'exhausted' : 'active'
          toast.success(`Scheme status updated to ${nextStatus === 'active' ? 'Active 🟢' : 'Exhausted 🔴'}`)
          return { ...s, status: nextStatus }
        }
        return s
      })
    )
  }

  const handleCreateScheme = (e) => {
    e.preventDefault()
    if (!newScheme.title || !newScheme.benefit || !newScheme.budgetTotalCr) {
      toast.error('Please fill all mandatory scheme details')
      return
    }

    const budgetTotal = parseFloat(newScheme.budgetTotalCr) * 10000000
    const createdItem = {
      _id: `SCH-${newScheme.category.toUpperCase()}-2026-${Math.floor(10 + Math.random() * 90)}`,
      title: newScheme.title,
      category: newScheme.category,
      ministry: newScheme.ministry,
      benefit: newScheme.benefit,
      budgetTotal: budgetTotal,
      budgetUtilized: 0,
      beneficiariesCount: 0,
      targetProduce: newScheme.targetProduce || 'All Crops',
      status: 'active',
      deadline: newScheme.deadline || '31 March 2027',
      description: newScheme.description || 'Government agricultural welfare initiative.'
    }

    setSchemes((prev) => [createdItem, ...prev])
    setShowAddModal(false)
    setNewScheme({
      title: '',
      category: 'state',
      ministry: 'Dept of Agriculture, Govt of Karnataka',
      benefit: '',
      budgetTotalCr: '',
      targetProduce: '',
      deadline: '',
      description: ''
    })
    toast.success('New Agricultural Welfare Scheme published successfully! 🎉')
  }

  // Aggregate Metrics
  const totalBudget = schemes.reduce((acc, s) => acc + s.budgetTotal, 0)
  const totalUtilized = schemes.reduce((acc, s) => acc + s.budgetUtilized, 0)
  const totalBeneficiaries = schemes.reduce((acc, s) => acc + s.beneficiariesCount, 0)

  // Filtered List
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      const matchesCategory =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'active'
          ? s.status === 'active'
          : selectedCategory === 'exhausted'
          ? s.status === 'exhausted'
          : s.category === selectedCategory

      const q = searchQuery.toLowerCase()
      const matchesSearch =
        s.title.toLowerCase().includes(q) ||
        s.ministry.toLowerCase().includes(q) ||
        s.benefit.toLowerCase().includes(q) ||
        s.targetProduce.toLowerCase().includes(q)

      return matchesCategory && matchesSearch
    })
  }, [schemes, selectedCategory, searchQuery])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-semibold border border-purple-500/20 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>State & Central Agricultural Welfare Program Node</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Government Welfare Schemes & Subsidy Outlay 🏛️
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Allocate fiscal budgets, monitor Direct Benefit Transfer (DBT) disbursements, and publish new state agricultural subsidies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-xl text-xs h-10 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Outlay
          </Button>

          <Button 
            onClick={() => setShowAddModal(true)}
            className="rounded-xl text-xs h-10 px-4 font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Launch New Scheme
          </Button>
        </div>
      </div>

      {/* 2. 4 Fiscal Outlay KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Total Active Programs</span>
          <p className="text-2xl font-black text-foreground">{schemes.length} Schemes</p>
          <span className="text-[11px] text-muted-foreground">State & Central Initiatives</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Total Budget Allocated</span>
          <p className="text-2xl font-black text-purple-600">₹{(totalBudget / 10000000).toFixed(2)} Cr</p>
          <span className="text-[11px] text-muted-foreground">FY 2026–27 State Outlay</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Direct DBT Disbursed</span>
          <p className="text-2xl font-black text-emerald-600">₹{(totalUtilized / 10000000).toFixed(2)} Cr</p>
          <span className="text-[11px] text-emerald-600 font-bold">
            {((totalUtilized / totalBudget) * 100).toFixed(1)}% Budget Utilized
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Enrolled Beneficiaries</span>
          <p className="text-2xl font-black text-primary">{totalBeneficiaries.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-muted-foreground">Verified Farmers Benefited</span>
        </div>
      </div>

      {/* 3. Category Filter Tabs & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {CATEGORY_TABS.map((tab) => {
              const count =
                tab.id === 'all'
                  ? schemes.length
                  : tab.id === 'active'
                  ? schemes.filter((s) => s.status === 'active').length
                  : tab.id === 'exhausted'
                  ? schemes.filter((s) => s.status === 'exhausted').length
                  : schemes.filter((s) => s.category === tab.id).length

              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    selectedCategory === tab.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    selectedCategory === tab.id ? 'bg-black/20 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schemes or crops..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </div>
        </div>
      </div>

      {/* 4. Schemes Portfolio Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSchemes.map((scheme) => {
          const percentUsed = Math.min(100, Math.round((scheme.budgetUtilized / scheme.budgetTotal) * 100))

          return (
            <div
              key={scheme._id}
              className="p-6 sm:p-7 rounded-3xl bg-card border border-border hover:border-purple-500/40 transition-all shadow-sm space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                
                {/* Card Top Pill & Category */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                    scheme.category === 'state'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  }`}>
                    {scheme.category === 'state' ? 'Karnataka State Scheme' : 'Central GoI Scheme'}
                  </span>

                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                    scheme.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-rose-500/10 text-rose-600'
                  }`}>
                    {scheme.status === 'active' ? 'Active 🟢' : 'Exhausted 🔴'}
                  </span>
                </div>

                {/* Title & Ministry */}
                <div>
                  <h3 className="text-base font-extrabold text-foreground">{scheme.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{scheme.ministry}</p>
                </div>

                {/* Benefit Banner */}
                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-purple-700 block">Financial Assistance</span>
                  <p className="text-xs font-extrabold text-foreground">{scheme.benefit}</p>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {scheme.description}
                </p>

                {/* Budget Utilization Progress Bar */}
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">DBT Budget Utilization</span>
                    <span className="font-mono text-foreground font-bold">
                      ₹{(scheme.budgetUtilized / 10000000).toFixed(2)} Cr / ₹{(scheme.budgetTotal / 10000000).toFixed(2)} Cr ({percentUsed}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentUsed > 90 ? 'bg-rose-500' : 'bg-purple-600'
                      }`}
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>
                </div>

                {/* Meta details: Target Crops & Beneficiaries */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
                    <span className="text-[10px] text-muted-foreground block font-bold">Enrolled Farmers:</span>
                    <p className="font-mono font-bold text-foreground">{scheme.beneficiariesCount.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
                    <span className="text-[10px] text-muted-foreground block font-bold">Target Scope:</span>
                    <p className="font-bold text-foreground truncate">{scheme.targetProduce}</p>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-[11px] font-mono text-muted-foreground">
                  Deadline: {scheme.deadline}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(scheme._id)}
                    className="p-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1"
                  >
                    {scheme.status === 'active' ? (
                      <ToggleRight className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-rose-500" />
                    )}
                    <span>{scheme.status === 'active' ? 'Enrolling' : 'Pause'}</span>
                  </button>

                  <Button 
                    size="sm"
                    onClick={() => toast.success(`Beneficiary DBT roster for ${scheme.title} exported!`)}
                    className="rounded-xl text-xs h-8 px-3 font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                  >
                    Export Roster
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 5. Launch New Scheme Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">
                    Launch New Agricultural Subsidy Program
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    Karnataka State / Central Government Welfare Outlay
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateScheme} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Scheme Official Title *</label>
                <input
                  type="text"
                  required
                  value={newScheme.title}
                  onChange={(e) => setNewScheme({ ...newScheme, title: e.target.value })}
                  placeholder="e.g. Karnataka Raitha Siri Solar Pump Subsidy"
                  className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Government Jurisdiction</label>
                  <select
                    value={newScheme.category}
                    onChange={(e) => setNewScheme({ ...newScheme, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  >
                    <option value="state">Karnataka State Scheme</option>
                    <option value="central">Central Govt Scheme (GoI)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Total Budget (₹ Crore) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newScheme.budgetTotalCr}
                    onChange={(e) => setNewScheme({ ...newScheme, budgetTotalCr: e.target.value })}
                    placeholder="e.g. 10.5"
                    className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Financial Assistance Benefit *</label>
                <input
                  type="text"
                  required
                  value={newScheme.benefit}
                  onChange={(e) => setNewScheme({ ...newScheme, benefit: e.target.value })}
                  placeholder="e.g. ₹10,000 / Hectare direct cash assistance"
                  className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Target Crops / Focus</label>
                  <input
                    type="text"
                    value={newScheme.targetProduce}
                    onChange={(e) => setNewScheme({ ...newScheme, targetProduce: e.target.value })}
                    placeholder="e.g. Ragi, Millets, Organic Pulses"
                    className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Enrolment Deadline</label>
                  <input
                    type="text"
                    value={newScheme.deadline}
                    onChange={(e) => setNewScheme({ ...newScheme, deadline: e.target.value })}
                    placeholder="e.g. 31 Dec 2026"
                    className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Scheme Objective & Description</label>
                <textarea
                  rows={3}
                  value={newScheme.description}
                  onChange={(e) => setNewScheme({ ...newScheme, description: e.target.value })}
                  placeholder="Brief summary of eligibility requirements and subsidy goals..."
                  className="w-full p-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl text-xs h-10"
                >
                  Cancel
                </Button>

                <Button 
                  type="submit"
                  className="rounded-xl text-xs font-bold h-10 px-5 bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                >
                  Publish & Allocate Budget 🚀
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSchemes
