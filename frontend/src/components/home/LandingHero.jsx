import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Sprout,
  Users,
  BarChart3,
  ArrowUpRight,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import marketImage from '@/assets/krishisetu-market.jpg'

// Mandi ticker data — UI demo values derived from actual MandiPrices data structure
// (commodity, market, modalPrice per Quintal, dayChange%)
const TICKER_RATES = [
  { crop: 'Tomato', market: 'Kolar APMC', price: '₹2,200', change: '+14.2%', up: true },
  { crop: 'Onion', market: 'Hubballi APMC', price: '₹1,850', change: '+2.8%', up: true },
  { crop: 'Potato', market: 'Hassan APMC', price: '₹1,600', change: '+1.4%', up: true },
  { crop: 'Green Chilli', market: 'Belagavi APMC', price: '₹3,400', change: '+6.1%', up: true },
  { crop: 'Ragi', market: 'Davanagere APMC', price: '₹3,520', change: '-1.2%', up: false },
  { crop: 'Maize', market: 'Mandya APMC', price: '₹2,080', change: '+3.5%', up: true },
  { crop: 'Paddy', market: 'Raichur APMC', price: '₹2,750', change: '+0.8%', up: true },
  { crop: 'Groundnut', market: 'Kalaburagi APMC', price: '₹5,900', change: '+2.1%', up: true },
]

