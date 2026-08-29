import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import mandiService from '@/services/mandiService'
import { Button } from '@/components/ui/button'
import { 
  Sprout, 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Radio, 
  Sparkles, 
  Landmark, 
  DollarSign, 
  Users, 
  Zap, 
  Scale,
  UploadCloud,
  Gavel,
  Lock,
  Banknote,
  Smartphone,
  BarChart3,
  Award,
  Globe2
} from 'lucide-react'

export const Home = () => {
  const [tickerPrices, setTickerPrices] = useState([])

  useEffect(() => {
    const loadTicker = async () => {
      try {
        const res = await mandiService.getLivePrices()
        setTickerPrices(res.prices || [])
      } catch {
        // Fallback handled in service
      }
    }
    loadTicker()
  }, [])

  return (
    <div className="space-y-20 py-6 pb-20">
      


      {/* 2. Hero Main Section */}
      <section className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 shadow-sm animate-in fade-in duration-500">
          <Sparkles className="w-4 h-4" />
          <span>India&apos;s Direct Farmer-to-Trader Digital Agri Marketplace</span>
        </div>

        {/* Dynamic Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]">
          Direct Farm Sales with <span className="text-primary bg-clip-text">Zero Broker Fees</span> & Live Mandi Rates
        </h1>

        {/* Sub-headline */}
        <p className="text-muted-foreground text-sm sm:text-lg max-w-3xl mx-auto leading-relaxed">
          Eliminate exploitative middlemen. List your harvest directly from Karnataka farms, receive competitive bids from licensed APMC buyers, and track real-time Agmarknet wholesale rates.
        </p>

        {/* Dual Persona Interactive Call-to-Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-xl mx-auto">
          
          {/* Farmer Primary CTA */}
          <Button asChild size="lg" className="w-full sm:w-auto rounded-2xl h-14 px-8 text-base font-extrabold shadow-xl hover:shadow-primary/25 group">
            <Link to="/register/farmer" className="flex items-center justify-center gap-2">
              <Sprout className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Sell as Farmer <span className="text-xs font-normal opacity-80">(ಕೃಷಿಕ)</span></span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>

          {/* Trader B2B CTA */}
          <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto rounded-2xl h-14 px-8 text-base font-extrabold shadow-lg bg-amber-500 text-white hover:bg-amber-600 group">
            <Link to="/register/trader" className="flex items-center justify-center gap-2">
              <Briefcase className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Procure as Trader <span className="text-xs font-normal opacity-80">(ವ್ಯಾಪಾರಿ)</span></span>
            </Link>
          </Button>
        </div>

        {/* Secondary Navigation */}
        <div className="flex items-center justify-center gap-6 pt-2 text-xs font-semibold text-muted-foreground">
          <Link to="/mandi-prices" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> View Live Mandi Prices
          </Link>
          <span>•</span>
          <Link to="/schemes" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-amber-500" /> Govt Welfare Schemes
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-border max-w-4xl mx-auto text-left">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/80 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-foreground text-xs">0% Brokerage</p>
              <p className="text-[10px] text-muted-foreground">Direct Farmer Profit</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/80 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-foreground text-xs">Verified APMC</p>
              <p className="text-[10px] text-muted-foreground">GST & License Checked</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/80 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-foreground text-xs">Agmarknet Live</p>
              <p className="text-[10px] text-muted-foreground">Govt Price Feeds</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/80 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-foreground text-xs">Fair Auctions</p>
              <p className="text-[10px] text-muted-foreground">Transparent Bids</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works (4-Step Flow) */}
      <section className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Simple 4-Step Process</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            How KrishiSetu Works
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
            From listing your harvest on your phone to receiving guaranteed bank payouts — here is how easy it is.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Step 1 */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:border-primary/50 transition-all space-y-4 relative">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center border border-primary/20">
              01
            </span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground">List Crop in 60s</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Snap photos of your crop, specify quantity in quintals, harvest readiness, and set your reserve price.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:border-primary/50 transition-all space-y-4 relative">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center border border-primary/20">
              02
            </span>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Gavel className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground">Receive Live Bids</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Licensed APMC buyers across Karnataka place competitive bids. Review offers and select the highest bidder.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:border-primary/50 transition-all space-y-4 relative">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center border border-primary/20">
              03
            </span>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground">Escrow Protection</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Buyer deposits 100% of the trade value into secure escrow before taking delivery of your harvest.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:border-primary/50 transition-all space-y-4 relative">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center border border-primary/20">
              04
            </span>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Banknote className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground">Instant Direct Payout</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upon delivery verification at the APMC yard, funds are released directly to your Aadhaar-linked bank account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Capabilities & Feature Grid */}
      <section className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">Enterprise Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Why Farmers & Traders Choose KrishiSetu
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">0% Brokerage Policy</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Never pay 6%–10% traditional commission cuts. 100% of the agreed bid price belongs to the farmer.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Live Agmarknet Intelligence</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Track 7, 15, and 30-day historical modal price trends across Karnataka mandis to sell at peak market rates.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Verified APMC Traders</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every buyer is verified with state APMC licenses and GSTIN records, eliminating payment defaults.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Escrow Payment Protection</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Funds are secured in escrow before logistics dispatch, guaranteeing safe settlement for both parties.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Landmark className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Welfare Scheme Calculator</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Instantly calculate entitlements for PM-KISAN, PMFBY, KCC, and Karnataka Raitha Siri in 4 quick questions.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Real-Time Kannada SMS Alerts</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Receive bid alerts, price surges, and pickup notifications directly on your mobile in your preferred language.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Platform Impact Metrics */}
      <section className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-card via-card to-primary/5 border border-border shadow-xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-primary">140+</p>
            <p className="text-xs font-bold text-foreground uppercase tracking-wider">APMC Mandis</p>
            <p className="text-[11px] text-muted-foreground">Active Across Karnataka</p>
          </div>

          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-emerald-600">₹0</p>
            <p className="text-xs font-bold text-foreground uppercase tracking-wider">Commission Fee</p>
            <p className="text-[11px] text-muted-foreground">100% Value to Farmers</p>
          </div>

          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-amber-500">60+</p>
            <p className="text-xs font-bold text-foreground uppercase tracking-wider">Crops Tracked</p>
            <p className="text-[11px] text-muted-foreground">Vegetables, Grains & Pulses</p>
          </div>

          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-purple-600">100%</p>
            <p className="text-xs font-bold text-foreground uppercase tracking-wider">Verified Buyers</p>
            <p className="text-[11px] text-muted-foreground">APMC & GST Validated</p>
          </div>
        </div>
      </section>

      {/* 6. High-Conversion Pre-Footer Call to Action */}
      <section className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-card border-2 border-primary/30 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Get Started in 60 Seconds</span>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Ready to Maximize Your Agricultural Trade?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Join thousands of Karnataka farmers and licensed APMC traders already trading transparently on KrishiSetu.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto rounded-2xl h-12 px-8 font-extrabold text-sm shadow-md">
              <Link to="/register/farmer">
                <Sprout className="w-4 h-4 mr-2" /> Register as Farmer
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto rounded-2xl h-12 px-8 font-extrabold text-sm border-border">
              <Link to="/register/trader">
                <Briefcase className="w-4 h-4 mr-2 text-amber-500" /> Register as Trader
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
