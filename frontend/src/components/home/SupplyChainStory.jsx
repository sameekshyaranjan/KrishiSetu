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
  ChevronRight,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import ScrollPop from '@/components/common/ScrollPop'

export const SupplyChainStory = () => {
  const [activeStage, setActiveStage] = useState(0)
  const timerRef = useRef(null)

  const stages = [
    {
      id: 'farm',
      tag: 'STAGE 01 • FARM GATE',
      title: 'Harvest at Farm Gate',
      subtitle: 'Direct Producer Origin & Zero Broker Cut',
      desc: 'Farmers across Kolar, Mandya, and Hassan harvest and grade produce at peak freshness. Lots are listed in 60 seconds with photos, quantity, moisture telemetry, and reserve prices—bypassing local dalal cartels completely.',
      image: '/images/farmer_harvest_hero.jpg',
      alt: 'Karnataka tomato farmer in Kolar holding freshly harvested Grade-A produce',
      badge: '0% Broker Deduction',
      badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      icon: Sprout,
      stat: '100%',
      statLabel: 'Direct Farmer Value',
      location: 'Kolar District · Farm Gate',
      verification: 'Lot #KA-KLR-882 · Photo Audited · Reserve ₹2,100/Qtl',
      ctaText: 'List Farm Harvest',
      ctaLink: '/register/farmer',
    },
    {
      id: 'market',
      tag: 'STAGE 02 • MANDI BENCHMARK',
      title: 'APMC Price Intelligence',
      subtitle: 'Official Agmarknet Karnataka Benchmarks',
      desc: 'Official daily Agmarknet feeds from 140+ Karnataka APMC mandis are synchronized in real-time. Both growers and buyers access transparent modal, min, and max wholesale prices before negotiating a single rupee.',
      image: '/images/apmc_mandi_trading.jpg',
      alt: 'Karnataka APMC wholesale mandi with physical grain sacks and weighing operations',
      badge: '140+ Mandis Synced',
      badgeColor: 'bg-primary/10 text-primary border-primary/30',
      icon: Store,
      stat: '₹2,200',
      statLabel: 'Live Kolar Modal / Qtl',
      location: 'Kolar APMC Market Yard #3',
      verification: 'Agmarknet API Synced · Daily Arrivals 1,420 Qtl',
      ctaText: 'View Mandi Rates',
      ctaLink: '/mandi-prices',
    },
    {
      id: 'buyer',
      tag: 'STAGE 03 • BINDING EXCHANGE',
      title: 'Direct Buyer Partnership',
      subtitle: 'Attributable Bidding & Verified Trade Room',
      desc: 'Licensed APMC traders, institutional food processors, and wholesale aggregators place competitive bids. Parties negotiate delivery terms, packaging specs, and counter-offers in private real-time WebSocket rooms.',
      image: '/images/farmer_trader_partnership.jpg',
      alt: 'Farmer and licensed APMC trader agreeing terms in a warehouse setting',
      badge: 'GST & APMC Verified',
      badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
      icon: Handshake,
      stat: '<50 ms',
      statLabel: 'Socket Counter Latency',
      location: 'Bangalore Wholesale Hub',
      verification: 'Buyer License #KA-BLR-491 · Formal Counter Agreed',
      ctaText: 'Explore Trade Floor',
      ctaLink: '/marketplace',
    },
    {
      id: 'trade',
      tag: 'STAGE 04 • ESCROW & DISPATCH',
      title: 'Logistics & Safe Payout',
      subtitle: 'Pre-Funded Escrow Fulfillment & Direct DBT',
      desc: 'Buyers deposit 100% of the contract value into secure bank escrow before collection trucks dispatch to the farm gate. Upon digital weighbridge slip generation and quality sign-off, funds release instantly to the farmer’s bank account.',
      image: '/images/logistics_produce_truck.jpg',
      alt: 'Commercial produce truck being loaded with crates at farm gate in rural Karnataka',
      badge: 'Escrow Secured',
      badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
      icon: Truck,
      stat: '₹91,200',
      statLabel: 'Escrow Vault Secured',
      location: 'NH-75 Transit Corridor · Kolar',
      verification: 'Vehicle KA-04-E-4812 · Instant DBT on Weighbridge',
      ctaText: 'Buyer Escrow Specs',
      ctaLink: '/register/trader',
    },
  ]

  // Smooth auto-slide interval (5.5 seconds)
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length)
    }, 5500)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [stages.length])

  const restartTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length)
    }, 5500)
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
    <section id="trade-story" className="border-b border-border bg-secondary/30 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            End-to-End Procurement Lifecycle
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            From harvest to handover.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Every material stage is recorded with ground verification—eliminating dalal cartels, arbitrary price deductions, and payment defaults.
          </p>
        </div>

        {/* Main Sliding Showcase Card */}
        <ScrollPop className="relative mt-12 grid grid-cols-1 overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card text-left shadow-xl lg:grid-cols-12">
          
          {/* Left Column: Authentic Photography Showcase (7 cols) */}
          <div className="relative h-80 sm:h-[440px] lg:col-span-7 lg:h-[500px] overflow-hidden bg-slate-950 select-none">
            {stages.map((stage, idx) => {
              const isCurrent = idx === activeStage
              return (
                <div
                  key={stage.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    isCurrent ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                  }`}
                >
                  <img
                    src={stage.image}
                    alt={stage.alt}
                    className={`h-full w-full object-cover object-center transition-transform duration-1000 ease-out ${
                      isCurrent ? 'scale-100' : 'scale-105'
                    }`}
                    loading="eager"
                  />
                  {/* Subtle editorial gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20" />

                  {/* Top-Left: Ground Location Badge */}
                  <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md shadow-md">
                    <MapPin className="size-3.5 text-emerald-400" />
                    <span>{stage.location}</span>
                  </div>

                  {/* Top-Right: Audit Verification Stamp */}
                  <div className="absolute right-4 top-4 hidden sm:flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md shadow-md">
                    <ShieldCheck className="size-3.5 text-primary" />
                    <span>Verified Audit</span>
                  </div>

                  {/* Bottom-Left: Photo Caption Bar */}
                  <div className="absolute bottom-4 left-4 right-24 flex items-center justify-between rounded-xl border border-white/15 bg-black/55 px-3.5 py-2 text-xs text-white backdrop-blur-md">
                    <span className="font-medium truncate">{stage.alt}</span>
                  </div>
                </div>
              )
            })}

            {/* Bottom-Right: Minimalist Professional Navigation Arrows */}
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                aria-label="Previous Stage"
                className="grid size-9 sm:size-8 place-items-center rounded-lg border border-white/20 bg-black/60 text-white backdrop-blur-md transition-all hover:bg-black/90 hover:scale-105 active:scale-95 shadow-md"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Stage"
                className="grid size-9 sm:size-8 place-items-center rounded-lg border border-white/20 bg-black/60 text-white backdrop-blur-md transition-all hover:bg-black/90 hover:scale-105 active:scale-95 shadow-md"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Narrative Context & Telemetry (5 cols) */}
          <div className="flex flex-col justify-between space-y-6 p-6 sm:p-8 lg:col-span-5 lg:p-9 bg-card">
            
            <div className="space-y-4">
              {/* Stage Tag & Status Badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold tracking-wider text-muted-foreground">
                  {current.tag}
                </span>
                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${current.badgeColor}`}>
                  {current.badge}
                </span>
              </div>

              {/* Stage Title and Subtitle */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <CurrentIcon className="size-5" />
                  </div>
                  <h3 className="font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                    {current.title}
                  </h3>
                </div>
                <p className="text-xs font-semibold text-primary pl-11">
                  {current.subtitle}
                </p>
              </div>

              {/* Description */}
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {current.desc}
              </p>
            </div>

            {/* Metric Box & Ground Reality Telemetry */}
            <div className="space-y-4 border-t border-border pt-4">
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4 shadow-2xs">
                <div>
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {current.statLabel}
                  </span>
                  <span className="font-display text-2xl font-bold text-foreground">
                    {current.stat}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center justify-end gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3.5" /> Direct Verification
                  </span>
                  <span className="block text-[10px] text-muted-foreground mt-0.5">
                    {current.verification}
                  </span>
                </div>
              </div>

              {/* Slide Navigation Dots & Action Link */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center gap-2">
                  {stages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectStage(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        activeStage === i
                          ? 'w-8 bg-primary'
                          : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                      aria-label={`Jump to stage ${i + 1}`}
                    />
                  ))}
                </div>

                <Link
                  to={current.ctaLink}
                  className="group inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  <span>{current.ctaText}</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

          </div>

        </ScrollPop>

      </div>
    </section>
  )
}

export default SupplyChainStory
