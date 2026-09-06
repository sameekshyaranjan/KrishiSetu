import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Percent, 
  MessageSquare, 
  TrendingUp, 
  ShieldCheck, 
  Landmark, 
  Snowflake, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Lock,
  Radio,
  Zap,
  Clock,
  Building2,
  BadgeCheck,
  Shield,
  FileCheck
} from 'lucide-react'
import { ScrollReveal } from '@/components/common/ScrollReveal'

export const BentoFeatures = () => {
  const [activeTab, setActiveTab] = useState('schemes')

  return (
    <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Section Header */}
      <ScrollReveal variant="fade-up" duration={500} className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Platform Capabilities</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Enterprise Capabilities Built for Real Indian Agriculture
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Engineered to replace fragmented APMC brokerage networks with direct digital trade settlement, live price discovery, and institutional security.
        </p>
      </ScrollReveal>

      {/* 5-Card Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* CARD 1: 0% Brokerage Transparency (Spans 2 Columns on Desktop) */}
        <ScrollReveal as="div" variant="fade-up" delay={0} duration={550} className="lg:col-span-2 bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6 hover:border-primary/40 transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-3 max-w-lg">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Percent className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  100% Value Retained
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                0% Brokerage Transparency
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Never pay 6%–10% traditional commission cuts. Keep the entire agreed bid price directly deposited to your Aadhaar-linked bank account.
              </p>
            </div>
            <div className="shrink-0 w-24 h-20 sm:w-32 sm:h-24 rounded-2xl overflow-hidden border border-border shadow-sm">
              <img 
                src="/images/farmer_trader_partnership.jpg" 
                alt="Direct Farmer Trader Partnership" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>

          {/* Visual Margin Comparison Breakdown */}
          <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border">
            <div className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Financial Yield on ₹1,00,000 Harvest Trade:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">+₹11,000 Farmer Gain</span>
            </div>

            {/* Traditional Channel Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Traditional APMC Dalal / Commission Agent Channel</span>
                <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">₹89,000 (89%)</span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted flex overflow-hidden">
                <div className="h-full bg-slate-400 dark:bg-slate-600 w-[89%]" title="Farmer Net"></div>
                <div className="h-full bg-rose-500 w-[8%]" title="8% Commission Agent"></div>
                <div className="h-full bg-amber-500 w-[3%]" title="3% Hamali & Deductions"></div>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Net payout after agent cut & weighing loss</span>
                <span className="text-rose-500">-₹11,000 lost in cuts</span>
              </div>
            </div>

            {/* KrishiSetu Marketplace Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-semibold text-foreground">
                <span className="flex items-center gap-1.5 text-primary">
                  <CheckCircle2 className="w-3.5 h-3.5" /> KrishiSetu Direct B2B Marketplace
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">₹1,00,000 (100%)</span>
              </div>
              <div className="h-3.5 w-full rounded-full bg-muted flex overflow-hidden ring-2 ring-primary/20">
                <div className="h-full bg-emerald-600 w-full" title="100% Payout"></div>
              </div>
              <div className="flex justify-between text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Zero platform fee • Zero middleman commission</span>
                <span>Full value to farmer</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* CARD 2: Sub-50ms Direct Chat & Counter-Bidding */}
        <ScrollReveal as="div" variant="fade-up" delay={100} duration={550} className="bg-card rounded-3xl border border-border p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-6 hover:border-primary/40 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 flex items-center gap-1">
                <Zap className="w-3 h-3" /> sub-50ms
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              Real-Time Negotiation Chat
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Direct dialogue between farmer and buyer. Negotiate lot delivery timelines, quality grading, and transport arrangements in real-time.
            </p>
          </div>

          {/* Chat Mockup */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-2.5 text-xs">
            <div className="bg-card border border-border rounded-xl p-2.5 space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span className="font-semibold text-foreground">Bengaluru Fresh Foods</span>
                <span>10:42 AM</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Placing initial bid at ₹2,100/Qtl for 40 quintals.
              </p>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-2.5 space-y-1 ml-4">
              <div className="flex justify-between text-[10px] text-primary">
                <span className="font-semibold">You (Farmer)</span>
                <span>10:43 AM</span>
              </div>
              <p className="text-foreground text-[11px]">
                Offered counter: ₹2,180/Qtl. Produce is Grade-A, sorted in crates.
              </p>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[10px] font-bold">
                Counter Offer Pending Trader Review
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* CARD 3: Professional Agmarknet Market Intelligence Terminal */}
        <ScrollReveal as="div" variant="fade-up" delay={0} duration={550} className="bg-card rounded-3xl border border-border p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-5 hover:border-primary/40 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>LIVE AGMARKNET</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Official Mandi Price Feeds
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Real-time wholesale benchmarks across 140+ Karnataka APMCs so farmers never sell below prevailing rates.
              </p>
            </div>
          </div>

          {/* Professional Financial Table Layout */}
          <div className="rounded-2xl bg-muted/40 border border-border divide-y divide-border/60 text-xs overflow-hidden">
            <div className="p-2.5 bg-muted/80 flex justify-between text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
              <span>Mandi & Commodity</span>
              <div className="flex gap-4">
                <span>Modal Rate</span>
                <span>Trend</span>
              </div>
            </div>

            <div className="p-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block text-xs">Kolar APMC</span>
                <span className="text-[10px] text-muted-foreground">Hybrid Tomato</span>
              </div>
              <div className="flex items-center gap-3 text-right">
                <span className="font-mono font-bold text-foreground text-xs">₹2,200</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                  +14.2%
                </span>
              </div>
            </div>

            <div className="p-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block text-xs">Hubballi APMC</span>
                <span className="text-[10px] text-muted-foreground">Byadgi Chilli</span>
              </div>
              <div className="flex items-center gap-3 text-right">
                <span className="font-mono font-bold text-foreground text-xs">₹14,800</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                  +6.4%
                </span>
              </div>
            </div>

            <div className="p-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block text-xs">Mandya APMC</span>
                <span className="text-[10px] text-muted-foreground">Bellary Onion</span>
              </div>
              <div className="flex items-center gap-3 text-right">
                <span className="font-mono font-bold text-foreground text-xs">₹2,650</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                  +18.5%
                </span>
              </div>
            </div>

            <div className="p-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block text-xs">Belagavi APMC</span>
                <span className="text-[10px] text-muted-foreground">Jyoti Potato</span>
              </div>
              <div className="flex items-center gap-3 text-right">
                <span className="font-mono font-bold text-foreground text-xs">₹1,850</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-mono font-bold">
                  -5.2%
                </span>
              </div>
            </div>
          </div>

          <Link 
            to="/mandi-prices" 
            className="text-xs font-bold text-primary hover:underline flex items-center justify-between pt-1 group"
          >
            <span>Explore 140+ Karnataka Mandis</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </ScrollReveal>

        {/* CARD 4: High-Fidelity Escrow Settlement Clearing Instrument */}
        <ScrollReveal as="div" variant="fade-up" delay={100} duration={550} className="bg-card rounded-3xl border border-border p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-5 hover:border-primary/40 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                100% PRE-FUNDED
              </span>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Escrow Settlement Security
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Traders deposit 100% of order value into protected escrow before the truck leaves the farm gate.
              </p>
            </div>
          </div>

          {/* Real-World Escrow Vault Clearance Card */}
          <div className="rounded-2xl bg-muted/40 border border-border p-4 space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/70 text-[11px]">
              <span className="font-mono text-muted-foreground">VAULT ID: ICICI-ESCROW-KA-8891</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5" /> SECURED
              </span>
            </div>

            {/* Stepper Timeline with Connected Nodes */}
            <div className="space-y-2 relative pl-2">
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <div className="flex-1 flex justify-between items-baseline">
                  <span className="font-bold text-foreground text-xs">1. Crop Lot Listed</span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Verified</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <div className="flex-1 flex justify-between items-baseline">
                  <span className="font-bold text-foreground text-xs">2. Buyer Funds Escrow</span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">₹87,200 Locked</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex-1 flex justify-between items-baseline">
                  <span className="font-bold text-foreground text-xs">3. Gate Inspection</span>
                  <span className="text-[10px] font-mono text-amber-600">In Transit</span>
                </div>
              </div>

              <div className="flex items-start gap-3 opacity-60">
                <div className="w-4 h-4 rounded-full bg-muted-foreground/30 text-muted-foreground flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                  4
                </div>
                <div className="flex-1 flex justify-between items-baseline">
                  <span className="font-semibold text-muted-foreground text-xs">4. Bank Payout Release</span>
                  <span className="text-[10px] font-mono text-muted-foreground">IMPS Instant</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/70 flex items-center justify-between text-[11px] text-muted-foreground font-medium">
              <span>Payment Guarantee:</span>
              <span className="text-foreground font-bold font-mono">0% Default Risk</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BadgeCheck className="w-4 h-4 text-emerald-600" />
            <span>Aadhaar & APMC License Certified</span>
          </div>
        </ScrollReveal>

        {/* CARD 5: Welfare Scheme & Cold Chain Directory Hub */}
        <ScrollReveal as="div" variant="fade-up" delay={200} duration={550} className="md:col-span-2 lg:col-span-1 bg-card rounded-3xl border border-border p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-5 hover:border-primary/40 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Landmark className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                KARNATAKA AG-HUB
              </span>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Govt Schemes & Cold Storage
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Determine government welfare entitlements and locate certified cold chain facilities near your farm.
              </p>
            </div>
          </div>

          {/* Professional Segmented Controller */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 p-1 rounded-xl bg-muted/60 border border-border text-xs">
              <button
                onClick={() => setActiveTab('schemes')}
                className={`py-1.5 px-2 rounded-lg font-bold transition-all text-xs ${
                  activeTab === 'schemes'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Govt Schemes
              </button>
              <button
                onClick={() => setActiveTab('coldstorage')}
                className={`py-1.5 px-2 rounded-lg font-bold transition-all text-xs ${
                  activeTab === 'coldstorage'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Cold Storages
              </button>
            </div>

            {/* Active Content Body */}
            {activeTab === 'schemes' ? (
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3 text-xs animate-in fade-in">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-foreground">PM-KISAN + Raitha Siri</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono font-bold text-[10px]">
                    ₹10,000 / Year
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Evaluate eligibility for PM-KISAN, PMFBY crop insurance, and Karnataka Raitha Siri millet bonuses in 4 quick questions.
                </p>
                <Link 
                  to="/schemes" 
                  className="w-full py-2 px-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs inline-flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-all shadow-sm"
                >
                  <span>Calculate Entitlements</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3 text-xs animate-in fade-in">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-foreground">120+ Karnataka Facilities</span>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono font-bold text-[10px]">
                    Solar-Powered
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Search temperature and humidity-controlled storage across Bangalore, Kolar, and Hassan to prevent post-harvest distress sales.
                </p>
                <Link 
                  to="/cold-storage" 
                  className="w-full py-2 px-3 rounded-xl bg-card border border-border text-foreground font-bold text-xs inline-flex items-center justify-center gap-1.5 hover:bg-muted transition-all shadow-sm"
                >
                  <span>Locate Cold Storages</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
            <FileCheck className="w-4 h-4 text-purple-600" />
            <span>Direct Benefit Transfer (DBT) Ready</span>
          </div>
        </ScrollReveal>

      </div>
    </section>
  )
}

export default BentoFeatures
