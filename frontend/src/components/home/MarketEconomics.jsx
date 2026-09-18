import { TrendingUp, AlertTriangle, ShieldCheck, Check, ArrowRight, Percent, Building2 } from 'lucide-react'
import { ScrollReveal } from '@/components/common/ScrollReveal'

export const MarketEconomics = () => {
  return (
    <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {/* Section Header */}
      <ScrollReveal variant="fade-up" duration={500} className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20">
          <span>ECONOMIC BREAKDOWN • KARNATAKA APMC DATA</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Why Disintermediation Matters: Where Does the Farmer’s ₹1,00,000 Go?
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed">
          In traditional physical mandis, informal middlemen and unlicensed sub-agents shave off 11% to 15% of the gross commodity value before the producer receives settlement.
        </p>
      </ScrollReveal>

      {/* Side-by-Side Architectural Ledger Grid */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Traditional APMC Dalal Channel (6 cols) */}
        <ScrollReveal variant="fade-up" delay={50} duration={600} className="lg:col-span-6 bg-card rounded-2xl border border-rose-500/20 shadow-sm p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 uppercase">
                  Traditional Mandi Channel (ದಲಾಲಿ ಪದ್ಧತಿ)
                </span>
              </div>
              <span className="text-xs font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full">
                -11% to -15% Lost
              </span>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground">
              Producers unload at the market yard with zero price guarantee. Commission agents dictate prices based on morning arrivals.
            </p>

            {/* Deductions Breakdown Table */}
            <div className="space-y-2.5 pt-2 font-mono text-xs">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Gross Commodity Value</span>
                <span className="font-bold text-foreground">₹1,00,000</span>
              </div>

              <div className="flex justify-between py-1.5 text-rose-600 dark:text-rose-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Dalal Commission Fee (6% – 8%)
                </span>
                <span className="font-semibold">-₹8,000</span>
              </div>

              <div className="flex justify-between py-1.5 text-rose-600 dark:text-rose-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Unrecorded Hamali & Handling (2% – 3%)
                </span>
                <span className="font-semibold">-₹2,000</span>
              </div>

              <div className="flex justify-between py-1.5 text-rose-600 dark:text-rose-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Arbitrary Weighing Scale "Sample" Deductions
                </span>
                <span className="font-semibold">-₹1,000</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-border font-bold text-sm">
                <span className="text-foreground">Net Payout to Farmer</span>
                <span className="text-rose-600 dark:text-rose-400">₹89,000</span>
              </div>
            </div>
          </div>

          {/* Risk Callout Footer */}
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Deferred 30-Day Paper Vouchers</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Commission agents write manual credit slips with zero bank collateral, resulting in frequent default delays during harvest gluts.
            </p>
          </div>
        </ScrollReveal>

        {/* Right Column: KrishiSetu Direct Exchange (6 cols) */}
        <ScrollReveal variant="fade-up" delay={120} duration={600} className="lg:col-span-6 bg-card rounded-2xl border-2 border-emerald-600/30 shadow-md p-6 sm:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden">
          {/* Subtle green ambient accent */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                  KrishiSetu Digital Trading Floor
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                100% Value Retained
              </span>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground">
              Producers set reserve floors against daily Agmarknet rates. Licensed buyers deposit 100% funds into escrow prior to farm-gate collection.
            </p>

            {/* Deductions Breakdown Table */}
            <div className="space-y-2.5 pt-2 font-mono text-xs">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Gross Commodity Value</span>
                <span className="font-bold text-foreground">₹1,00,000</span>
              </div>

              <div className="flex justify-between py-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Platform Broker Commission Fee
                </span>
                <span>₹0 (0%)</span>
              </div>

              <div className="flex justify-between py-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Standardized Digital Weighbridge Certificate
                </span>
                <span>₹0 Loss</span>
              </div>

              <div className="flex justify-between py-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Direct Farm-Gate Handover Logistics
                </span>
                <span>Buyer Borne</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-border font-bold text-sm">
                <span className="text-foreground">Net Payout to Farmer</span>
                <span className="text-emerald-700 dark:text-emerald-400 text-base">₹1,00,000</span>
              </div>
            </div>
          </div>

          {/* Value Gain Callout Footer */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 space-y-1 relative z-10">
            <div className="flex items-center justify-between font-bold">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Immediate Escrow Bank Settlement</span>
              </div>
              <span className="text-xs font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                +₹11,000 Extra / Lot
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Funds are held in an APMC-compliant escrow account and credited straight into the farmer's bank account upon digital weighment sign-off.
            </p>
          </div>
        </ScrollReveal>

      </div>
    </section>
  )
}

export default MarketEconomics
