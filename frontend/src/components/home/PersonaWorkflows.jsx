import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Sprout, 
  Briefcase, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Building2, 
  Lock,
  Zap,
  PhoneCall
} from 'lucide-react'
import { ScrollReveal } from '@/components/common/ScrollReveal'

export const PersonaWorkflows = () => {
  const [activePersona, setActivePersona] = useState('farmer')

  return (
    <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {/* Section Header */}
      <ScrollReveal variant="fade-up" duration={500} className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20">
          <span>DUAL-PERSONA EXCHANGE ARCHITECTURE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Built Specifically for Both Sides of the Agri Supply Chain
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed">
          KrishiSetu aligns the economic incentives of Karnataka producers and institutional APMC buyers onto one transparent, secure trading floor.
        </p>
      </ScrollReveal>

      {/* Interactive Persona Switcher Tabs */}
      <div className="mt-8 flex items-center justify-start border-b border-border">
        <button
          onClick={() => setActivePersona('farmer')}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activePersona === 'farmer'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sprout className="w-4 h-4 text-emerald-600" />
          <span>For Farmers (ಕೃಷಿಕರಿಗೆ)</span>
        </button>

        <button
          onClick={() => setActivePersona('trader')}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activePersona === 'trader'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Briefcase className="w-4 h-4 text-amber-500" />
          <span>For Licensed APMC Traders (ವ್ಯಾಪಾರಿಗಳಿಗೆ)</span>
        </button>
      </div>

      {/* Persona Content Panel */}
      <div className="mt-8">
        {activePersona === 'farmer' ? (
          <ScrollReveal variant="fade-up" duration={450} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Farmer Value Props (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                  Producer Advantages • 0% Intermediation
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Sell at True Market Value Without Paying Commission Agents
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  List your harvested lot directly from the field with photos and reserve price. Receive competing bids from verified wholesale buyers across Karnataka.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-card border border-border space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    <Check className="w-4 h-4" />
                    <span>0% Brokerage Cut</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You keep 100% of the agreed bid. No 8% commission deductions.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    <Check className="w-4 h-4" />
                    <span>Live Mandi Benchmarks</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Know the exact modal price in Kolar, Mandya, and Hubballi before agreeing.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    <Check className="w-4 h-4" />
                    <span>Escrow Payment Lock</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Buyers deposit 100% funds into escrow before trucks leave your farm.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    <Check className="w-4 h-4" />
                    <span>Direct Bank Deposit</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Funds release to your Aadhaar-linked bank account within 24 hours of weighment.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/register/farmer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-all group"
                >
                  <Sprout className="w-4 h-4" />
                  <span>Start Selling as Farmer (ಕೃಷಿಕ ನೋಂದಣಿ)</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Farmer UI Snapshot (5 cols) */}
            <div className="lg:col-span-5">
              <div className="p-5 rounded-2xl bg-card border border-emerald-500/30 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border text-xs">
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">FARMER PORTAL PREVIEW</span>
                  <span className="text-muted-foreground font-mono">Lot #882</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-2">
                    <div className="flex justify-between font-mono">
                      <span className="text-muted-foreground">Kolar APMC Benchmark:</span>
                      <span className="font-bold text-foreground">₹2,200 / Qtl</span>
                    </div>
                    <div className="flex justify-between font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                      <span>Highest Buyer Bid:</span>
                      <span>₹2,240 / Qtl (+₹40)</span>
                    </div>
                    <div className="flex justify-between font-mono pt-1 border-t border-border/70 text-foreground font-semibold">
                      <span>Gross Payout (40 Qtl):</span>
                      <span>₹89,600 (Net 100%)</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Buyer Escrow Funded: ₹89,600 Locked at State Bank</span>
                  </div>
                </div>
              </div>
            </div>

          </ScrollReveal>
        ) : (
          <ScrollReveal variant="fade-up" duration={450} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Trader Value Props (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                  Institutional Procurement • APMC Verified
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Direct Farm-Gate Procurement for Bulk Buyers & Processors
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Source verified, graded produce directly from primary agricultural clusters. Eliminate yard congestion, secondary handling losses, and arbitrary cartel markup.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-card border border-border space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                    <Check className="w-4 h-4" />
                    <span>Direct Farm-Gate Sourcing</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Inspect lot photos and quality grades before bidding. Pick up directly at origin.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                    <Check className="w-4 h-4" />
                    <span>Full APMC Compliance</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Automated digital invoices, APMC cess calculation, and GST audit trails.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                    <Check className="w-4 h-4" />
                    <span>Quality-Linked Settlement</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Funds remain protected in escrow until physical weight and grade verification at collection.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                    <Check className="w-4 h-4" />
                    <span>Multi-Mandi Intelligence</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Access historical and daily modal price trends across 31 Karnataka districts.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/register/trader"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-all group"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Register as APMC Trader (ವ್ಯಾಪಾರಿ ನೋಂದಣಿ)</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Trader UI Snapshot (5 cols) */}
            <div className="lg:col-span-5">
              <div className="p-5 rounded-2xl bg-card border border-amber-500/30 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border text-xs">
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">TRADER CONSOLE PREVIEW</span>
                  <span className="text-muted-foreground font-mono">APMC #KA-BLR-491</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-2">
                    <div className="flex justify-between font-mono">
                      <span className="text-muted-foreground">Active Procurements:</span>
                      <span className="font-bold text-foreground">3 Lots (120 Qtl Total)</span>
                    </div>
                    <div className="flex justify-between font-mono text-amber-600 dark:text-amber-400 font-bold">
                      <span>Escrow Balance:</span>
                      <span>₹2,45,000 Verified</span>
                    </div>
                    <div className="flex justify-between font-mono pt-1 border-t border-border/70 text-foreground font-semibold">
                      <span>Logistics Status:</span>
                      <span className="text-emerald-600">Truck En Route (Kolar)</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 text-[11px] font-medium flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Instant APMC E-Way Bill & GST Invoice Generated</span>
                  </div>
                </div>
              </div>
            </div>

          </ScrollReveal>
        )}
      </div>

    </section>
  )
}

export default PersonaWorkflows
