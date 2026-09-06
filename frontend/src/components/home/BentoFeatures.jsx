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
  Clock
} from 'lucide-react'

export const BentoFeatures = () => {
  const [activeScheme, setActiveScheme] = useState('pmkisan')

  return (
    <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
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
      </div>

      {/* 5-Card Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* CARD 1: 0% Brokerage Transparency (Spans 2 Columns on Desktop) */}
        <div className="lg:col-span-2 bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6 hover:border-primary/40 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
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
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
              Never pay 6%–10% traditional commission cuts. Keep the entire agreed bid price directly deposited to your Aadhaar-linked bank account.
            </p>
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
        </div>

        {/* CARD 2: Sub-50ms Direct Chat & Counter-Bidding */}
        <div className="bg-card rounded-3xl border border-border p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-6 hover:border-primary/40 transition-all">
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
        </div>

        {/* CARD 3: Official Agmarknet Price Intelligence */}
        <div className="bg-card rounded-3xl border border-border p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-6 hover:border-primary/40 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-500 animate-pulse" /> Live Mandi Sync
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              Official Agmarknet Mandi Feeds
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Real-time modal, minimum, and maximum wholesale price feeds so farmers never sell below prevailing APMC averages.
            </p>
          </div>

          {/* Mandi Rates Mini-Table */}
          <div className="space-y-2 p-3 rounded-2xl bg-muted/40 border border-border text-xs">
            <div className="flex justify-between items-center py-1 border-b border-border/60">
              <span className="font-semibold text-foreground">Kolar APMC • Tomato</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">₹2,200/Qtl ▲</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/60">
              <span className="font-semibold text-foreground">Hubballi APMC • Chilli</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">₹14,800/Qtl ▲</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/60">
              <span className="font-semibold text-foreground">Mandya APMC • Onion</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">₹2,650/Qtl ▲</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-semibold text-foreground">Belagavi APMC • Potato</span>
              <span className="font-mono font-bold text-rose-500">₹1,850/Qtl ▼</span>
            </div>
          </div>

          <Link 
            to="/mandi-prices" 
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>Explore 140+ Karnataka Mandis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* CARD 4: Escrow-Grade Settlement Security */}
        <div className="bg-card rounded-3xl border border-border p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-6 hover:border-primary/40 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
                100% Pre-funded
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              Escrow-Grade Settlement
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Traders deposit 100% of order value into protected escrow before the truck leaves the farm gate. Zero default risk.
            </p>
          </div>

          {/* Stepper Progression */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-muted/40 border border-border text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> 1. Lot Listed
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> 2. Escrow Funded
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> 3. Gate Dispatch
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="flex items-center gap-1 font-semibold text-muted-foreground">
                <span>4. Bank Payout</span>
              </span>
            </div>
          </div>
        </div>

        {/* CARD 5: Welfare Scheme & Cold Storage Discovery */}
        <div className="bg-card rounded-3xl border border-border p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-6 hover:border-primary/40 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Landmark className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600">
                Karnataka Ag-Hub
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              Govt Schemes & Cold Storage
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Determine government scheme entitlements and discover verified cold storage capacity near your taluk in 4 clicks.
            </p>
          </div>

          {/* Quick Select Buttons */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setActiveScheme('pmkisan')}
                className={`p-2 rounded-xl text-left font-semibold border transition-all ${
                  activeScheme === 'pmkisan'
                    ? 'bg-primary/10 border-primary/40 text-primary'
                    : 'bg-muted/40 border-border text-muted-foreground'
                }`}
              >
                PM-KISAN / Raitha Siri
              </button>
              <button
                onClick={() => setActiveScheme('coldstorage')}
                className={`p-2 rounded-xl text-left font-semibold border transition-all ${
                  activeScheme === 'coldstorage'
                    ? 'bg-primary/10 border-primary/40 text-primary'
                    : 'bg-muted/40 border-border text-muted-foreground'
                }`}
              >
                Cold Chain Facilities
              </button>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs">
              {activeScheme === 'pmkisan' ? (
                <div className="space-y-1">
                  <p className="font-bold text-foreground">PM-KISAN + Raitha Siri Calculator</p>
                  <p className="text-muted-foreground text-[11px]">Up to ₹10,000/yr direct income support eligibility checker.</p>
                  <Link to="/schemes" className="text-primary font-bold text-[11px] inline-flex items-center gap-1 pt-1">
                    Calculate Entitlements <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-bold text-foreground">120+ Karnataka Cold Storages</p>
                  <p className="text-muted-foreground text-[11px]">Browse humidity-controlled facilities across Bangalore, Kolar & Hassan.</p>
                  <Link to="/cold-storage" className="text-primary font-bold text-[11px] inline-flex items-center gap-1 pt-1">
                    Browse Facilities <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default BentoFeatures