export const LandingHero = () => {
  const [persona, setPersona] = useState('farmer') // 'farmer' | 'trader'

  return (
    <>
      {/* ── Mandi Ticker ── */}
      <div
        className="overflow-hidden border-b border-primary/15 bg-market text-market-foreground"
        aria-label="Live Karnataka APMC mandi rates"
      >
        <div className="ticker-track flex py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em]">
          {[...TICKER_RATES, ...TICKER_RATES].map((rate, i) => (
            <span
              key={`${rate.market}-${i}`}
              className="flex items-center gap-3 border-r border-primary/20 px-6 shrink-0"
            >
              <span className="font-bold text-market-foreground">{rate.crop}</span>
              <span className="text-market-foreground/70">· {rate.market}</span>
              <strong className="text-foreground">{rate.price}/Qtl</strong>
              <span className={rate.up ? 'text-primary font-bold' : 'text-rose-600 font-bold'}>
                {rate.change}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <section
        id="hero"
        className="relative min-h-[720px] overflow-hidden bg-surface-strong text-surface-strong-foreground lg:min-h-[780px]"
      >
        {/* Background photograph */}
        <img
          src={marketImage}
          alt="Karnataka tomato farmer at an APMC wholesale market"
          width={1536}
          height={1024}
          className="absolute inset-0 h-full w-full object-cover object-[68%_center]"
          loading="eager"
        />

        {/* Directional overlay — left side dark for text, right lets photo breathe */}
        <div className="hero-shade absolute inset-0" />

        {/* Content grid */}
        <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-8 px-5 py-16 lg:min-h-[780px] lg:grid-cols-[1.15fr_0.85fr] lg:px-8">

          {/* LEFT — editorial headline + CTAs */}
          <div className="max-w-2xl self-center">
            {/* Eyebrow */}
            <div className="mb-7 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground/70">
              <span className="h-px w-8 bg-trader shrink-0" />
              Karnataka's Direct Agricultural Exchange
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl font-medium leading-[0.95] sm:text-6xl lg:text-[4.5rem]">
              The Direct Exchange<br />
              <span className="text-trader">for Indian Agriculture.</span>
            </h1>

            {/* Sub-copy */}
            <p className="mt-6 max-w-lg text-base leading-7 text-primary-foreground/75 sm:text-lg">
              0% broker fees. Licensed APMC buyers. Live Agmarknet price intelligence.
              One transparent market from harvest to bank transfer.
            </p>

            {/* CTA row */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="farmer"
                size="xl"
                asChild
                onClick={() => setPersona('farmer')}
              >
                <Link to="/register/farmer">
                  Sell Harvest
                  <span className="ml-1 opacity-65 text-[12px]">Farmer / ಕೃಷಿಕ</span>
                  <ArrowRight className="ml-1" />
                </Link>
              </Button>
              <Button
                variant="trader"
                size="xl"
                asChild
                onClick={() => setPersona('trader')}
              >
                <Link to="/register/trader">
                  Procure Produce
                  <span className="ml-1 opacity-65 text-[12px]">Trader / ವ್ಯಾಪಾರಿ</span>
                  <ArrowRight className="ml-1" />
                </Link>
              </Button>
            </div>

            {/* Trust line */}
            <div className="mt-7 flex flex-wrap items-center gap-5 text-[11px] font-semibold text-primary-foreground/60">
              <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-trader" />Pre-funded escrow</span>
              <span className="flex items-center gap-1.5"><BarChart3 className="size-3.5 text-trader" />Agmarknet benchmarks</span>
              <span className="flex items-center gap-1.5"><Zap className="size-3.5 text-trader" />Real-time bidding</span>
            </div>
          </div>

          {/* RIGHT — live lot card (desktop only) */}
          <div className="mb-24 hidden w-full max-w-xs self-end justify-self-end lg:block">
            <div className="border border-primary-foreground/20 bg-background/96 text-foreground shadow-2xl backdrop-blur-sm">
              {/* Card header */}
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-primary">
                  <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                  Live Lot · Demo
                </span>
                <span className="text-[9px] font-mono font-semibold text-muted-foreground">
                  LOT-KA-KLR-882
                </span>
              </div>

              {/* Lot details */}
              <div className="px-5 pt-4 pb-3">
                <h2 className="font-display text-2xl font-medium">Hybrid Tomatoes</h2>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Kolar APMC · Grade A · 40 Quintals
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 border-y border-border py-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Agmarknet modal</p>
                    <p className="mt-1 font-display text-xl">₹2,200</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Current bid</p>
                    <p className="mt-1 font-display text-xl text-primary">₹2,240</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">12 verified bids</span>
                  <strong className="flex items-center gap-1 text-xs text-primary">
                    <TrendingUp className="size-3.5" /> +14.2%
                  </strong>
                </div>
              </div>

              {/* Persona tabs */}
              <div className="grid grid-cols-2 gap-1 border-t border-border p-2">
                <button
                  className={`py-2 text-[11px] font-semibold rounded-sm transition-colors ${
                    persona === 'farmer'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                  onClick={() => setPersona('farmer')}
                >
                  <Sprout className="inline size-3.5 mr-1" />Farmer
                </button>
                <button
                  className={`py-2 text-[11px] font-semibold rounded-sm transition-colors ${
                    persona === 'trader'
                      ? 'bg-trader text-trader-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                  onClick={() => setPersona('trader')}
                >
                  <Users className="inline size-3.5 mr-1" />Trader
                </button>
              </div>
            </div>

            {/* Underneath card — quick link */}
            <div className="mt-3 px-1">
              <Link
                to={persona === 'farmer' ? '/register/farmer' : '/register/trader'}
                className="flex items-center justify-end gap-1 text-[11px] font-semibold text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                {persona === 'farmer' ? 'Start listing your harvest' : 'Browse available lots'}
                <ArrowUpRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-primary-foreground/15 bg-surface-strong/85 backdrop-blur-sm">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-primary-foreground/10 px-5 lg:grid-cols-4 lg:px-8">
            {[
              ['0%', 'Broker fee'],
              ['100%', 'Pre-funded escrow'],
              ['140+', 'APMC mandis synced'],
              ['31', 'Karnataka districts'],
            ].map(([value, label]) => (
              <div key={label} className="px-4 py-4 first:pl-0 lg:py-5">
                <strong className="font-display text-2xl">{value}</strong>
                <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-foreground/55">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default LandingHero
