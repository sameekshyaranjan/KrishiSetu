import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Building2, 
  Clock, 
  ArrowRight,
  MessageSquare,
  Sparkles,
  Lock
} from 'lucide-react'

import { ScrollReveal } from '@/components/common/ScrollReveal'

export const ProductPreview = () => {
  const [bidAccepted, setBidAccepted] = useState(false)
  const [counterOpen, setCounterOpen] = useState(false)
  const [counterPrice, setCounterPrice] = useState(2190)

  return (
    <ScrollReveal variant="scale-up" duration={650} className="w-full max-w-5xl mx-auto">
      {/* Outer Application Frame */}
      <div className="bg-card rounded-2xl sm:rounded-3xl border border-border/90 shadow-2xl overflow-hidden backdrop-blur-sm">
        
        {/* Browser / Application Chrome Bar */}
        <div className="bg-muted/60 px-4 py-3 border-b border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            </div>
            <span className="text-muted-foreground hidden sm:inline-block pl-2 text-[11px] font-mono">
              krishisetu.in/app/live-trading-floor
            </span>
          </div>

          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Session Active • APMC Encrypted</span>
          </div>
        </div>

        {/* Interior Live Product Console (2 Columns) */}
        <div className="p-5 sm:p-7 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 bg-card">
          
          {/* Left Column: Live Mandi Modal Rate Monitor (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                    Agmarknet Feed
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">Updated 3m ago</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground mt-1">
                  Kolar APMC • Live Commodity Benchmark
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground block">Modal Price</span>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-mono">
                    ₹2,200
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">/Qtl</span>
                </div>
              </div>
            </div>

            {/* Price Movement Pill & Sparkline */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <TrendingUp className="w-4 h-4" />
                  <span>+14.2% vs 7-day Avg</span>
                </div>
                <span className="text-muted-foreground font-mono text-[11px]">7-Day Trend (₹/Quintal)</span>
              </div>

              {/* Responsive SVG Sparkline Chart */}
              <div className="h-24 w-full relative">
                <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="mandiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16a34a" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#16a34a" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Area Fill */}
                  <path
                    d="M 0,85 L 65,78 L 130,82 L 200,60 L 270,48 L 335,32 L 400,15 L 400,100 L 0,100 Z"
                    fill="url(#mandiGradient)"
                  />
                  {/* Line */}
                  <path
                    d="M 0,85 L 65,78 L 130,82 L 200,60 L 270,48 L 335,32 L 400,15"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Highlight Points */}
                  <circle cx="200" cy="60" r="3.5" fill="#16a34a" />
                  <circle cx="400" cy="15" r="5" fill="#15803d" stroke="#ffffff" strokeWidth="2" />
                </svg>
              </div>

              <div className="flex justify-between text-[10px] text-muted-foreground font-mono pt-1">
                <span>Day 1 (₹1,925)</span>
                <span>Day 3 (₹2,010)</span>
                <span>Day 5 (₹2,110)</span>
                <span className="font-bold text-foreground">Today (₹2,200)</span>
              </div>
            </div>

            {/* Active Lot Preview Card */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-card border border-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img 
                  src="/images/farmer_harvest_hero.jpg" 
                  alt="Tomato Harvest Lot" 
                  className="w-12 h-12 rounded-xl object-cover border border-border shrink-0" 
                />
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-foreground truncate">40 Qtl • Hybrid Grade-A Tomato</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                      Ready for Dispatch
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 truncate">
                    <span>Farmer: Ramesh Patel, Hosakote</span>
                    <span>•</span>
                    <span>Reserve: ₹2,100/Qtl</span>
                  </p>
                </div>
              </div>
              <Link 
                to="/mandi-prices" 
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Analytics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Real-Time Bid Negotiation Tray (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 rounded-2xl bg-muted/30 border border-border p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Incoming Trader Offer</h4>
                  <p className="text-[10px] text-muted-foreground">Socket.io Room #TRD-8821</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
                <Clock className="w-3 h-3" /> 48h Validity
              </span>
            </div>

            {/* Buyer Details */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-foreground">Bengaluru Fresh Foods Ltd.</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-[11px] text-muted-foreground">APMC License: #KA-BLR-491 • GST Verified</span>
              </div>

              {/* Offer Financial Box */}
              <div className="p-3.5 rounded-xl bg-card border border-border space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-muted-foreground">Offered Bid Price:</span>
                  <div className="text-right">
                    <span className="text-xl font-black text-foreground font-mono">₹2,180</span>
                    <span className="text-xs text-muted-foreground font-medium"> /Qtl</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-border/60">
                  <span>Gross Lot Value (40 Qtl):</span>
                  <span className="font-bold text-foreground font-mono">₹87,200</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Escrow Deposit:
                  </span>
                  <span>100% Pre-funded</span>
                </div>
              </div>

              {/* Micro Chat Snippet */}
              <div className="p-2.5 rounded-lg bg-card/80 border border-border text-[11px] space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground text-[10px]">
                  <MessageSquare className="w-3 h-3 text-primary" />
                  <span className="font-medium">Direct Live Negotiation</span>
                </div>
                <p className="text-foreground italic">
                  &ldquo;Buyer: Can pick up via refrigerated canter Wednesday 7:00 AM at farm gate.&rdquo;
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              {bidAccepted ? (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Bid Accepted! Trade Contract Generated</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBidAccepted(true)}
                    className="flex-1 py-2.5 px-3 min-h-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Bid <span lang="kn" className="font-normal opacity-90">(ಸ್ವೀಕರಿಸಿ)</span></span>
                  </button>

                  <button
                    onClick={() => setCounterOpen(!counterOpen)}
                    className="py-2.5 px-3 min-h-[44px] rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-bold transition-all flex items-center justify-center"
                  >
                    Counter Offer
                  </button>
                </div>
              )}

              {/* Interactive Counter Offer Drawer */}
              {counterOpen && !bidAccepted && (
                <div className="p-3 rounded-xl bg-card border border-primary/30 space-y-2 animate-in fade-in text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Propose Counter Rate:</span>
                    <span className="font-mono font-bold text-primary">₹{counterPrice}/Qtl</span>
                  </div>
                  <input
                    type="range"
                    min="2150"
                    max="2250"
                    step="5"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(Number(e.target.value))}
                    className="w-full accent-primary h-1.5 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                    <span>₹2,150</span>
                    <span>₹2,250</span>
                  </div>
                  <button
                    onClick={() => {
                      setCounterOpen(false)
                      alert(`Counter offer of ₹${counterPrice}/Qtl sent to Bengaluru Fresh Foods via WebSocket!`)
                    }}
                    className="w-full py-1.5 bg-primary text-primary-foreground font-bold rounded-lg text-xs"
                  >
                    Send Counter via Socket.io
                  </button>
                </div>
              )}

              {/* Status Chip */}
              <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground pt-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Sub-50ms Socket Sync • 0% Commission Cut</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </ScrollReveal>
  )
}

export default ProductPreview
