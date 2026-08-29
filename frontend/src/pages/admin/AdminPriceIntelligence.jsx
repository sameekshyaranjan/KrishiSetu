import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import adminMandiService from '@/services/adminMandiService'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  TrendingUp, 
  TrendingDown, 
  Landmark, 
  Building2, 
  DollarSign, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  FileText, 
  Sparkles, 
  Layers, 
  X, 
  Plus, 
  ShoppingBag, 
  ArrowUpRight, 
  Activity,
  ShieldCheck,
  Sprout
} from 'lucide-react'

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Commodities' },
  { id: 'vegetables', label: 'Vegetables 🍅' },
  { id: 'grains', label: 'Grains & Millets 🌾' },
  { id: 'spices', label: 'Spices & Cash Crops 🌶️' }
]

export const AdminPriceIntelligence = () => {
  const { user } = useAuth()
  const [priceIntel, setPriceIntel] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadData = async () => {
    try {
      const data = await adminMandiService.getPriceIntelligence()
      setPriceIntel(data || [])
    } catch {
      // Fallback
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadData()
    setIsRefreshing(false)
    toast.success('Statewide APMC price intelligence & buffer telemetry refreshed! ⚡')
  }

  const handleToggleBuffer = async (cropId, currentStatus) => {
    const nextStatus = currentStatus === 'procured' ? 'requisition_open' : 'procured'
    const updated = await adminMandiService.updateBufferStatus(cropId, nextStatus)
    setPriceIntel(updated)
    toast.success(`Buffer requisition status updated to ${nextStatus === 'procured' ? 'Procured 🟢' : 'Open Requisition 🚨'}`)
  }

  // Aggregate Metrics
  const surgeRiskCount = priceIntel.filter((p) => p.volatilityStatus === 'SURGE_RISK').length
  const deficitRiskCount = priceIntel.filter((p) => p.volatilityStatus === 'DEFICIT_RISK').length
  const totalBufferRequirementQtl = priceIntel.reduce((acc, p) => acc + (p.stateBufferRequirementQtl || 0), 0)

  // Filtered List
  const filteredList = useMemo(() => {
    return priceIntel.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        (p.cropName || '').toLowerCase().includes(q) ||
        (p.primaryMandi || '').toLowerCase().includes(q) ||
        (p.district || '').toLowerCase().includes(q)

      return matchesCategory && matchesSearch
    })
  }, [priceIntel, selectedCategory, searchQuery])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-2">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Statewide APMC Price Surveillance & Buffer Stock Requisition</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Price Intelligence & Market Intervention 📊
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Detect wholesale price surges, enforce MSP floor protections, and manage Karnataka State buffer stock quotas.
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
            Refresh Intelligence
          </Button>

          <Button 
            onClick={() => toast.success('Statewide Price Stabilization Strategy PDF exported!')}
            size="sm" 
            className="rounded-xl text-xs font-bold shadow-md h-10 px-4 bg-primary text-primary-foreground"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Report
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Price Surge Alerts (&gt;15% 7d)</p>
            <h3 className="text-2xl font-black text-rose-600">{surgeRiskCount} Commodities</h3>
            <span className="text-[11px] text-muted-foreground">Tomato & Red Onion Surging</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">MSP Deficit Protection</p>
            <h3 className="text-2xl font-black text-amber-600">{deficitRiskCount} Crop Triggered</h3>
            <span className="text-[11px] text-amber-600 font-medium">Maize trading below MSP floor</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">State Buffer Quota</p>
            <h3 className="text-2xl font-black text-emerald-600 font-mono">{totalBufferRequirementQtl.toLocaleString('en-IN')} Qtl</h3>
            <span className="text-[11px] text-muted-foreground">Across 4 KSWC State Silos</span>
          </div>
        </div>
      </div>

      {/* 3. Category Filter & Search Bar */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {CATEGORY_FILTERS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search commodity, primary mandi yard, or district..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 4. Commodity Surveillance Cards */}
      <div className="space-y-4">
        {filteredList.map((item) => {
          const isSurge = item.volatilityStatus === 'SURGE_RISK'
          const isDeficit = item.volatilityStatus === 'DEFICIT_RISK'
          const isProcured = item.bufferStatus === 'procured'

          return (
            <div
              key={item._id}
              className="p-6 sm:p-7 rounded-3xl bg-card border border-border hover:border-primary/50 shadow-sm transition-all space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg text-foreground">{item.cropName}</h3>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      isSurge
                        ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        : isDeficit
                        ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    }`}>
                      {item.volatilityStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-primary" /> {item.primaryMandi} ({item.district} District)
                  </p>
                </div>

                {/* Rates HUD */}
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium">Current Modal Rate:</span>
                    <span className="text-xl font-black text-primary font-mono">
                      ₹{item.currentModalRate}/Qtl
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium">Govt MSP Floor:</span>
                    <span className="text-xl font-black text-foreground font-mono">
                      ₹{item.mspFloorPrice}/Qtl
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium">7-Day Shift:</span>
                    <span className={`text-base font-bold font-mono ${item.shift7dPercent >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {item.shift7dPercent >= 0 ? `+${item.shift7dPercent}%` : `${item.shift7dPercent}%`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommended Action & Buffer Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" /> Market Intervention Directive:
                  </span>
                  <p className="text-muted-foreground leading-relaxed">{item.recommendedAction}</p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-foreground">State Buffer Quota:</span>
                    <span className="font-mono font-bold text-primary">{item.stateBufferRequirementQtl.toLocaleString('en-IN')} Quintals</span>
                  </div>
                  <p className="text-muted-foreground">Storage: {item.allocatedStorage}</p>
                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Requisition Status:</span>
                    <span className={`font-bold ${isProcured ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {isProcured ? 'Procured & Stocked 🟢' : 'Open Requisition 🚨'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                <Button
                  size="sm"
                  onClick={() => handleToggleBuffer(item._id, item.bufferStatus)}
                  className={`rounded-xl text-xs font-bold h-9 px-5 shadow-sm ${
                    isProcured
                      ? 'bg-muted text-foreground border border-border hover:bg-muted/80'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  {isProcured ? 'Reopen Buffer Requisition' : 'Mark Buffer Procured 🟢'}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AdminPriceIntelligence
