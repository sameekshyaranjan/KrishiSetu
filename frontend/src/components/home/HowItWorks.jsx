import { 
  UploadCloud, 
  Gavel, 
  Lock, 
  Banknote, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Building2,
  BadgeCheck
} from 'lucide-react'
import { ScrollReveal } from '@/components/common/ScrollReveal'

export const HowItWorks = () => {
  const steps = [
    {
      step: '01',
      tag: 'STEP 01 • PRODUCER',
      title: 'List Crop in 60s',
      desc: 'Snap photos of your harvest lot, enter quintals, quality grade, and set your baseline reserve price directly from the field.',
      icon: UploadCloud,
      color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      mockup: (
        <div className="p-3 rounded-2xl bg-muted/50 border border-border space-y-2 text-xs">
          <div className="flex items-center gap-2.5">
            <img 
              src="/images/farmer_harvest_hero.jpg" 
              alt="Harvest Crop" 
              className="w-10 h-10 rounded-xl object-cover border border-border shrink-0" 
            />
            <div className="min-w-0 flex-1">
              <span className="font-bold text-foreground block truncate text-xs">Hybrid Tomato Lot #882</span>
              <span className="text-[10px] text-muted-foreground">Kolar • Hosakote Taluk</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-[11px] pt-1 border-t border-border/70 font-mono">
            <span className="text-muted-foreground">Volume: 40 Qtl</span>
            <span className="font-bold text-foreground">Reserve: ₹2,100/Qtl</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold pt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live on Karnataka Exchange
            </span>
          </div>
        </div>
      )
    },
    {
      step: '02',
      tag: 'STEP 02 • DISCOVERY',
      title: 'Receive Live Bids',
      desc: 'Licensed APMC merchants and wholesale processors compete in transparent auctions. Review bids and submit counter-offers in real-time.',
      icon: Gavel,
      color: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
      accentColor: 'text-amber-600 dark:text-amber-400',
      mockup: (
        <div className="p-3 rounded-2xl bg-muted/50 border border-border space-y-2 text-xs">
          <div className="p-2 rounded-xl bg-card border border-primary/30 flex items-center justify-between">
            <div className="min-w-0">
              <span className="font-bold text-foreground block text-xs truncate">Bengaluru Fresh Ltd.</span>
              <span className="text-[10px] text-muted-foreground">APMC Lic #KA-BLR-491</span>
            </div>
            <div className="text-right">
              <span className="font-mono font-black text-primary text-xs">₹2,180</span>
              <span className="text-[9px] text-emerald-600 block font-bold">Highest Bid</span>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono px-1">
            <span>KA Agro: ₹2,150</span>
            <span>Mysore Mills: ₹2,120</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-amber-600 font-semibold pt-0.5">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" /> 3 Active Bidders
            </span>
            <span>sub-50ms sync</span>
          </div>
        </div>
      )
    },
    {
      step: '03',
      tag: 'STEP 03 • SECURITY',
      title: 'Escrow Protection',
      desc: 'Buyer deposits 100% of agreed trade value into secure bank escrow before collection trucks are dispatched to the farm.',
      icon: Lock,
      color: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
      accentColor: 'text-blue-600 dark:text-blue-400',
      mockup: (
        <div className="p-3 rounded-2xl bg-muted/50 border border-border space-y-2 text-xs">
          <div className="flex items-center justify-between pb-1 border-b border-border/70 text-[10px] font-mono">
            <span className="text-muted-foreground">ESCROW LOCK #9912</span>
            <span className="text-blue-600 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% FUNDED
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Trade Order Value:</span>
              <span className="font-mono font-bold text-foreground">₹87,200</span>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Security Vault:</span>
              <span>ICICI Bank Escrow</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold pt-0.5">
            <CheckCircle2 className="w-3 h-3" /> Funds Frozen Prior to Gate Dispatch
          </div>
        </div>
      )
    },
    {
      step: '04',
      tag: 'STEP 04 • SETTLEMENT',
      title: 'Instant Direct Payout',
      desc: 'Upon produce delivery verification at the APMC yard or gate, funds release directly to the farmer’s Aadhaar-linked bank account.',
      icon: Banknote,
      color: 'text-purple-600 bg-purple-500/10 border-purple-500/20',
      accentColor: 'text-purple-600 dark:text-purple-400',
      mockup: (
        <div className="p-3 rounded-2xl bg-muted/50 border border-border space-y-2 text-xs">
          <div className="flex items-center justify-between pb-1 border-b border-border/70 text-[10px] font-mono">
            <span className="text-muted-foreground">IMPS SETTLEMENT</span>
            <span className="text-emerald-600 font-bold">COMPLETED ✓</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground block">SBI Aadhaar Linked A/c ••••4912</span>
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm block">
              +₹87,200.00
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
            <span>Commission Deducted:</span>
            <span className="font-bold text-foreground font-mono">₹0 (0%)</span>
          </div>
        </div>
      )
    }
  ]

  return (
    <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Section Header */}
      <ScrollReveal variant="fade-up" duration={500} className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>WORKFLOW ARCHITECTURE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Simple 4-Step Process: From Harvest to Direct Bank Settlement
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Engineered for smooth, trustworthy operation in both rural farm field conditions and wholesale APMC trading offices.
        </p>
      </ScrollReveal>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((item, idx) => {
          const Icon = item.icon
          return (
            <ScrollReveal 
              key={item.step}
              as="div"
              variant="fade-up"
              delay={idx * 80}
              duration={550}
              className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all space-y-5 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full border ${item.color}`}>
                    {item.tag}
                  </span>
                  <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center transition-transform group-hover:scale-110 shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Step Title and Description */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-base sm:text-lg text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* In-Card Realistic Product Mockup Snippet */}
              <div className="pt-2">
                {item.mockup}
              </div>
            </ScrollReveal>
          )
        })}
      </div>

      {/* Bottom Trust Seal */}
      <ScrollReveal variant="fade-up" delay={150} duration={500} className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium pt-2">
        <span className="flex items-center gap-1.5">
          <BadgeCheck className="w-4 h-4 text-emerald-600" /> 100% Aadhaar Verified Farmers
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-primary" /> State APMC & GSTIN Audited Traders
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-blue-600" /> Institutional Bank Escrow Clearing
        </span>
      </ScrollReveal>

    </section>
  )
}

export default HowItWorks
