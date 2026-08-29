import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
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

const DEMO_PRICE_INTELLIGENCE = [
  {
    _id: 'PRC-TOM-KA-01',
    cropName: 'Hybrid Tomato',
    category: 'vegetables',
    primaryMandi: 'Hassan & Kolar APMC',
    district: 'Hassan',
    currentModalRate: 2200,
    mspFloorPrice: 1800,
    shift7dPercent: 14.2,
    shift30dPercent: 32.5,
    volatilityStatus: 'SURGE_RISK', // 'SURGE_RISK' | 'DEFICIT_RISK' | 'STABLE'
    stateBufferRequirementQtl: 5000,
    allocatedStorage: 'Hassan Central Cold Storage #2',
    bufferStatus: 'requisition_open',
    recommendedAction: 'Trigger State Market Intervention to procure 5,000 Qtl for urban retail price stabilization.'
  },
  {
    _id: 'PRC-ONI-KA-02',
    cropName: 'Bellary Red Onion',
    category: 'vegetables',
    primaryMandi: 'Mandya & Hubballi APMC',
    district: 'Mandya',
    currentModalRate: 2650,
    mspFloorPrice: 2100,
    shift7dPercent: 18.5,
    shift30dPercent: 41.0,
    volatilityStatus: 'SURGE_RISK',
    stateBufferRequirementQtl: 8000,
    allocatedStorage: 'Mandya Ventilated Storage Shed #4',
    bufferStatus: 'requisition_open',
    recommendedAction: 'Acquire 8,000 Qtl buffer stock to counteract anticipated monsoon transport disruption.'
  },
  {
    _id: 'PRC-MAI-KA-03',
    cropName: 'Yellow Dent Maize',
    category: 'grains',
    primaryMandi: 'Bengaluru Rural (Doddaballapura)',
    district: 'Bengaluru Rural',
    currentModalRate: 2050,
    mspFloorPrice: 2090, // Below MSP -> DEFICIT_RISK
    shift7dPercent: -3.8,
    shift30dPercent: -6.2,
    volatilityStatus: 'DEFICIT_RISK',
    stateBufferRequirementQtl: 12000,
    allocatedStorage: 'Karnataka State Warehousing Corp (KSWC Silo #1)',
    bufferStatus: 'requisition_open',
    recommendedAction: 'Modal price is ₹40 below MSP. Immediate MSP floor procurement mandated to protect farmer incomes.'
  },
  {
    _id: 'PRC-RAG-KA-04',
    cropName: 'Organic Finger Millet (Ragi)',
    category: 'grains',
    primaryMandi: 'Kolar & Tumakuru APMC',
    district: 'Kolar',
    currentModalRate: 3450,
    mspFloorPrice: 3578,
    shift7dPercent: 2.1,
    shift30dPercent: 4.8,
    volatilityStatus: 'STABLE',
    stateBufferRequirementQtl: 15000,
    allocatedStorage: 'Civil Supplies PDS Distribution Hub',
    bufferStatus: 'procured',
    recommendedAction: 'Regular PDS procurement quota 92% fulfilled across Southern Karnataka mandis.'
  },
  {
    _id: 'PRC-CHI-KA-05',
    cropName: 'Byadagi Stemless Chilli',
    category: 'spices',
    primaryMandi: 'Hubballi-Dharwad APMC',
    district: 'Hubballi',
    currentModalRate: 14200,
    mspFloorPrice: 11000,
    shift7dPercent: 6.4,
    shift30dPercent: 12.0,
    volatilityStatus: 'STABLE',
    stateBufferRequirementQtl: 2000,
    allocatedStorage: 'Hubballi Spices Board Dehumidified Vault',
    bufferStatus: 'procured',
    recommendedAction: 'Export demand strong; domestic market prices remain stable with high trader liquidity.'
  },
  {
    _id: 'PRC-POT-KA-06',
    cropName: 'Kufri Jyoti Potato',
    category: 'vegetables',
    primaryMandi: 'Belagavi APMC Yard',
    district: 'Belagavi',
    currentModalRate: 1850,
    mspFloorPrice: 1650,
    shift7dPercent: -5.2,
    shift30dPercent: -8.0,
    volatilityStatus: 'STABLE',
    stateBufferRequirementQtl: 4000,
    allocatedStorage: 'Belagavi Cold Chain Complex',
    bufferStatus: 'requisition_open',
    recommendedAction: 'Harvest arrival peak in Belagavi; monitor for distress sales if modal drops under ₹1,700/Qtl.'
  }
]

