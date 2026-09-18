import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  IndianRupee,
  LockKeyhole,
  Menu,
  Scale,
  ShieldCheck,
  Sprout,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import marketImage from '@/assets/krishisetu-market.jpg'
import SupplyChainStory from '@/components/home/SupplyChainStory'
import LiveTradeFloor from '@/components/home/LiveTradeFloor'
import NegotiationChat from '@/components/home/NegotiationChat'
import MandiIntelligence from '@/components/home/MandiIntelligence'
import SchemeExplorer from '@/components/home/SchemeExplorer'
import ColdStorageExplorer from '@/components/home/ColdStorageExplorer'
import WeatherPreview from '@/components/home/WeatherPreview'
import FarmerLedger from '@/components/home/FarmerLedger'
import ScrollSection from '@/components/common/ScrollSection'
import AnimatedCounter from '@/components/common/AnimatedCounter'
import ScrollPop from '@/components/common/ScrollPop'

const rates = [
  ['Tomato', 'Kolar', '₹2,200', '+14.2%'],
  ['Onion', 'Hubballi', '₹1,850', '+2.8%'],
  ['Potato', 'Hassan', '₹1,600', '+1.4%'],
  ['Green Chilli', 'Belagavi', '₹3,400', '+6.1%'],
  ['Ragi', 'Davanagere', '₹3,520', '−1.2%'],
  ['Maize', 'Mandya', '₹2,080', '+3.5%'],
  ['Paddy', 'Raichur', '₹2,750', '+0.8%'],
  ['Groundnut', 'Kalaburagi', '₹5,900', '+2.1%'],
]

