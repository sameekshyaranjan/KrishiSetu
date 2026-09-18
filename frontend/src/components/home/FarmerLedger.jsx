import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AnimatedCounter from '@/components/common/AnimatedCounter'
import ScrollPop from '@/components/common/ScrollPop'

// Ledger values — percentage claims are widely documented facts (dalal ~8%, hamali ~3%)
// presented as a comparative UI explanation, clearly labelled as a trade example
// NOT presented as verified platform statistics
export const FarmerLedger = () => {
  const rows = [
    { label: 'Gross harvest value', traditional: '₹1,00,000', krishisetu: '₹1,00,000', strikeThrough: false },
    { label: 'Dalal / commission agent · ~8%', traditional: '− ₹8,000', krishisetu: '₹0', strikeThrough: true },
    { label: 'Weighing & hamali charges · ~3%', traditional: '− ₹3,000', krishisetu: '₹0', strikeThrough: true },
    { label: 'Cash handling uncertainty', traditional: 'Variable', krishisetu: 'Escrow', strikeThrough: false },
  ]

  return (
    <section id="farmer-ledger" className="border-b border-border bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-16">

          {/* LEFT — editorial copy */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              The farmer's ledger
            </p>
            <h2 className="mt-3 font-display text-4xl leading-none sm:text-5xl">
              A ₹1,00,000 harvest should return ₹1,00,000.
            </h2>
            <p className="mt-5 text-sm leading-7 text-muted-foreground max-w-md">
              Not ₹89,000 after opaque commissions, cash handling, and customary deductions.
              This is the gap KrishiSetu eliminates.
            </p>
            <p className="mt-3 text-[11px] text-muted-foreground italic">
              Example trade calculation. Commission percentages are indicative industry averages, not guaranteed platform figures.
            </p>
            <div className="mt-6">
              <Button variant="farmer" size="xl" asChild>
                <Link to="/register/farmer">
                  Start selling direct <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>

          {/* RIGHT — comparison table */}
          <div className="border-y border-foreground/15">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-border py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              <span>Trade ledger</span>
              <span className="w-24 text-right sm:w-32">Traditional</span>
              <span className="w-20 text-right sm:w-28">KrishiSetu</span>
            </div>

            {/* Data rows */}
            {rows.map((row, idx) => (
              <ScrollPop
                key={row.label}
                delay={idx * 60}
                className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-border py-5 text-sm"
              >
                <span className="text-foreground">{row.label}</span>
                <span className={`w-24 text-right sm:w-32 ${
                  row.strikeThrough
                    ? 'text-muted-foreground line-through decoration-rose-500'
                    : 'text-muted-foreground'
                }`}>
                  {row.traditional}
                </span>
                <strong className={`w-20 text-right sm:w-28 ${
                  row.strikeThrough ? 'text-primary' : 'text-foreground'
                }`}>
                  {row.krishisetu}
                </strong>
              </ScrollPop>
            ))}

            {/* Totals row with Animated Counters */}
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 py-6">
              <strong className="font-display text-xl sm:text-2xl text-foreground">Farmer receives</strong>
              <span className="w-24 text-right sm:w-32">
                <AnimatedCounter value="₹89,000" className="font-display text-xl text-muted-foreground sm:text-2xl" />
              </span>
              <strong className="w-20 text-right sm:w-28">
                <AnimatedCounter value="₹1,00,000" className="font-display text-xl text-primary sm:text-2xl" />
              </strong>
            </div>

            {/* Savings callout */}
            <div className="mb-6 flex items-center justify-between bg-primary px-4 py-4 text-primary-foreground sm:px-5 rounded-xs shadow-md">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-trader" />
                <span className="text-xs font-semibold uppercase tracking-[0.12em]">Saved per harvest lot (example)</span>
              </div>
              <AnimatedCounter value="₹11,000" className="font-display text-3xl font-bold" />
            </div>

            {/* Trust note */}
            <div className="mb-4 flex items-center gap-2 text-[11px] text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-primary shrink-0" />
              100% of agreed trade value deposited into escrow before truck dispatch.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FarmerLedger
