import { useState, useMemo } from 'react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import { TrendingUp, TrendingDown, Calendar, BarChart3, ArrowUpRight } from 'lucide-react'

// Realistic historical price data generator for selected commodity and time range
const generateHistoricalTrend = (commodity, days) => {
  const basePrices = {
    'Tomato': 2200,
    'Onion': 2550,
    'Maize': 2100,
    'Ragi (Finger Millet)': 3500,
    'Cotton (Kapas)': 7250,
    'Paddy (Basmati / Sona Masuri)': 2850,
    'Turmeric (Haldi)': 13900,
    'Green Chilli': 5100
  }

  const basePrice = basePrices[commodity] || 2400
  const data = []
  const today = new Date()

  let currentPrice = basePrice * (1 - (days * 0.008))

  for (let i = days; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    
    // Controlled realistic daily fluctuation (+/- 2.5%)
    const dailyDelta = (Math.sin(i * 0.7) * 0.03 + (Math.random() * 0.02 - 0.01)) * basePrice
    const price = Math.round(currentPrice + dailyDelta)
    const arrivals = Math.round(400 + Math.sin(i * 0.5) * 150 + Math.random() * 80)
    
    data.push({
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      fullDate: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      price,
      arrivals
    })

    currentPrice = price
  }

  return data
}

export const MandiPriceChart = ({ defaultCommodity = 'Tomato' }) => {
  const [selectedCommodity, setSelectedCommodity] = useState(defaultCommodity)
  const [timeRange, setTimeRange] = useState(15) // 7 | 15 | 30 days

  const trendData = useMemo(() => {
    return generateHistoricalTrend(selectedCommodity, timeRange)
  }, [selectedCommodity, timeRange])

  // Computed summary metrics for the window
  const stats = useMemo(() => {
    if (!trendData.length) return { min: 0, max: 0, avg: 0, change: 0 }
    const prices = trendData.map((d) => d.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    const firstPrice = trendData[0].price
    const lastPrice = trendData[trendData.length - 1].price
    const change = Math.round(((lastPrice - firstPrice) / firstPrice) * 100 * 10) / 10

    return { min, max, avg, change, firstPrice, lastPrice }
  }, [trendData])

  return (
    <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Chart Controls & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
              Historical Price Intelligence & Trends
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Modal wholesale price movements across Karnataka APMC mandis over time
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Commodity Dropdown */}
          <select
            value={selectedCommodity}
            onChange={(e) => setSelectedCommodity(e.target.value)}
            className="h-9 px-3 rounded-xl bg-background border border-border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="Tomato">🍅 Tomato</option>
            <option value="Onion">🧅 Onion</option>
            <option value="Maize">🌽 Maize</option>
            <option value="Ragi (Finger Millet)">🌾 Ragi</option>
            <option value="Cotton (Kapas)">☁️ Cotton</option>
            <option value="Paddy (Basmati / Sona Masuri)">🌾 Paddy</option>
            <option value="Turmeric (Haldi)">🌿 Turmeric</option>
            <option value="Green Chilli">🌶️ Green Chilli</option>
          </select>

          {/* Time Range Pills */}
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border text-xs font-semibold">
            <button
              onClick={() => setTimeRange(7)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeRange === 7 ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setTimeRange(15)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeRange === 15 ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              15D
            </button>
            <button
              onClick={() => setTimeRange(30)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeRange === 30 ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              30D
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-muted/30 border border-border space-y-0.5">
          <span className="text-[10px] text-muted-foreground font-medium">Current Modal Price</span>
          <p className="text-xl font-extrabold text-foreground">
            ₹{stats.lastPrice?.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-muted-foreground">per Quintal</span>
        </div>

        <div className="p-3 rounded-2xl bg-muted/30 border border-border space-y-0.5">
          <span className="text-[10px] text-muted-foreground font-medium">{timeRange}-Day Price Shift</span>
          <p className={`text-xl font-extrabold flex items-center gap-1 ${
            stats.change >= 0 ? 'text-emerald-500' : 'text-rose-500'
          }`}>
            {stats.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {stats.change >= 0 ? `+${stats.change}%` : `${stats.change}%`}
          </p>
          <span className="text-[10px] text-muted-foreground">vs {timeRange} days ago</span>
        </div>

        <div className="p-3 rounded-2xl bg-muted/30 border border-border space-y-0.5">
          <span className="text-[10px] text-muted-foreground font-medium">Period High</span>
          <p className="text-xl font-extrabold text-emerald-600">
            ₹{stats.max?.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-muted-foreground">Peak rate recorded</span>
        </div>

        <div className="p-3 rounded-2xl bg-muted/30 border border-border space-y-0.5">
          <span className="text-[10px] text-muted-foreground font-medium">Period Low</span>
          <p className="text-xl font-extrabold text-muted-foreground">
            ₹{stats.min?.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-muted-foreground">Lowest auction rate</span>
        </div>
      </div>

      {/* Interactive Recharts Graph */}
      <div className="h-[280px] sm:h-[320px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="mandiPriceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.6} />
            
            <XAxis 
              dataKey="date" 
              tickLine={false} 
              axisLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            
            <YAxis 
              tickLine={false} 
              axisLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(val) => `₹${val}`}
              domain={['dataMin - 100', 'dataMax + 100']}
            />

            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload
                  return (
                    <div className="bg-card border border-border rounded-xl p-3 shadow-xl space-y-1 text-xs">
                      <p className="font-semibold text-muted-foreground">{item.fullDate}</p>
                      <p className="text-base font-black text-primary">
                        ₹{item.price?.toLocaleString('en-IN')} <span className="text-[10px] text-muted-foreground font-normal">/ Qtl</span>
                      </p>
                      <p className="text-[11px] text-foreground/80">
                        Daily Arrivals: <strong>{item.arrivals} Quintals</strong>
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />

            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#mandiPriceGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default MandiPriceChart
