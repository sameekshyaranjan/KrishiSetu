import { useState } from 'react'
import { 
  Sprout, 
  Store, 
  Handshake, 
  Truck, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  UploadCloud,
  FileCheck,
  Lock
} from 'lucide-react'
import { ScrollReveal } from '@/components/common/ScrollReveal'

export const TradeLifecycle = () => {
  const [activeTab, setActiveTab] = useState(0)

  const steps = [
    {
      id: 'harvest',
      number: '01',
      phase: 'ORIGIN • FARM GATE',
      title: 'Direct Harvest Lot Listing',
      desc: 'Farmers in Kolar, Mandya, Hassan, and Belagavi list produce immediately upon field grading. Specify variety, moisture/grade, quantity in quintals, and baseline reserve price directly from your smartphone.',
      icon: UploadCloud,
      preview: {
        tag: 'LIVE LOT PROFILE',
        title: 'Hybrid Tomato Grade-A (40 Qtl)',
        origin: 'Kolar • Hosakote Taluk',
        reserve: '₹2,100 / Qtl Minimum Floor',
        status: 'Audit Passed • Photo Verified'
      }
    },
    {
      id: 'price',
      number: '02',
      phase: 'MARKET • PRICE DISCOVERY',
      title: 'Agmarknet APMC Price Benchmark',
      desc: 'Before any bid is accepted, both farmers and buyers see live modal, minimum, and maximum prices pulled directly from Karnataka APMC mandis. Neither party enters trade negotiations blind.',
      icon: Store,
      preview: {
        tag: 'AGMARKNET LIVE BENCHMARK',
        title: 'Kolar APMC Market Yard',
        origin: 'Updated Today 11:30 AM',
        reserve: 'Modal Price: ₹2,200 / Qtl',
        status: 'Synced with 140+ Mandi Terminals'
      }
    },
    {
      id: 'bidding',
      number: '03',
      phase: 'EXCHANGE • NEGOTIATION',
      title: 'Real-Time Bidding & Counter-Offers',
      desc: 'Licensed wholesale aggregators, retail supermarket chains, and food processors submit competitive bids. Producers can accept instantly or send counter-offers over an encrypted sub-50ms WebSocket room.',
      icon: Zap,
      preview: {
        tag: 'REAL-TIME TRADING ROOM',
        title: 'Leading Bid: ₹2,240 / Qtl (+₹40)',
        origin: 'Bengaluru Fresh Retails Pvt Ltd',
        reserve: 'APMC License: #KA-BLR-491 Verified',
        status: 'Active Socket Channel • 3 Bidders'
      }
    },
    {
      id: 'escrow',
      number: '04',
      phase: 'FULFILLMENT • ESCROW',
      title: 'Pre-Funded Escrow & Farm-Gate Logistics',
      desc: 'The buyer deposits 100% of the agreed contract value into an APMC-compliant escrow account before logistics trucks are dispatched. Upon digital weighbridge sign-off at the farm gate, funds release directly to bank accounts.',
      icon: Lock,
      preview: {
        tag: 'BANK-GUARANTEED ESCROW',
        title: 'Escrow Vault Lock #9941',
        origin: '100% Pre-Funded by Buyer',
        reserve: '₹89,600 Held in Escrow',
        status: 'Release on Farm-Gate Weight Sign-off'
      }
    }
  ]

  return (
    <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {/* Section Header */}
      <ScrollReveal variant="fade-up" duration={500} className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20">
          <span>THE EXCHANGE ARCHITECTURE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          How Agricultural Commerce Actually Happens on KrishiSetu
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed">
          From the first field weighment to certified bank transfer, every step is built around transparency, APMC compliance, and complete fraud elimination.
        </p>
      </ScrollReveal>

      {/* 4-Pillar Sequential Flow (Not generic cards) */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {steps.map((s, idx) => {
          const Icon = s.icon
          const isActive = activeTab === idx

          return (
            <ScrollReveal
              key={s.id}
              variant="fade-up"
              delay={idx * 80}
              duration={550}
              className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-6 ${
                isActive 
                  ? 'bg-card border-primary/50 shadow-md ring-1 ring-primary/20' 
                  : 'bg-card/50 border-border/70 hover:border-border hover:bg-card shadow-xs'
              }`}
              onClick={() => setActiveTab(idx)}
            >
              <div className="space-y-4">
                {/* Step Pill & Icon */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-primary px-2.5 py-1 rounded-md bg-primary/10">
                    PHASE {s.number}
                  </span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block font-bold">
                    {s.phase}
                  </span>
                  <h3 className="text-lg font-bold text-foreground leading-snug">
                    {s.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>

              {/* Realistic Embedded UI Snapshot */}
              <div className="p-3.5 rounded-xl bg-muted/50 border border-border/80 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-primary font-bold">{s.preview.tag}</span>
                  <span className="text-muted-foreground">{s.preview.origin}</span>
                </div>
                <div className="text-foreground font-bold text-xs truncate">
                  {s.preview.title}
                </div>
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {s.preview.reserve}
                </div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 pt-1 border-t border-border/60">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{s.preview.status}</span>
                </div>
              </div>
            </ScrollReveal>
          )
        })}
      </div>

    </section>
  )
}

export default TradeLifecycle
