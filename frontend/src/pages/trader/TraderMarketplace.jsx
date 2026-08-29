import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Gavel, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowUpRight, 
  TrendingDown, 
  TrendingUp, 
  Zap, 
  DollarSign, 
  Layers, 
  RefreshCw, 
  ChevronRight, 
  Star,
  Info,
  X
} from 'lucide-react'

const DEMO_MARKETPLACE_LOTS = [
  {
    _id: 'LOT-KA-HSN-101',
    cropName: 'Grade-A Fresh Hybrid Tomato',
    variety: 'Shiva Hybrid (Firm Red Skin)',
    category: 'vegetables',
    grade: 'Grade-A Premium',
    quantity: 120,
    unit: 'Quintals',
    reservePrice: 1800,
    currentHighestBid: 2150,
    apmcBenchmark: 2380,
    instantBuyoutPrice: 2300,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80',
    farmer: {
      name: 'Ramesh Gowda',
      village: 'Belur',
      district: 'Hassan',
      rating: 4.9,
      totalTrades: 42,
      verified: true
    },
    closingIn: '1h 45m',
    bidsCount: 6,
    harvestDate: '26 Aug 2026'
  },
  {
    _id: 'LOT-KA-MND-102',
    cropName: 'Bellary Premium Red Onion',
    variety: 'Nasik Red Medium-Large Bulbs',
    category: 'vegetables',
    grade: 'Grade-A Export',
    quantity: 250,
    unit: 'Quintals',
    reservePrice: 2200,
    currentHighestBid: 2550,
    apmcBenchmark: 2800,
    instantBuyoutPrice: 2750,
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&q=80',
    farmer: {
      name: 'Basavaraj Patil',
      village: 'Malavalli',
      district: 'Mandya',
      rating: 4.8,
      totalTrades: 35,
      verified: true
    },
    closingIn: '3h 15m',
    bidsCount: 8,
    harvestDate: '25 Aug 2026'
  },
  {
    _id: 'LOT-KA-BLR-103',
    cropName: 'Yellow Dent Poultry Maize',
    variety: 'Kargil 900M Hybrid',
    category: 'grains',
    grade: 'Grade-A Commercial',
    quantity: 300,
    unit: 'Quintals',
    reservePrice: 1900,
    currentHighestBid: 2050,
    apmcBenchmark: 2200,
    instantBuyoutPrice: 2180,
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500&q=80',
    farmer: {
      name: 'Channappa Gowda',
      village: 'Doddaballapura',
      district: 'Bengaluru Rural',
      rating: 4.9,
      totalTrades: 58,
      verified: true
    },
    closingIn: '5h 30m',
    bidsCount: 4,
    harvestDate: '24 Aug 2026'
  },
  {
    _id: 'LOT-KA-KLR-104',
    cropName: 'Organic Finger Millet (Ragi)',
    variety: 'ML-365 High-Calcium Grain',
    category: 'grains',
    grade: 'Grade-A Organic',
    quantity: 150,
    unit: 'Quintals',
    reservePrice: 3200,
    currentHighestBid: 3450,
    apmcBenchmark: 3800,
    instantBuyoutPrice: 3700,
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&q=80',
    farmer: {
      name: 'Venkatesh Murthy',
      village: 'Bangarapet',
      district: 'Kolar',
      rating: 5.0,
      totalTrades: 29,
      verified: true
    },
    closingIn: '6h 10m',
    bidsCount: 5,
    harvestDate: '25 Aug 2026'
  },
  {
    _id: 'LOT-KA-MYS-105',
    cropName: 'Hassan Jyoti Table Potatoes',
    variety: 'Kufri Jyoti (Washed)',
    category: 'vegetables',
    grade: 'Grade-A Premium',
    quantity: 200,
    unit: 'Quintals',
    reservePrice: 1500,
    currentHighestBid: 1720,
    apmcBenchmark: 1950,
    instantBuyoutPrice: 1880,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&q=80',
    farmer: {
      name: 'Nagaraj Somanna',
      village: 'Hunsur',
      district: 'Mysuru',
      rating: 4.7,
      totalTrades: 22,
      verified: true
    },
    closingIn: '8h 40m',
    bidsCount: 3,
    harvestDate: '26 Aug 2026'
  },
  {
    _id: 'LOT-KA-BLG-106',
    cropName: 'Byadagi Stemless Red Chilli',
    variety: 'Byadagi Kaddi (Deep Red Oleoresin)',
    category: 'spices',
    grade: 'Grade-A Export',
    quantity: 80,
    unit: 'Quintals',
    reservePrice: 16000,
    currentHighestBid: 18500,
    apmcBenchmark: 21000,
    instantBuyoutPrice: 20500,
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&q=80',
    farmer: {
      name: 'Mallikarjun Patil',
      village: 'Chikkodi',
      district: 'Belagavi',
      rating: 4.9,
      totalTrades: 64,
      verified: true
    },
    closingIn: '12h 00m',
    bidsCount: 11,
    harvestDate: '23 Aug 2026'
  }
]

