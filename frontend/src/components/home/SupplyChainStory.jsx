import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  Sprout, 
  Store, 
  Handshake, 
  Truck, 
  ArrowRight, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react'

export const SupplyChainStory = () => {
  const [activeStage, setActiveStage] = useState(0)
  const timerRef = useRef(null)

  const stages = [
    {
      id: 'farm',
      tag: 'STAGE 01 • FARM',
      title: 'Harvest at Farm Gate',
      subtitle: 'Direct Producer Origin',
      desc: 'Farmers across Kolar, Mandya, and Hassan harvest and grade produce at peak freshness. Lots are listed in 60 seconds with photos, quantity, and fair reserve prices—bypassing local dalal cartels.',
      image: '/images/farmer_harvest_hero.jpg',
      alt: 'Indian farmer in Karnataka tomato field holding fresh harvest',
      badge: '0% Broker Deduction',
      badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
      icon: Sprout,
      stat: '100%',
      statLabel: 'Direct Farmer Value'
    },
    {
      id: 'market',
      tag: 'STAGE 02 • MARKET',
      title: 'APMC Price Intelligence',
      subtitle: 'Transparent Price Benchmark',
      desc: 'Official daily Agmarknet feeds from 140+ Karnataka APMC mandis are synchronized in real-time. Farmers and traders access verified modal, min, and max wholesale prices before negotiating.',
      image: '/images/apmc_mandi_trading.jpg',
      alt: 'Authentic Karnataka APMC market yard with grain sacks and weighing scales',
      badge: '140+ APMC Mandis Synced',
      badgeColor: 'bg-primary/10 text-primary border-primary/20',
      icon: Store,
      stat: 'Live',
      statLabel: 'Agmarknet Data Feeds'
    },
    {
      id: 'buyer',
      tag: 'STAGE 03 • BUYER',
      title: 'Direct Buyer Partnership',
      subtitle: 'Transparent Bidding & Trust',
      desc: 'Licensed APMC buyers, food processors, and wholesale aggregators place competitive bids. Both parties negotiate delivery schedules, packaging, and counter-offers in private real-time rooms.',
      image: '/images/farmer_trader_partnership.jpg',
      alt: 'Farmer and wholesale trader shaking hands over grain trays in warehouse',
      badge: 'GST & APMC Verified',
      badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
      icon: Handshake,
      stat: 'sub-50ms',
      statLabel: 'Socket Negotiation'
    },
    {
      id: 'trade',
      tag: 'STAGE 04 • TRADE',
      title: 'Logistics & Safe Payout',
      subtitle: 'Pre-Funded Escrow Fulfillment',
      desc: 'Buyers deposit 100% of the trade value into secure escrow before collection trucks dispatch to the farm gate. Upon physical weight and quality verification, funds release directly to bank accounts.',
      image: '/images/logistics_produce_truck.jpg',
      alt: 'Commercial produce truck being loaded with tomato crates in rural Karnataka',
      badge: 'Escrow Secured',
      badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
      icon: Truck,
      stat: '₹0 Default',
      statLabel: 'Escrow Protected'
    }
  ]

  // Smooth auto-slide interval (5 seconds)
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length)
    }, 5000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [stages.length])

  const restartTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length)
    }, 5000)
  }

  const handlePrev = (e) => {
    e?.stopPropagation()
    restartTimer()
    setActiveStage((prev) => (prev === 0 ? stages.length - 1 : prev - 1))
  }

  const handleNext = (e) => {
    e?.stopPropagation()
    restartTimer()
    setActiveStage((prev) => (prev + 1) % stages.length)
  }

  const handleSelectStage = (idx) => {
    restartTimer()
    setActiveStage(idx)
  }

  const current = stages[activeStage]
  const CurrentIcon = current.icon

  return (
    <div className="w-full max-w-5xl mx-auto mt-10 sm:mt-12 transition-all duration-300">
      
      {/* Main Sliding Showcase Card */}
      <div className="bg-card rounded-2xl sm:rounded-3xl border border-border overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 relative text-left">
        
        {/* Left Column: Authentic Photography Showcase (7 cols) */}
        <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-[460px] overflow-hidden bg-slate-950 select-none">
          {stages.map((stage, idx) => (
            <div
              key={stage.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === activeStage ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
              }`}
            >
              <img
                src={stage.image}
                alt={stage.alt}
                className="w-full h-full object-cover object-center"
                loading="eager"
              />
              {/* Natural editorial shadow gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"></div>
              
              {/* Photo Caption */}
              <div className="absolute bottom-4 left-4 right-24 flex items-center justify-between text-white text-xs backdrop-blur-md bg-black/45 px-3.5 py-2 rounded-xl border border-white/15">
                <span className="font-medium truncate">{stage.alt}</span>
              </div>
            </div>
          ))}

          {/* Minimalist Professional Slide Arrows (Right edge overlay) */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              aria-label="Previous Slide"
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Slide"
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Narrative Context & Real-Time Data (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-7 lg:p-8 flex flex-col justify-between space-y-6 bg-card">
          
          <div className="space-y-4">
            {/* Stage Tag & Status Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-wider text-muted-foreground">
                {current.tag}
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${current.badgeColor}`}>
                {current.badge}
              </span>
            </div>

            {/* Stage Title and Subtitle */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <CurrentIcon className="w-4 h-4" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                  {current.title}
                </h3>
              </div>
              <p className="text-xs font-semibold text-primary pl-10">
                {current.subtitle}
              </p>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {current.desc}
            </p>
          </div>

          {/* Metric Box & Minimalist Navigation Indicators */}
          <div className="pt-4 border-t border-border space-y-4">
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                  {current.statLabel}
                </span>
                <span className="text-xl font-mono font-black text-foreground">
                  {current.stat}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Direct Verification
                </span>
                <span className="text-[10px] text-muted-foreground">Karnataka Ground Reality</span>
              </div>
            </div>

            {/* Slide Navigation Dots & Learn More Link */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-2">
                {stages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectStage(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeStage === i ? 'w-8 bg-emerald-600' : 'w-2 bg-muted-foreground/25 hover:bg-muted-foreground/45'
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>

              <Link 
                to={activeStage === 0 ? "/register/farmer" : activeStage === 1 ? "/mandi-prices" : activeStage === 2 ? "/marketplace" : "/register/trader"}
                className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 group"
              >
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}

export default SupplyChainStory