export const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [heroOfferMode, setHeroOfferMode] = useState('accept')
  const [heroCounter, setHeroCounter] = useState(2280)
  const [heroStatus, setHeroStatus] = useState('Awaiting farmer action')
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const actOnHeroBid = () => {
    if (heroOfferMode === 'accept') {
      setHeroStatus('Top bid accepted · escrow release pending')
      return
    }
    setHeroStatus(`Counter ₹${heroCounter.toLocaleString('en-IN')}/Qtl dispatched via WebSocket!`)
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* ── Top Hairline Scroll Progress Bar ── */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-primary/15 pointer-events-none">
        <div
          className="h-full bg-primary transition-all duration-75 ease-out shadow-xs"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ── 1. EXACT SOLID NAVBAR (PRESERVED & UNCHANGED) ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background shadow-xs">
        <div className="mx-auto grid h-18 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center px-5 lg:grid-cols-[auto_1fr_auto] lg:px-8">
          <Link 
            to="/" 
            className="flex min-w-0 items-center gap-3" 
            aria-label="KrishiSetu home"
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-primary text-primary-foreground">
              <Sprout className="size-5" />
            </span>
            <span className="min-w-0">
              <strong className="block truncate font-display text-2xl leading-none">KrishiSetu</strong>
              <span className="mt-1 block truncate text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Karnataka Agri Exchange
              </span>
            </span>
          </Link>

          {/* Canonical Center Links */}
          <nav className="hidden justify-center gap-7 text-[11px] font-bold uppercase tracking-[0.13em] lg:flex" aria-label="Main navigation">
            <Link 
              to="/" 
              className="py-2 transition-colors hover:text-primary"
              onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
            >
              Home
            </Link>
            <Link to="/mandi-prices" className="py-2 transition-colors hover:text-primary">Mandi Prices</Link>
            <Link to="/schemes" className="py-2 transition-colors hover:text-primary">Govt Schemes</Link>
            <Link to="/cold-storage" className="py-2 transition-colors hover:text-primary">Cold Storage</Link>
          </nav>

          {/* Canonical Auth CTAs */}
          <div className="hidden items-center gap-2 lg:flex">
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button variant="farmer" size="sm" asChild>
              <Link to="/register">Register</Link>
            </Button>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Navigation Sheet */}
        {menuOpen && (
          <nav className="grid border-t border-border bg-background px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] lg:hidden" aria-label="Mobile navigation">
            <Link 
              to="/" 
              onClick={() => {
                setMenuOpen(false)
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
              }} 
              className="border-b border-border py-4 transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link to="/mandi-prices" onClick={() => setMenuOpen(false)} className="border-b border-border py-4 transition-colors hover:text-primary">Mandi Prices</Link>
            <Link to="/schemes" onClick={() => setMenuOpen(false)} className="border-b border-border py-4 transition-colors hover:text-primary">Govt Schemes</Link>
            <Link to="/cold-storage" onClick={() => setMenuOpen(false)} className="border-b border-border py-4 transition-colors hover:text-primary">Cold Storage</Link>
            <div className="grid grid-cols-2 gap-2 pt-4">
              <Button variant="outline" asChild>
                <Link to="/login" onClick={() => setMenuOpen(false)}>Sign in</Link>
              </Button>
              <Button variant="farmer" asChild>
                <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
              </Button>
            </div>
          </nav>
        )}
      </header>

      {/* ── Live APMC Mandi Ticker ── */}
      <div className="overflow-hidden border-b border-primary/20 bg-market text-market-foreground" aria-label="Live APMC market rates">
        <div className="ticker-track flex h-10 items-center font-mono text-[10px] font-semibold uppercase tracking-[0.1em]">
          {[...rates, ...rates].map(([crop, city, price, change], index) => (
            <span key={`${crop}-${index}`} className="flex shrink-0 items-center gap-3 border-r border-primary/20 px-6">
              <span className="size-1.5 bg-primary" />
              <span>{crop} · {city}</span>
              <strong className="text-foreground">{price}/Qtl</strong>
              <span className={change.startsWith('+') ? 'text-primary' : 'text-destructive'}>{change}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── 2. HERO SECTION & LIVE AUCTION CONSOLE ── */}
      <section id="top" className="relative min-h-[720px] overflow-hidden bg-surface-strong text-surface-strong-foreground">
        <img
          src={marketImage}
          alt="Karnataka farmer sorting tomatoes at an agricultural market"
          className="absolute inset-0 h-full w-full object-cover object-[68%_center]"
        />
        <div className="hero-shade absolute inset-0" />

        <div className="relative mx-auto grid min-h-[570px] max-w-7xl items-center gap-12 px-5 pb-28 pt-14 lg:grid-cols-[1.12fr_.88fr] lg:px-8">
          <div className="max-w-3xl">
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground/70">
              <span className="h-px w-9 bg-trader" /> Karnataka's Direct Agricultural Exchange
            </p>
            <h1 className="mt-8 font-display text-5xl font-medium leading-[0.92] sm:text-6xl lg:text-7xl">
              The Direct Exchange<br />
              <span className="text-trader">for Indian Agriculture.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-primary-foreground/75">
              Sell and procure verified produce with 0% broker fees, licensed APMC buyers, and Agmarknet price intelligence from first bid to final dispatch.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                variant="farmer"
                size="xl"
              >
                <Link to="/register/farmer">
                  Sell Harvest <span className="opacity-70">Farmer / ಕೃಷಿಕ</span>
                  <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                variant="trader"
                size="xl"
              >
                <Link to="/register/trader">
                  Procure Produce <span className="opacity-70">Trader / ವ್ಯಾಪಾರಿ</span>
                  <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[10px] uppercase tracking-[0.1em] text-primary-foreground/65">
              <span className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-trader" /> APMC verified
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-trader" /> Escrow protected
              </span>
              <span className="flex items-center gap-2">
                <Scale className="size-4 text-trader" /> Weight audited
              </span>
            </div>
          </div>

          {/* Realistic Hero Live Lot Console (Lot #KA-KLR-882) */}
          <article className="hidden w-[360px] self-center justify-self-end border border-border bg-background p-5 text-foreground shadow-[0_24px_70px_-45px_var(--foreground)] lg:block">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-primary">
                <span className="size-2 animate-pulse rounded-full bg-primary" /> Live auction · 08:42
              </span>
              <span className="font-mono text-[9px] text-muted-foreground">Socket active</span>
            </div>
            <h2 className="mt-4 font-display text-2xl">
              Hybrid Tomatoes <span className="text-primary">#KA-KLR-882</span>
            </h2>
            <p className="mt-1 text-[10px] font-semibold text-muted-foreground">
              Grade A · 40 Qtl · Harvested today 05:30 AM · Kolar APMC
            </p>
            <div className="mt-4 grid grid-cols-3 gap-px bg-border text-center">
              <div className="bg-background p-3">
                <p className="text-[8px] uppercase text-muted-foreground">Reserve</p>
                <strong className="mt-1 block text-sm">₹2,100</strong>
              </div>
              <div className="bg-background p-3">
                <p className="text-[8px] uppercase text-muted-foreground">Agmarknet</p>
                <strong className="mt-1 block text-sm">₹2,200</strong>
              </div>
              <div className="bg-background p-3">
                <p className="text-[8px] uppercase text-muted-foreground">Top bid</p>
                <strong className="mt-1 block text-sm text-primary">₹2,240</strong>
                <span className="text-[8px] font-bold text-primary">+14.2%</span>
              </div>
            </div>
            <div className="mt-4 border-l-2 border-trader bg-secondary p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Top bidder</p>
              <p className="mt-1 text-xs font-bold">Bengaluru Fresh Foods</p>
              <p className="mt-1 text-[9px] text-muted-foreground">APMC #KA-BLR-491 · GST Verified</p>
            </div>
            <div className="mt-3 flex items-start gap-3 bg-market p-3 text-market-foreground">
              <LockKeyhole className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.12em]">Escrow vault</p>
                <p className="mt-1 text-xs font-semibold">₹89,600 locked in escrow before pickup</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 border border-border p-1">
              <Button size="sm" variant={heroOfferMode === 'accept' ? 'farmer' : 'ghost'} onClick={() => setHeroOfferMode('accept')}>
                Accept bid
              </Button>
              <Button size="sm" variant={heroOfferMode === 'counter' ? 'trader' : 'ghost'} onClick={() => setHeroOfferMode('counter')}>
                Counter offer
              </Button>
            </div>
            {heroOfferMode === 'counter' && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[[20, 2260], [40, 2280], [60, 2300]].map(([increment, value]) => (
                  <Button key={value} size="sm" variant={heroCounter === value ? 'trader' : 'outline'} onClick={() => setHeroCounter(value)}>
                    +₹{increment}
                  </Button>
                ))}
              </div>
            )}
            <Button variant={heroOfferMode === 'accept' ? 'farmer' : 'trader'} size="sm" className="mt-3 w-full" onClick={actOnHeroBid}>
              {heroOfferMode === 'accept' ? 'Accept ₹2,240/Qtl' : `Send counter · ₹${heroCounter.toLocaleString('en-IN')}`}
              <ArrowRight />
            </Button>
            <p role="status" className="mt-3 min-h-8 border-l-2 border-primary bg-market p-2 text-[9px] font-bold leading-4 text-market-foreground">
              {heroStatus}
            </p>
          </article>
        </div>

        {/* Impact Bar with Animated Counters & ScrollPop */}
        <div className="absolute inset-x-0 bottom-0 border-t border-primary-foreground/15 bg-surface-strong/90">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-primary-foreground/15 px-5 lg:grid-cols-4 lg:px-8">
            {[
              ['0%', 'Broker fee'],
              ['100%', 'Pre-funded escrow'],
              ['140+', 'APMC mandis'],
              ['31', 'Karnataka districts'],
            ].map(([value, label], idx) => (
              <ScrollPop key={label} delay={idx * 75} className="py-4 pl-4 first:pl-0 lg:py-5">
                <AnimatedCounter value={value} className="font-display text-2xl font-bold" />
                <span className="ml-2 text-[9px] font-bold uppercase tracking-[0.12em] text-primary-foreground/55">{label}</span>
              </ScrollPop>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. REAL-WORLD AGRICULTURAL SUPPLY CHAIN STORY ("FROM HARVEST TO HANDOVER") ── */}
      <SupplyChainStory />

      {/* ── 4. LIVE TRADE FLOOR / LOT BIDDING ENGINE ── */}
      <LiveTradeFloor />

      {/* ── 5. BILINGUAL REAL-TIME NEGOTIATION (COMPACT MINIATURE OF TradeChatModal) ── */}
      <NegotiationChat />

      {/* ── 6. AGMARKNET MANDI INTELLIGENCE ── */}
      <MandiIntelligence />

      {/* ── 7. GOVERNMENT SCHEMES & ELIGIBILITY CALCULATOR ── */}
      <SchemeExplorer />

      {/* ── 8. COLD STORAGE NETWORK EXPLORER ── */}
      <ColdStorageExplorer />

      {/* ── 9. FIELD WEATHER & AGRO ADVISORIES (COMPACT MINIATURE OF FarmerWeather) ── */}
      <WeatherPreview />

      {/* ── 10. THE FARMER LEDGER (0% BROKERAGE MODEL) ── */}
      <FarmerLedger />

      {/* ── 11. PRE-FOOTER CALL TO ACTION ── */}
      <ScrollSection variant="scale">
        <section className="bg-primary py-16 text-primary-foreground lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground/65">
                Trade without the middle layer
              </p>
              <h2 className="mt-4 max-w-3xl font-display text-4xl leading-none sm:text-6xl">
                Your next harvest can reach the market directly.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button variant="trader" size="xl" asChild>
                <Link to="/register/farmer">Sell Harvest / ಬೆಳೆ ಮಾರಾಟ <ArrowRight /></Link>
              </Button>
              <Button variant="inverse" size="xl" asChild>
                <Link to="/register/trader">Procure Produce / ಖರೀದಿ <ArrowRight /></Link>
              </Button>
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* ── 12. INSTITUTIONAL TRUST STRIP ── */}
      <section className="border-b border-border bg-background py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-5 md:grid-cols-4 lg:px-8">
          {[
            [BadgeCheck, 'APMC license verified'],
            [IndianRupee, 'Bank-backed escrow'],
            [Scale, 'Digital weight audit'],
            [ShieldCheck, 'Dispute resolution'],
          ].map(([Icon, label], index) => {
            const TrustIcon = Icon
            return (
              <ScrollPop key={label} delay={index * 75} className={`flex items-center gap-3 px-3 ${index > 0 ? 'border-l border-border' : ''}`}>
                <TrustIcon className="size-5 shrink-0 text-primary" />
                <span className="text-xs font-bold">{label}</span>
              </ScrollPop>
            )
          })}
        </div>
      </section>

      {/* ── 13. CANONICAL FOOTER ── */}
      <footer className="bg-surface-strong py-12 text-surface-strong-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[1fr_auto] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center bg-primary text-primary-foreground">
                <Sprout className="size-5" />
              </span>
              <span className="font-display text-2xl">KrishiSetu</span>
            </div>
            <p className="mt-4 max-w-sm text-xs leading-6 text-primary-foreground/55">
              Direct agricultural commerce for Karnataka farmers and licensed APMC wholesale traders.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-10 gap-y-3 text-xs text-primary-foreground/70 sm:grid-cols-4" aria-label="Footer navigation">
            <Link to="/" className="hover:text-trader">Home</Link>
            <Link to="/mandi-prices" className="hover:text-trader">Mandi prices</Link>
            <Link to="/schemes" className="hover:text-trader">Govt schemes</Link>
            <Link to="/cold-storage" className="hover:text-trader">Cold storage</Link>
          </nav>
        </div>
        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-2 border-t border-primary-foreground/10 px-5 pt-6 text-[10px] text-primary-foreground/45 sm:flex-row sm:justify-between lg:px-8">
          <p>Market, facility, scheme, and weather data shown for product demonstration.</p>
          <p>© 2026 KrishiSetu Exchange</p>
        </div>
      </footer>
    </main>
  )
}

export default Home