const CATEGORY_TABS = [
  { id: 'all', label: 'All Crops' },
  { id: 'vegetables', label: 'Vegetables' },
  { id: 'grains', label: 'Grains & Cereals' },
  { id: 'spices', label: 'Spices & Cash Crops' }
]

const DISTRICT_OPTIONS = ['All Districts', 'Hassan', 'Mandya', 'Mysuru', 'Belagavi', 'Kolar', 'Bengaluru Rural', 'Dharwad', 'Kalaburagi', 'Ballari']

export const TraderMarketplace = () => {
  const { user } = useAuth()
  const [lots, setLots] = useState(DEMO_MARKETPLACE_LOTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts')
  const [sortBy, setSortBy] = useState('closingSoon') // 'closingSoon' | 'priceLow' | 'priceHigh' | 'highestVolume'
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Modals State
  const [selectedLotForBid, setSelectedLotForBid] = useState(null)
  const [bidAmount, setBidAmount] = useState('')
  const [selectedLotForBuyout, setSelectedLotForBuyout] = useState(null)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Marketplace lot feeds refreshed with live APMC arrivals!')
    }, 600)
  }

  const handleOpenBidModal = (lot) => {
    setSelectedLotForBid(lot)
    setBidAmount(lot.currentHighestBid + 50)
  }

  const handleOpenBuyoutModal = (lot) => {
    setSelectedLotForBuyout(lot)
  }

  const handleSubmitBid = (e) => {
    e.preventDefault()
    const parsed = Number(bidAmount)
    if (!parsed || parsed <= (selectedLotForBid?.currentHighestBid || 0)) {
      toast.error(`Bid must exceed current highest bid of ₹${selectedLotForBid?.currentHighestBid}/Qtl`)
      return
    }

    setLots((prev) =>
      prev.map((l) =>
        l._id === selectedLotForBid._id
          ? { ...l, currentHighestBid: parsed, bidsCount: l.bidsCount + 1 }
          : l
      )
    )

    toast.success(`Bid of ₹${parsed.toLocaleString('en-IN')}/Qtl placed successfully on Lot #${selectedLotForBid._id}!`)
    setSelectedLotForBid(null)
  }

  const handleConfirmBuyout = () => {
    toast.success(`Instant Buyout Confirmed at ₹${selectedLotForBuyout?.instantBuyoutPrice.toLocaleString('en-IN')}/Qtl! Escrow locked.`)
    setSelectedLotForBuyout(null)
  }

  // Filtered & Sorted Lots
  const filteredLots = useMemo(() => {
    return lots
      .filter((lot) => {
        const matchesCategory = selectedCategory === 'all' || lot.category === selectedCategory
        const matchesDistrict = selectedDistrict === 'All Districts' || lot.farmer.district === selectedDistrict
        const matchesSearch =
          lot.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lot.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lot.farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lot.farmer.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lot._id.toLowerCase().includes(searchQuery.toLowerCase())

        return matchesCategory && matchesDistrict && matchesSearch
      })
      .sort((a, b) => {
        if (sortBy === 'priceLow') return a.currentHighestBid - b.currentHighestBid
        if (sortBy === 'priceHigh') return b.currentHighestBid - a.currentHighestBid
        if (sortBy === 'highestVolume') return b.quantity - a.quantity
        return 0 // default: closing soon
      })
  }, [lots, searchQuery, selectedCategory, selectedDistrict, sortBy])

  return (
    <div className="space-y-8">
      
      {/* 1. Header & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-semibold border border-amber-500/20 mb-2">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Live Karnataka APMC Farm-Gate Marketplace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Crop Discovery & Bidding Explorer 🌾
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Browse verified harvest lots from Karnataka farmers. Place direct competitive bids or execute instant escrow buyouts.
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
            Refresh Lots
          </Button>

          <Button asChild size="sm" className="rounded-xl text-xs h-10 px-4 font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md">
            <Link to="/trader/my-bids">
              <Gavel className="w-4 h-4 mr-1.5" /> My Active Bids
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Search & Multi-Facet Filters Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border shadow-sm space-y-4">
        
        {/* Search Input & District/Sort Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by crop (Tomato, Onion), variety, farmer name, or district..."
              className="w-full h-11 pl-10 pr-4 rounded-2xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* District Dropdown */}
          <div className="sm:col-span-3 relative">
            <MapPin className="w-4 h-4 text-amber-600 absolute left-3 top-3.5" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full h-11 pl-9 pr-3 rounded-2xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              {DISTRICT_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-11 px-3 rounded-2xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              <option value="closingSoon">⏱️ Closing Soonest</option>
              <option value="priceLow">📉 Lowest Bid First</option>
              <option value="priceHigh">📈 Highest Price First</option>
              <option value="highestVolume">📦 Highest Volume (Qtl)</option>
            </select>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === tab.id
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Marketplace Crop Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLots.map((lot) => {
          const savingsPerQtl = lot.apmcBenchmark - lot.currentHighestBid
          const savingsPercentage = Math.round((savingsPerQtl / lot.apmcBenchmark) * 100)

          return (
            <div 
              key={lot._id} 
              className="rounded-3xl bg-card border border-border hover:border-amber-500/50 transition-all overflow-hidden shadow-sm flex flex-col justify-between group"
            >
              <div>
                {/* Image Container with Badges */}
                <Link to={`/trader/crops/${lot._id}`} className="block relative h-48 w-full overflow-hidden bg-muted">
                  <img 
                    src={lot.image} 
                    alt={lot.cropName} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Grade Badge */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-background/90 backdrop-blur text-[10px] font-extrabold text-foreground border border-border shadow-sm">
                    {lot.grade}
                  </span>

                  {/* Closing Timer Badge */}
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-rose-600 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                    <Clock className="w-3 h-3" /> {lot.closingIn} left
                  </span>

                  {/* Quantity & Location Bar */}
                  <div className="absolute bottom-3 left-3 right-3 px-3 py-1.5 rounded-xl bg-background/95 backdrop-blur text-xs font-bold text-foreground border border-border flex items-center justify-between shadow-sm">
                    <span className="text-amber-600 font-extrabold">{lot.quantity} {lot.unit}</span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary" /> {lot.farmer.village}, {lot.farmer.district}
                    </span>
                  </div>
                </Link>

                {/* Card Body */}
                <div className="p-5 space-y-4">
                  
                  {/* Title & Farmer Info */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">{lot._id}</span>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {lot.bidsCount} Bids Placed
                      </span>
                    </div>

                    <Link to={`/trader/crops/${lot._id}`} className="block hover:text-amber-600 transition-colors">
                      <h3 className="text-base font-extrabold text-foreground leading-snug">
                        {lot.cropName}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground">{lot.variety}</p>

                    {/* Farmer Profile Line */}
                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <span className="font-semibold text-foreground">{lot.farmer.name}</span>
                      <span className="flex items-center gap-0.5 text-amber-500 font-bold text-[11px]">
                        <Star className="w-3 h-3 fill-amber-500" /> {lot.farmer.rating}
                      </span>
                      <span className="text-[10px] text-muted-foreground">({lot.farmer.totalTrades} Trades)</span>
                    </div>
                  </div>

                  {/* Pricing Comparison Box */}
                  <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Current High Bid:</span>
                      <span className="text-base font-black text-amber-600">
                        ₹{lot.currentHighestBid.toLocaleString('en-IN')} <span className="text-[10px] font-normal text-muted-foreground">/ Qtl</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                      <span>APMC Mandi Modal Rate:</span>
                      <span className="font-semibold text-foreground">₹{lot.apmcBenchmark.toLocaleString('en-IN')} / Qtl</span>
                    </div>

                    {/* Trader Margin Callout */}
                    {savingsPerQtl > 0 && (
                      <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                        <span className="flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" /> Direct Farm Savings:
                        </span>
                        <span>₹{savingsPerQtl}/Qtl ({savingsPercentage}%)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleOpenBidModal(lot)}
                  className="w-full rounded-2xl text-xs font-bold h-10 bg-amber-600 hover:bg-amber-700 text-white shadow-md"
                >
                  <Gavel className="w-3.5 h-3.5 mr-1" /> Place Bid
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleOpenBuyoutModal(lot)}
                  className="w-full rounded-2xl text-xs font-bold h-10 border-amber-500/40 text-foreground hover:bg-amber-500/10 shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 mr-1 text-amber-600" /> Buy Now
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredLots.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-foreground">No Crop Lots Found</p>
          <p className="text-xs text-muted-foreground">Try clearing your search query or selecting a different district filter.</p>
        </div>
      )}

      {/* 4. Modal: Quick Place Bid */}
      {selectedLotForBid && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-600 uppercase">
                  {selectedLotForBid._id}
                </span>
                <h3 className="text-lg font-extrabold text-foreground">
                  Place Competitive B2B Bid
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedLotForBid.cropName} • {selectedLotForBid.quantity} {selectedLotForBid.unit}
                </p>
              </div>

              <button 
                onClick={() => setSelectedLotForBid(null)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBid} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Farmer Reserve Rate:</span>
                  <span className="font-semibold text-foreground">₹{selectedLotForBid.reservePrice}/Qtl</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current High Offer:</span>
                  <span className="font-extrabold text-amber-600">₹{selectedLotForBid.currentHighestBid}/Qtl</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Your Bid Rate (₹ / Quintal)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-muted-foreground text-sm">₹</span>
                  <input
                    type="number"
                    min={selectedLotForBid.currentHighestBid + 10}
                    step="10"
                    required
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full h-11 pl-8 pr-4 rounded-xl bg-background border border-border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>

              {/* Total Escrow Calculation */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1 text-xs">
                <div className="flex justify-between font-extrabold text-foreground">
                  <span>Gross Lot Value:</span>
                  <span>₹{(Number(bidAmount || 0) * selectedLotForBid.quantity).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>APMC Market Cess (1.5%):</span>
                  <span>₹{Math.round(Number(bidAmount || 0) * selectedLotForBid.quantity * 0.015).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSelectedLotForBid(null)}
                  className="rounded-xl text-xs h-10"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="rounded-xl text-xs font-bold h-10 bg-amber-600 hover:bg-amber-700 text-white shadow-md"
                >
                  Confirm & Submit Bid
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Instant Buyout Confirmation */}
      {selectedLotForBuyout && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase">
                  Instant Escrow Buyout
                </span>
                <h3 className="text-lg font-extrabold text-foreground">
                  Direct Farm Lot Purchase
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedLotForBuyout.cropName} • {selectedLotForBuyout.quantity} {selectedLotForBuyout.unit}
                </p>
              </div>

              <button 
                onClick={() => setSelectedLotForBuyout(null)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fixed Buyout Rate:</span>
                  <span className="font-extrabold text-foreground">₹{selectedLotForBuyout.instantBuyoutPrice}/Qtl</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Lot Volume:</span>
                  <span className="font-bold text-foreground">{selectedLotForBuyout.quantity} Quintals</span>
                </div>
                <div className="flex justify-between font-black text-sm text-emerald-600 pt-2 border-t border-border">
                  <span>Total Escrow Lock:</span>
                  <span>₹{(selectedLotForBuyout.instantBuyoutPrice * selectedLotForBuyout.quantity).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                By confirming, the full lot value will be reserved in banking escrow, and the APMC logistics vehicle will be dispatched immediately to {selectedLotForBuyout.farmer.village}, {selectedLotForBuyout.farmer.district}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setSelectedLotForBuyout(null)}
                className="rounded-xl text-xs h-10"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmBuyout}
                className="rounded-xl text-xs font-bold h-10 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              >
                Lock Escrow & Buy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TraderMarketplace
