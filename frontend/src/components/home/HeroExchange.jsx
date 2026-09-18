import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Sprout, 
  Briefcase, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  SlidersHorizontal,
  Sparkles,
  Zap,
  Lock,
  ChevronRight
} from 'lucide-react'
import { ScrollReveal } from '@/components/common/ScrollReveal'

export const HeroExchange = () => {
  const [bidAccepted, setBidAccepted] = useState(false)
  const [counterValue, setCounterValue] = useState(2260)
  const [showCounter, setShowCounter] = useState(false)
  const lotQuintals = 40
  const leadingBid = 2240
  const modalBenchmark = 2200

  return (
    <section className="relative pt-6 sm:pt-10 pb-12 sm:pb-20 overflow-hidden">
      {/* Subtle architectural background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Institutional Eyebrow */}
        <ScrollReveal variant="fade-up" duration={450} className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-mono font-medium tracking-tight">KARNATAKA APMC DIRECT EXCHANGE</span>
            <span className="text-border dark:text-emerald-800/80">•</span>
            <span className="font-medium text-emerald-700 dark:text-emerald-300">0% Commission Settlement</span>
          </div>
        </ScrollReveal>

        {/* Asymmetric 2-Column Grid: Editorial Story (7 cols) + Live Trade Floor Ticket (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Authoritative Editorial Presentation */}
          <ScrollReveal variant="fade-up" delay={50} duration={600} className="lg:col-span-7 space-y-6 sm:space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
              The Direct Trading Floor for{' '}
              <span className="text-emerald-700 dark:text-emerald-400 underline decoration-emerald-500/30 decoration-wavy decoration-2">
                Indian Agriculture
              </span>.
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl font-normal leading-relaxed">
              Connect Karnataka farm-gate harvest lots directly with licensed APMC wholesale buyers. 
              Real-time Agmarknet modal benchmarks, zero middleman deductions, and 100% bank-backed escrow before trucks leave the farm.
            </p>

            {/* Dual Persona Strategic Action Group */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 max-w-xl">
                {/* Farmer Primary CTA */}
                <Link
                  to="/register/farmer"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-base shadow-sm hover:shadow transition-all group"
                >
                  <Sprout className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition-transform" />
                  <span>Sell Harvest <span lang="kn" className="text-xs font-normal opacity-90 ml-1">(ಕೃಷಿಕ)</span></span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                {/* Trader Commercial CTA */}
                <Link
                  to="/register/trader"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-base shadow-sm hover:shadow transition-all group"
                >
                  <Briefcase className="w-5 h-5 text-slate-900 group-hover:scale-110 transition-transform" />
                  <span>Procure Produce <span lang="kn" className="text-xs font-normal opacity-90 ml-1">(ವ್ಯಾಪಾರಿ)</span></span>
                </Link>
              </div>

              {/* Auxiliary Trust & Navigation Links */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs text-muted-foreground font-medium">
                <Link 
                  to="/mandi-prices" 
                  className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>140+ Karnataka APMC Mandi Feeds</span>
                  <ChevronRight className="w-3 h-3 ml-0.5 opacity-60" />
                </Link>
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>APMC & GST Verified Buyers Only</span>
                </span>
              </div>
            </div>

            {/* Editorial Supply-Chain Photo Anchor */}
            <div className="pt-4">
              <div className="relative rounded-2xl overflow-hidden border border-border/80 shadow-md bg-muted/30 group">
                <img 
                  src="/images/farmer_harvest_hero.jpg" 
                  alt="Karnataka farmer harvesting fresh produce at farm gate" 
                  className="w-full h-48 sm:h-56 object-cover object-center group-hover:scale-[1.02] transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end p-5 sm:p-6">
                  <div className="text-white space-y-1">
                    <span className="text-[11px] font-mono tracking-wider text-emerald-400 font-bold uppercase">
                      PRODUCER ORIGIN • KOLAR DISTRICT, KARNATAKA
                    </span>
                    <p className="text-sm sm:text-base font-medium text-slate-100 max-w-lg">
                      "Listed 40 quintals at 7:00 AM from the field. Three licensed buyers bid against Kolar APMC modal rates before noon with ₹0 broker cut."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right Column: Realistic KrishiSetu Live Trading Ticket (5 cols) */}
          <ScrollReveal variant="fade-up" delay={150} duration={600} className="lg:col-span-5">
            <div className="bg-card rounded-2xl border border-border/90 shadow-xl overflow-hidden">
              
              {/* Terminal Header */}
              <div className="bg-muted/60 px-4 py-3 border-b border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground font-semibold pl-1.5">
                    EXCHANGE FLOOR • LOT #KA-KLR-882
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE AUCTION
                </span>
              </div>

              {/* Ticket Body */}
              <div className="p-5 sm:p-6 space-y-5">
                
                {/* Produce & Origin Header */}
                <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase font-bold tracking-wider">
                      Grade-A Certified Produce
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">
                      Hybrid Tomato (ಹೈಬ್ರಿಡ್ ಟೊಮ್ಯಾಟೊ)
                    </h2>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <span>Farm Gate: Hosakote Taluk, Kolar</span>
                      <span>•</span>
                      <span className="font-semibold text-foreground">{lotQuintals} Quintals (1,600 Crates)</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-mono text-muted-foreground block">Mandi Benchmark</span>
                    <span className="font-mono text-sm font-bold text-muted-foreground line-through">
                      ₹{modalBenchmark}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">/Qtl (Modal)</span>
                  </div>
                </div>

                {/* Live Benchmark vs Highest Bid Callout */}
                <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" /> Leading APMC Bid
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      +₹40 above Mandi Modal
                    </span>
                  </div>
                  
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-extrabold font-mono text-foreground tracking-tight">
                        ₹{leadingBid}
                      </span>
                      <span className="text-xs text-muted-foreground font-semibold ml-1">/Quintal</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block">Total Trade Value</span>
                      <span className="text-base font-extrabold font-mono text-foreground">
                        ₹{(leadingBid * lotQuintals).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-primary" /> Bengaluru Fresh Retails Pvt Ltd
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">APMC #BLR-491</span>
                  </div>
                </div>

                {/* Dynamic Interactive Action Buttons */}
                <div className="space-y-3 pt-1">
                  {!bidAccepted ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setBidAccepted(true)}
                        className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept ₹{leadingBid}/Qtl</span>
                      </button>

                      <button
                        onClick={() => setShowCounter(!showCounter)}
                        className="w-full py-3 px-4 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                        <span>{showCounter ? 'Hide Counter' : 'Counter Offer'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-500/40 text-center space-y-1 animate-in fade-in">
                      <div className="flex items-center justify-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Trade Accepted & Locked in Escrow!</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Buyer notified to fund ₹{(leadingBid * lotQuintals).toLocaleString('en-IN')} to Karnataka APMC Escrow before truck collection.
                      </p>
                      <button 
                        onClick={() => setBidAccepted(false)}
                        className="text-[10px] text-primary underline mt-1 block mx-auto font-medium"
                      >
                        Reset Demo
                      </button>
                    </div>
                  )}

                  {/* Real-time Interactive Counter-Offer Slider Simulator */}
                  {showCounter && !bidAccepted && (
                    <div className="p-3.5 rounded-xl bg-muted/50 border border-border space-y-2.5 animate-in fade-in">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-medium">Your Counter Price:</span>
                        <span className="font-mono font-bold text-foreground">₹{counterValue}/Qtl</span>
                      </div>
                      <input 
                        type="range" 
                        min="2200" 
                        max="2400" 
                        step="10"
                        value={counterValue}
                        onChange={(e) => setCounterValue(Number(e.target.value))}
                        className="w-full accent-primary h-1.5 bg-muted rounded cursor-pointer"
                      />
                      <div className="flex justify-between items-center text-[11px] pt-1">
                        <span className="text-muted-foreground">Revised Total: ₹{(counterValue * lotQuintals).toLocaleString('en-IN')}</span>
                        <button 
                          onClick={() => {
                            alert(`Counter offer of ₹${counterValue}/Qtl sent to bidder via real-time WebSocket room.`)
                            setShowCounter(false)
                          }}
                          className="px-3 py-1 rounded-lg bg-primary text-primary-foreground font-semibold text-[10px]"
                        >
                          Submit Counter
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Escrow Guarantee Footer Strip */}
                <div className="pt-3 border-t border-border/70 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    100% Pre-funded Escrow
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹0 Middleman Cut</span>
                </div>

              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  )
}

export default HeroExchange
