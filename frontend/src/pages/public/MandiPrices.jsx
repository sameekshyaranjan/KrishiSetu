import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import mandiService from '@/services/mandiService'
import { Button } from '@/components/ui/button'
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
  Layers 
} from 'lucide-react'
import MandiPriceChart from '@/components/common/MandiPriceChart'

export const MandiPrices = () => {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('All')
  const [selectedCommodity, setSelectedCommodity] = useState('All')
  const [districts, setDistricts] = useState([])
  const [commodities, setCommodities] = useState([])
  const [isLiveApi, setIsLiveApi] = useState(false)

  const fetchMandiData = async () => {
    setLoading(true)
    try {
      const [priceRes, distRes, commRes] = await Promise.all([
        mandiService.getLivePrices(),
        mandiService.getDistricts(),
        mandiService.getCommodities()
      ])

      const fetchedPrices = priceRes.prices || []
      setPrices(fetchedPrices)
      setDistricts(distRes || [])
      setCommodities(commRes || [])
      setIsLiveApi(priceRes.source === 'api' || Boolean(priceRes.total && !priceRes._isFallback))
    } catch (err) {
      console.error('[MandiPrices] Error fetching live prices:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMandiData()
  }, [])

  // Filtered price list
  const filteredPrices = useMemo(() => {
    return prices.filter((item) => {
      const matchesSearch = 
        item.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.market.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.district.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesDistrict = selectedDistrict === 'All' || item.district === selectedDistrict
      const matchesCommodity = selectedCommodity === 'All' || item.commodity.includes(selectedCommodity)

      return matchesSearch && matchesDistrict && matchesCommodity
    })
  }, [prices, searchQuery, selectedDistrict, selectedCommodity])

  // Dynamically computed metrics from real active dataset
  const dynamicKpis = useMemo(() => {
    const uniqueMarkets = new Set(prices.map((p) => p.market)).size
    const uniqueCommodities = new Set(prices.map((p) => p.commodity)).size
    const totalVolume = prices.reduce((acc, curr) => acc + (Number(curr.arrivals) || 0), 0)
    
    return {
      markets: uniqueMarkets,
      commodities: uniqueCommodities,
      volume: totalVolume
    }
  }, [prices])

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20 mb-2">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Agmarknet & data.gov.in Live Price Stream</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Live APMC Mandi Rates
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time daily arrival volume and benchmark wholesale prices across Karnataka APMC markets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchMandiData} 
            disabled={loading}
            className="rounded-xl text-xs shadow-sm h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Rates
          </Button>
          <div className="px-3 py-1.5 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground hidden sm:flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Updated: Today ({new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })})</span>
          </div>
        </div>
      </div>

      {/* Dynamic Summary KPI Cards (Computed from active dataset) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Active Mandis Listed</span>
          <p className="text-2xl font-extrabold text-foreground">
            {loading ? '...' : `${dynamicKpis.markets} APMCs`}
          </p>
          <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" /> Karnataka APMC Yards
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Tracked Commodities</span>
          <p className="text-2xl font-extrabold text-primary">
            {loading ? '...' : `${dynamicKpis.commodities} Crops`}
          </p>
          <span className="text-[10px] text-muted-foreground">Grains, Pulses, Vegetables</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Daily Arrivals Recorded</span>
          <p className="text-2xl font-extrabold text-foreground">
            {loading ? '...' : `${dynamicKpis.volume.toLocaleString('en-IN')} Qtl`}
          </p>
          <span className="text-[10px] text-emerald-500 font-medium">Aggregate market volume</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">API Sync Status</span>
          <p className="text-2xl font-extrabold text-amber-500 flex items-center gap-1.5">
            <Activity className="w-5 h-5 text-emerald-500" />
            <span className="text-base text-foreground font-bold">Agmarknet Sync</span>
          </p>
          <span className="text-[10px] text-muted-foreground">Direct wholesale feeds</span>
        </div>
      </div>

      {/* Historical Price Intelligence & Trend Chart */}
      <MandiPriceChart />

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crop, mandi, or district..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* District Selector */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="All">All Karnataka Districts</option>
              {districts.filter(d => d !== 'All Districts').map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Commodity Selector */}
          <div>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="All">All Commodities</option>
              {commodities.filter(c => c !== 'All Commodities').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary & Count */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>Showing <strong>{filteredPrices.length}</strong> mandi market records</span>
          {(searchQuery || selectedDistrict !== 'All' || selectedCommodity !== 'All') && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedDistrict('All'); setSelectedCommodity('All'); }}
              className="text-primary hover:underline font-medium cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Commodity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrices.map((item) => {
          return (
            <div 
              key={item._id || `${item.commodity}-${item.market}`}
              className="rounded-3xl bg-card border border-border hover:border-primary/50 p-6 shadow-sm hover:shadow-md transition-all space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                
                {/* Header Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-lg text-foreground tracking-tight">
                      {item.commodity}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{item.market}, {item.district}</span>
                    </p>
                  </div>

                  {item.trend === 'up' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border border-emerald-500/20">
                      <TrendingUp className="w-3 h-3" /> High Demand
                    </span>
                  )}
                  {item.trend === 'down' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold border border-rose-500/20">
                      <TrendingDown className="w-3 h-3" /> Price Drop
                    </span>
                  )}
                  {(!item.trend || item.trend === 'steady') && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold border border-border">
                      <Minus className="w-3 h-3" /> Steady
                    </span>
                  )}
                </div>

                {/* Primary Modal Rate Display */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Prevailing Modal Rate
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-primary">
                      ₹{item.modalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      / {item.unit ? item.unit.replace('Rs/', '') : 'Quintal'}
                    </span>
                  </div>
                </div>

                {/* Range & Arrival Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-background border border-border space-y-0.5">
                    <span className="text-[10px] text-muted-foreground">Min - Max Range</span>
                    <p className="font-bold text-foreground">
                      ₹{item.minPrice?.toLocaleString('en-IN')} - ₹{item.maxPrice?.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-background border border-border space-y-0.5">
                    <span className="text-[10px] text-muted-foreground">Daily Arrivals</span>
                    <p className="font-bold text-foreground">
                      {item.arrivals ? `${item.arrivals.toLocaleString('en-IN')} Qtl` : 'Active'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-border flex items-center gap-2">
                <Button asChild size="sm" variant="outline" className="w-1/2 rounded-xl text-xs font-semibold">
                  <Link to="/register/farmer">
                    Sell Harvest
                  </Link>
                </Button>
                <Button asChild size="sm" className="w-1/2 rounded-xl text-xs font-semibold shadow-sm">
                  <Link to="/register/trader">
                    Place Bid
                  </Link>
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredPrices.length === 0 && !loading && (
        <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
          <p className="text-base font-bold text-foreground">No mandi records matched your filters</p>
          <p className="text-xs text-muted-foreground">Try clearing your search query or selecting a different district.</p>
          <Button onClick={() => { setSearchQuery(''); setSelectedDistrict('All'); setSelectedCommodity('All'); }} size="sm" variant="outline">
            Reset Filters
          </Button>
        </div>
      )}

      {/* Official Government Citation Box */}
      <div className="p-6 rounded-3xl bg-muted/40 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-foreground">Official Government Data Integration</p>
            <p className="text-[11px]">Commodity market price arrivals sourced from Agmarknet API & Directorate of Marketing & Inspection (DMI).</p>
          </div>
        </div>
        <a 
          href="https://agmarknet.gov.in" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary font-semibold hover:underline shrink-0"
        >
          agmarknet.gov.in <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}

export default MandiPrices
