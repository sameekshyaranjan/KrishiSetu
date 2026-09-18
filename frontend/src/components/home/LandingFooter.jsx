import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Sprout,
  TrendingUp,
  BookOpen,
  Snowflake,
  CloudSun,
  ShieldCheck,
  BadgeCheck,
  IndianRupee,
  Scale,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const LandingFooter = () => {
  return (
    <>
      {/* ── Final CTA Banner ── */}
      <section className="bg-primary py-16 text-primary-foreground lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground/60">
              Trade without the middle layer
            </p>
            <h2 className="mt-3 max-w-3xl font-display text-4xl leading-none sm:text-5xl">
              Your next harvest can reach the market directly.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button variant="trader" size="xl" asChild>
              <Link to="/register/farmer">
                Sell Harvest / ಬೆಳೆ ಮಾರಾಟ <ArrowRight />
              </Link>
            </Button>
            <Button variant="inverse" size="xl" asChild>
              <Link to="/register/trader">
                Procure Produce / ಖರೀದಿ <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section className="border-b border-border bg-background py-12">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-8">
            Institutional trust at every stage
          </p>
          <div className="grid grid-cols-2 gap-y-8 md:grid-cols-4">
            {[
              [BadgeCheck, 'APMC license verified', 'Buyer identity confirmed'],
              [IndianRupee, 'Bank-backed escrow', 'Funds locked before pickup'],
              [Scale, 'Digital weight audit', 'Tamper-evident receipts'],
              [ShieldCheck, 'Dispute resolution', 'Evidence-led process'],
            ].map(([Icon, title, copy]) => (
              <div key={title} className="border-l border-border px-5 first:border-l-0">
                <Icon className="size-5 text-primary" />
                <h3 className="mt-2.5 text-xs font-bold text-foreground">{title}</h3>
                <p className="mt-1 text-[10px] leading-5 text-muted-foreground">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-background py-10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-start">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded-sm bg-primary text-primary-foreground">
                  <Sprout className="size-4" />
                </div>
                <span className="font-display text-xl font-semibold">KrishiSetu</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground max-w-xs">
                Direct agricultural commerce for Karnataka. Connecting farmers and licensed APMC traders.
              </p>

              {/* Navigation links — all real KrishiSetu routes */}
              <nav className="mt-5 flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer navigation">
                {[
                  [TrendingUp, 'Mandi Prices', '/mandi-prices'],
                  [BookOpen, 'Govt Schemes', '/schemes'],
                  [Snowflake, 'Cold Storage', '/cold-storage'],
                  [CloudSun, 'Weather Radar', '/farmer/weather'],
                  [Sprout, 'Farmer Portal', '/register/farmer'],
                  [BadgeCheck, 'Trader Portal', '/register/trader'],
                  [ShieldCheck, 'Sign In', '/login'],
                ].map(([Icon, label, to]) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon className="size-3.5" />
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Legal */}
            <div className="text-xs text-muted-foreground sm:text-right">
              <p>Market data shown for product demonstration.</p>
              <p className="mt-1">© 2026 KrishiSetu Exchange · Karnataka, India</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default LandingFooter
