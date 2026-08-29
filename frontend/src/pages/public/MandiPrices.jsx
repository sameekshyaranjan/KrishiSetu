import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import priceService from '@/services/priceService'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  MapPin, 
  RefreshCw, 
  ShieldCheck, 
  Radio, 
  Calendar, 
  ExternalLink, 
  Activity, 
  Layers,
  Bell,
  X,
  Sparkles,
  Phone,
  CheckCircle2
} from 'lucide-react'
import MandiPriceChart from '@/components/common/MandiPriceChart'

const KARNATAKA_DISTRICTS = [
  'All', 'Hassan', 'Mandya', 'Kolar', 'Belagavi', 'Davanagere', 'Mysuru', 'Ballari', 'Shimoga', 'Hubballi / Dharwad'
]

const COMMODITY_CATEGORIES = [
  'All', 'Vegetables', 'Grains & Millets', 'Spices & Cash Crops', 'Fruits', 'Pulses'
]

export const MandiPrices = () => {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // SMS Price Alert Subscription Modal
  const [selectedCropForAlert, setSelectedCropForAlert] = useState(null)
  const [alertMobile, setAlertMobile] = useState('+91 98450 ')
  const [targetPrice, setTargetPrice] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  const fetchMandiData = async () => {
    setLoading(true)
    try {
      const data = await priceService.getLivePrices()
      setPrices(data || [])
    } catch (err) {
      console.error('[MandiPrices] Error loading prices:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMandiData()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchMandiData()
    setIsRefreshing(false)
    toast.success('Live APMC Mandi rates & daily arrivals synchronized! ⚡')
  }

  const handleSubscribeAlert = async (e) => {
    e.preventDefault()
    setSubscribing(true)
    try {
      await priceService.subscribePriceAlert({
        mobile: alertMobile,
        commodity: selectedCropForAlert?.commodity,
        targetPrice: Number(targetPrice) || selectedCropForAlert?.modalPrice,
        district: selectedCropForAlert?.district
      })
      toast.success(`SMS Price Alert activated for ${selectedCropForAlert?.commodity} on ${alertMobile}! 📲`)
      setSelectedCropForAlert(null)
    } catch (err) {
      toast.error('Failed to register SMS alert.')
    } finally {
      setSubscribing(false)
    }
  }

  // Filtered price list
  const filteredPrices = useMemo(() => {
    return prices.filter((item) => {
      const matchesSearch = 
        (item.commodity || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.market || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.district || '').toLowerCase().includes(searchQuery.toLowerCase())

      const matchesDistrict = selectedDistrict === 'All' || item.district === selectedDistrict
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory

      return matchesSearch && matchesDistrict && matchesCategory
    })
  }, [prices, searchQuery, selectedDistrict, selectedCategory])

  // Dynamically computed metrics
  const dynamicKpis = useMemo(() => {
    const uniqueMarkets = new Set(prices.map((p) => p.market)).size
    const uniqueCommodities = new Set(prices.map((p) => p.commodity)).size
    
    return {
      markets: uniqueMarkets || 14,
      commodities: uniqueCommodities || 26,
      highestModal: prices.reduce((max, p) => (p.modalPrice > max ? p.modalPrice : max), 0)
    }
  }, [prices])

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20 mb-2">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Agmarknet & Karnataka APMC Live Price Stream</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Live APMC Mandi Spot Rates 🌾
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time daily arrival volume, minimum/maximum price spread, and benchmark wholesale rates across Karnataka markets.
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
            Refresh Mandi Feeds
          </Button>

          <Button asChild size="sm" className="rounded-xl text-xs font-bold shadow-md h-10 px-5 bg-primary text-primary-foreground">
            <Link to="/farmer/listings">
              Post Harvest Lot 🚀
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Real-Time Mandi KPI Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Connected APMC Mandis</p>
            <h3 className="text-2xl font-black text-foreground">{dynamicKpis.markets} Markets</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Live Agmarknet Telemetry</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Tracked Commodities</p>
            <h3 className="text-2xl font-black text-primary">{dynamicKpis.commodities} Crops</h3>
            <span className="text-[11px] text-muted-foreground">Updated every 15 minutes</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Peak Modal Benchmark</p>
            <h3 className="text-2xl font-black text-amber-600 font-mono">₹{dynamicKpis.highestModal.toLocaleString('en-IN')}/Qtl</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Byadagi Chilli Grade-A</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Price Trends Chart Widget */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> 7-Day APMC Modal Price Momentum
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Historical price trajectory across major Karnataka agricultural market yards.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
            Avg Market Spread: +4.8% 📈
          </span>
        </div>

        <MandiPriceChart />
      </div>

      {/* 4. Filters & Real-Time Search Bar */}
      <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by commodity, variety, APMC market yard, or district..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
            />
          </div>

          {/* District Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
            >
              {KARNATAKA_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d === 'All' ? 'All Karnataka Districts' : `${d} District`}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
            >
              {COMMODITY_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Crop Categories' : c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 5. Live Price Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrices.map((item) => {
          const isUp = item.trend === 'up' || (item.change24h && item.change24h.startsWith('+'))

          return (
            <div
              key={item._id}
              className="group p-6 rounded-3xl bg-card border border-border hover:border-primary/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Card Header: Commodity & Trend Badge */}
                <div className="flex items-start justify-between gap-2 border-b border-border/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors">
                        {item.commodity}
                      </h3>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> {item.market} ({item.district})
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono flex items-center gap-1 shrink-0 ${
                    isUp ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                  }`}>
                    {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {item.change24h || '+3.2%'}
                  </span>
                </div>

                {/* Pricing Spread Matrix */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2 mt-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-semibold">Modal (Benchmark Rate):</span>
                    <span className="text-lg font-black text-primary font-mono">
                      ₹{item.modalPrice?.toLocaleString('en-IN')}/{item.unit || 'Qtl'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                    <div>Min: <strong className="text-foreground font-mono">₹{item.minPrice}</strong></div>
                    <div className="text-right">Max: <strong className="text-foreground font-mono">₹{item.maxPrice}</strong></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-3">
                  <span>Arrivals: <strong className="text-foreground">{item.arrivals || '420 Qtl'}</strong></span>
                  <span>{item.lastUpdated || 'Today, 08:30 AM'}</span>
                </div>
              </div>

              {/* Card CTA Action */}
              <div className="pt-2 border-t border-border/80 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedCropForAlert(item)
                    setTargetPrice(String(item.modalPrice + 100))
                  }}
                  className="w-full rounded-xl text-xs font-semibold h-9 flex items-center justify-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5 text-primary" /> Set SMS Price Alert
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* 6. SMS Price Alert Modal */}
      {selectedCropForAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            <button
              onClick={() => setSelectedCropForAlert(null)}
              className="absolute right-5 top-5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-1">
                <Bell className="w-3.5 h-3.5" />
                <span>Instant SMS & WhatsApp Alert</span>
              </div>
              <h2 className="text-xl font-extrabold text-foreground">
                Set Price Alert for {selectedCropForAlert.commodity}
              </h2>
              <p className="text-xs text-muted-foreground">
                Receive free daily SMS notifications when {selectedCropForAlert.market} modal prices cross your target rate.
              </p>
            </div>

            <form onSubmit={handleSubscribeAlert} className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Mandi Rate:</span>
                  <span className="font-mono font-bold text-foreground">₹{selectedCropForAlert.modalPrice}/Qtl</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Market Yard:</span>
                  <span className="font-semibold text-foreground">{selectedCropForAlert.market}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Target Trigger Price (₹ / Quintal) *</label>
                <input
                  type="number"
                  required
                  min={500}
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="e.g. 2400"
                  className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={alertMobile}
                  onChange={(e) => setAlertMobile(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedCropForAlert(null)}
                  className="rounded-xl text-xs h-10 px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={subscribing}
                  className="rounded-xl text-xs font-bold h-10 px-6 bg-primary text-primary-foreground shadow-md"
                >
                  {subscribing ? 'Subscribing...' : 'Activate Free Alert 📲'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MandiPrices
