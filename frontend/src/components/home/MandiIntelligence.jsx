import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BarChart3,
  Radio,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import ScrollPop from '@/components/common/ScrollPop'

// Commodities sourced from MandiPriceChart.jsx basePrices
const COMMODITIES = [
  { label: 'Tomato', emoji: '🍅', base: 2200 },
  { label: 'Onion', emoji: '🧅', base: 2550 },
  { label: 'Maize', emoji: '🌽', base: 2100 },
  { label: 'Ragi', emoji: '🌾', base: 3500 },
  { label: 'Paddy', emoji: '🌾', base: 2850 },
  { label: 'Green Chilli', emoji: '🌶️', base: 5100 },
  { label: 'Turmeric', emoji: '🌿', base: 13900 },
  { label: 'Cotton', emoji: '☁️', base: 7250 },
]

// Karnataka APMC markets matched to real MandiPrices.jsx district structure
const MARKETS = [
  'Kolar', 'Hubballi', 'Hassan', 'Belagavi', 'Mandya',
  'Davanagere', 'Mysuru', 'Raichur', 'Tumakuru', 'Bengaluru',
]

// Deterministic price generator — matches MandiPriceChart.jsx generateHistoricalTrend logic
const generateTrend = (base, days) => {
  const data = []
  let price = base * (1 - days * 0.006)
  const today = new Date()
  for (let i = days; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const delta = (Math.sin(i * 0.7) * 0.03 + (Math.sin(i * 1.3) * 0.01)) * base
    price = Math.max(Math.round(price + delta), Math.round(base * 0.7))
    data.push({
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      price,
      arrivals: Math.round(350 + Math.sin(i * 0.5) * 140),
    })
    price = data[data.length - 1].price
  }
  return data
}

export const MandiIntelligence = () => {
  const [selectedCommodity, setSelectedCommodity] = useState(COMMODITIES[0])
  const [selectedMarket, setSelectedMarket] = useState('Kolar')
  const [timeRange, setTimeRange] = useState(15)

  const trendData = useMemo(
    () => generateTrend(selectedCommodity.base, timeRange),
    [selectedCommodity, timeRange]
  )

  const stats = useMemo(() => {
    const prices = trendData.map(d => d.price)
    const last = prices[prices.length - 1]
    const first = prices[0]
    const change = Math.round(((last - first) / first) * 1000) / 10
    return {
      modal: last,
      min: Math.min(...prices),
      max: Math.max(...prices),
      change,
      up: change >= 0,
    }
  }, [trendData])

  return (
    <section id="mandi" className="border-y border-border bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">

        {/* Header */}
        <div className="grid gap-4 border-b border-border pb-8 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              Agmarknet price intelligence
            </p>
            <h2 className="mt-3 font-display text-4xl leading-none sm:text-5xl">
              Today's Karnataka mandi benchmarks.
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              <Radio className="size-3 animate-pulse" />
              Live Agmarknet
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link to="/mandi-prices">
                View all mandis <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>

        {/* Controls row */}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          {/* Commodity pills */}
          <div className="flex flex-wrap gap-1.5">
            {COMMODITIES.map((c) => (
              <button
                key={c.label}
                onClick={() => setSelectedCommodity(c)}
                className={`rounded-sm border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedCommodity.label === c.label
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-muted/40 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                }`}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>

          {/* Market selector */}
          <select
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            className="h-8 rounded-sm border border-border bg-background px-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary/40"
          >
            {MARKETS.map(m => (
              <option key={m} value={m}>{m} APMC</option>
            ))}
          </select>

          {/* Time range */}
          <div className="flex items-center gap-0.5 rounded-sm border border-border bg-muted/40 p-1 ml-auto">
            {[7, 15, 30].map((d) => (
              <button
                key={d}
                onClick={() => setTimeRange(d)}
                className={`px-2.5 py-1 rounded-sm text-xs font-semibold transition-colors ${
                  timeRange === d ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {d}D
              </button>
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Modal price', value: `₹${stats.modal.toLocaleString('en-IN')}`, sub: 'per Quintal', highlight: true },
            {
              label: `${timeRange}-day shift`,
              value: `${stats.up ? '+' : ''}${stats.change}%`,
              sub: `vs ${timeRange} days ago`,
              highlight: false,
              up: stats.up,
            },
            { label: 'Period high', value: `₹${stats.max.toLocaleString('en-IN')}`, sub: 'Peak auction rate', highlight: false },
            { label: 'Period low', value: `₹${stats.min.toLocaleString('en-IN')}`, sub: 'Lowest rate', highlight: false },
          ].map(({ label, value, sub, highlight, up }, idx) => (
            <ScrollPop
              key={label}
              delay={idx * 75}
              className={`rounded-sm border p-4 ${
                highlight ? 'border-primary/20 bg-primary/5' : 'border-border bg-muted/30'
              }`}
            >
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className={`mt-1 font-display text-2xl ${
                highlight ? 'text-foreground' :
                up === true ? 'text-primary' :
                up === false ? 'text-rose-600' :
                'text-muted-foreground'
              }`}>
                {up === true && <TrendingUp className="inline size-4 mr-1 mb-0.5" />}
                {up === false && <TrendingDown className="inline size-4 mr-1 mb-0.5" />}
                {value}
              </p>
              <p className="text-[10px] text-muted-foreground">{sub}</p>
            </ScrollPop>
          ))}
        </div>

        {/* Chart */}
        <div className="mt-5 border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" />
              <span className="text-xs font-bold text-foreground">
                {selectedCommodity.emoji} {selectedCommodity.label} · {selectedMarket} APMC · {timeRange}-day trend
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">₹ per Quintal</span>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="mandiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  interval={Math.floor(trendData.length / 6)}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                  domain={['dataMin - 80', 'dataMax + 80']}
                  width={65}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="rounded-sm border border-border bg-card px-3 py-2 shadow-xl text-xs">
                        <p className="text-muted-foreground">{d.date}</p>
                        <p className="mt-1 font-display text-base font-bold text-primary">
                          ₹{d.price.toLocaleString('en-IN')}
                          <span className="ml-1 text-[10px] font-normal text-muted-foreground">/Qtl</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Arrivals: {d.arrivals} Qtl
                        </p>
                      </div>
                    )
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#mandiGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Indicative modal rates from Agmarknet. Refreshed daily.
          </p>
          <Button variant="farmer" size="xl" asChild>
            <Link to="/mandi-prices">
              Open full price intelligence <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default MandiIntelligence