const CATEGORY_TABS = [
  { id: 'all', label: 'All Commodities' },
  { id: 'vegetables', label: 'Perishables & Veg 🍅' },
  { id: 'grains', label: 'Grains & Millets 🌾' },
  { id: 'spices', label: 'Spices & Cash 🌶️' },
  { id: 'requisitions', label: 'Buffer Requisitions 🏛️' }
]

const KARNATAKA_DISTRICTS = [
  'All Districts',
  'Hassan',
  'Mandya',
  'Bengaluru Rural',
  'Kolar',
  'Hubballi',
  'Belagavi'
]

export const AdminPriceIntelligence = () => {
  const { user } = useAuth()
  const [prices, setPrices] = useState(DEMO_PRICE_INTELLIGENCE)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedCropForBuffer, setSelectedCropForBuffer] = useState(null)
  const [showBufferOrderModal, setShowBufferOrderModal] = useState(false)

  // Buffer Order Form State
  const [bufferForm, setBufferForm] = useState({
    cropName: '',
    targetQuantityQtl: '',
    procurementRate: '',
    storageFacility: '',
    targetMandi: '',
    budgetOutlayLakhs: ''
  })

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Agmarknet Karnataka modal price intelligence feeds synchronized!')
    }, 600)
  }

  const handleOpenBufferModal = (crop) => {
    setSelectedCropForBuffer(crop)
    setBufferForm({
      cropName: crop.cropName,
      targetQuantityQtl: crop.stateBufferRequirementQtl.toString(),
      procurementRate: (crop.currentModalRate || crop.mspFloorPrice).toString(),
      storageFacility: crop.allocatedStorage,
      targetMandi: crop.primaryMandi,
      budgetOutlayLakhs: ((crop.stateBufferRequirementQtl * crop.currentModalRate) / 100000).toFixed(2)
    })
    setShowBufferOrderModal(true)
  }

  const handleExecuteBufferOrder = (e) => {
    e.preventDefault()
    if (!bufferForm.targetQuantityQtl || !bufferForm.procurementRate) {
      toast.error('Please enter valid quantity and price')
      return
    }

    setPrices((prev) =>
      prev.map((p) =>
        p._id === selectedCropForBuffer._id ? { ...p, bufferStatus: 'procured' } : p
      )
    )
    setShowBufferOrderModal(false)
    toast.success(
      `State Buffer Order Dispatched: ${bufferForm.targetQuantityQtl} Qtl ${bufferForm.cropName} at ₹${bufferForm.procurementRate}/Qtl 🚀`
    )
  }

  // Filtered List
  const filteredPrices = useMemo(() => {
    return prices.filter((p) => {
      const matchesCategory =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'requisitions'
          ? p.bufferStatus === 'requisition_open'
          : p.category === selectedCategory

      const matchesDistrict =
        selectedDistrict === 'All Districts' ? true : p.district === selectedDistrict

      const q = searchQuery.toLowerCase()
      const matchesSearch =
        p.cropName.toLowerCase().includes(q) ||
        p.primaryMandi.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.allocatedStorage.toLowerCase().includes(q)

      return matchesCategory && matchesDistrict && matchesSearch
    })
  }, [prices, selectedCategory, selectedDistrict, searchQuery])

  // Aggregate Metrics
  const surgeCount = prices.filter((p) => p.volatilityStatus === 'SURGE_RISK').length
  const totalBufferRequired = prices.reduce((acc, p) => acc + p.stateBufferRequirementQtl, 0)

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-semibold border border-purple-500/20 mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>State Food Security & Market Intervention Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Price Intelligence & State Buffer Stock Planner 📈
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Monitor macroeconomic price shifts, identify inflationary surges, and execute state food security buffer stock procurements.
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
            Sync Agmarknet Feeds
          </Button>

          <Button 
            onClick={() => toast.success('Statewide Agricultural Price Intelligence Brief exported!')}
            className="rounded-xl text-xs h-10 px-4 font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md"
          >
            <Download className="w-4 h-4 mr-1.5" /> Export Brief (PDF)
          </Button>
        </div>
      </div>

      {/* 2. 4 Macro Price & Buffer KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Tracked APMC Crops</span>
          <p className="text-2xl font-black text-foreground">48 Crops</p>
          <span className="text-[11px] text-muted-foreground">30 Karnataka Districts</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">High Volatility Surges</span>
          <p className="text-2xl font-black text-rose-600">{surgeCount} Commodities</p>
          <span className="text-[11px] text-rose-600 font-bold">Tomato (+14.2%) • Onion (+18.5%)</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">State Buffer Requisition</span>
          <p className="text-2xl font-black text-purple-600">{totalBufferRequired.toLocaleString('en-IN')} Qtl</p>
          <span className="text-[11px] text-muted-foreground">Sanctioned Outlay: ₹18.50 Cr</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">MSP Floor Compliance</span>
          <p className="text-2xl font-black text-emerald-600">98.6%</p>
          <span className="text-[11px] text-emerald-600 font-bold">Above Statutory MSP 🟢</span>
        </div>
      </div>

      {/* 3. Category Filter Tabs & District Dropdown */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto py-1">
            {CATEGORY_TABS.map((tab) => {
              const count =
                tab.id === 'all'
                  ? prices.length
                  : tab.id === 'requisitions'
                  ? prices.filter((p) => p.bufferStatus === 'requisition_open').length
                  : prices.filter((p) => p.category === tab.id).length

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

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="h-10 px-3.5 rounded-xl bg-card border border-border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            >
              {KARNATAKA_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search commodity name, APMC mandi yard, or warehouse facility..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
        </div>
      </div>

      {/* 4. Price Intelligence Table */}
      <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border">
              <tr>
                <th className="p-4">Commodity & Mandi</th>
                <th className="p-4">Modal Price (₹/Qtl)</th>
                <th className="p-4">MSP Floor (₹/Qtl)</th>
                <th className="p-4">7-Day / 30-Day Trend</th>
                <th className="p-4">Volatility Risk</th>
                <th className="p-4">Buffer Target</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPrices.map((item) => (
                <tr key={item._id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <p className="font-extrabold text-foreground">{item.cropName}</p>
                    <span className="text-[10px] text-muted-foreground">{item.primaryMandi}</span>
                  </td>

                  <td className="p-4 font-mono font-black text-sm text-foreground">
                    ₹{item.currentModalRate.toLocaleString('en-IN')}
                  </td>

                  <td className="p-4 font-mono font-bold text-muted-foreground">
                    ₹{item.mspFloorPrice.toLocaleString('en-IN')}
                  </td>

                  <td className="p-4 font-mono">
                    <div className="flex items-center gap-1.5 font-bold">
                      {item.shift7dPercent >= 0 ? (
                        <span className="text-emerald-600 flex items-center gap-0.5">
                          <TrendingUp className="w-3.5 h-3.5" /> +{item.shift7dPercent}%
                        </span>
                      ) : (
                        <span className="text-rose-600 flex items-center gap-0.5">
                          <TrendingDown className="w-3.5 h-3.5" /> {item.shift7dPercent}%
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground block">
                      30D: {item.shift30dPercent >= 0 ? `+${item.shift30dPercent}%` : `${item.shift30dPercent}%`}
                    </span>
                  </td>

                  <td className="p-4">
                    {item.volatilityStatus === 'SURGE_RISK' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 text-[10px] font-bold border border-rose-500/20">
                        <AlertTriangle className="w-3 h-3" /> Surge Risk 🔴
                      </span>
                    )}
                    {item.volatilityStatus === 'DEFICIT_RISK' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[10px] font-bold border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3" /> Below MSP 🟡
                      </span>
                    )}
                    {item.volatilityStatus === 'STABLE' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Stable 🟢
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    <p className="font-mono font-bold text-foreground">
                      {item.stateBufferRequirementQtl.toLocaleString('en-IN')} Qtl
                    </p>
                    <span className="text-[10px] text-muted-foreground block truncate max-w-[140px]">
                      {item.allocatedStorage}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <Button 
                      size="sm"
                      onClick={() => handleOpenBufferModal(item)}
                      className={`rounded-xl text-xs h-8 px-3 font-bold shadow-sm ${
                        item.bufferStatus === 'procured'
                          ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5 mr-1" />
                      {item.bufferStatus === 'procured' ? 'Order Fulfilled' : 'Order Buffer'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. State Buffer Stock Procurement Order Modal */}
      {showBufferOrderModal && selectedCropForBuffer && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">
                    State Buffer Stock Procurement Order
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    Karnataka Food & Civil Supplies Market Intervention Initiative
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setShowBufferOrderModal(false)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleExecuteBufferOrder} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                <span className="text-[10px] font-bold text-purple-700 uppercase">Selected Commodity</span>
                <p className="font-extrabold text-sm text-foreground">{bufferForm.cropName} ({selectedCropForBuffer.district} District)</p>
                <p className="text-[11px] text-purple-900 font-mono">
                  Current Market Modal Rate: ₹{selectedCropForBuffer.currentModalRate}/Qtl • MSP Floor: ₹{selectedCropForBuffer.mspFloorPrice}/Qtl
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Target Procurement (Quintals) *</label>
                  <input
                    type="number"
                    required
                    value={bufferForm.targetQuantityQtl}
                    onChange={(e) => {
                      const qty = parseFloat(e.target.value) || 0
                      const rate = parseFloat(bufferForm.procurementRate) || 0
                      setBufferForm({
                        ...bufferForm,
                        targetQuantityQtl: e.target.value,
                        budgetOutlayLakhs: ((qty * rate) / 100000).toFixed(2)
                      })
                    }}
                    className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Procurement Rate (₹/Qtl) *</label>
                  <input
                    type="number"
                    required
                    value={bufferForm.procurementRate}
                    onChange={(e) => {
                      const rate = parseFloat(e.target.value) || 0
                      const qty = parseFloat(bufferForm.targetQuantityQtl) || 0
                      setBufferForm({
                        ...bufferForm,
                        procurementRate: e.target.value,
                        budgetOutlayLakhs: ((qty * rate) / 100000).toFixed(2)
                      })
                    }}
                    className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Allocated State Storage / Cold Chain Warehouse</label>
                <input
                  type="text"
                  required
                  value={bufferForm.storageFacility}
                  onChange={(e) => setBufferForm({ ...bufferForm, storageFacility: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border flex justify-between items-center font-mono">
                <span className="text-muted-foreground font-bold">Total State Treasury Outlay:</span>
                <span className="text-base font-black text-purple-600">₹{bufferForm.budgetOutlayLakhs} Lakhs</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setShowBufferOrderModal(false)}
                  className="rounded-xl text-xs h-10"
                >
                  Cancel
                </Button>

                <Button 
                  type="submit"
                  className="rounded-xl text-xs font-bold h-10 px-6 bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                >
                  Dispatch Market Intervention Order 🚀
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPriceIntelligence
