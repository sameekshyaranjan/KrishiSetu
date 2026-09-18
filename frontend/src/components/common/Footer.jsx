import { Link } from 'react-router-dom'
import { 
  Sprout, 
  BadgeCheck, 
  IndianRupee, 
  Scale, 
  ShieldCheck 
} from 'lucide-react'

export const Footer = () => {
  return (
    <>
      {/* ── Institutional Trust Strip (Matching Landing Page) ── */}
      <section className="border-t border-b border-border bg-background py-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-6 px-5 md:grid-cols-4 lg:px-8">
          {[
            [BadgeCheck, 'APMC license verified'],
            [IndianRupee, 'Bank-backed escrow'],
            [Scale, 'Digital weight audit'],
            [ShieldCheck, 'Dispute resolution'],
          ].map(([Icon, label], index) => {
            const TrustIcon = Icon
            return (
              <div
                key={label}
                className={`flex items-center gap-3 px-3 ${
                  index > 0 ? 'border-l border-border' : ''
                }`}
              >
                <TrustIcon className="size-5 shrink-0 text-primary" />
                <span className="text-xs font-bold text-foreground">{label}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Exact Landing Page Canonical Footer ── */}
      <footer className="bg-surface-strong py-12 text-surface-strong-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[1fr_auto] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center bg-primary text-primary-foreground rounded-sm">
                <Sprout className="size-5" />
              </span>
              <span className="font-display text-2xl">KrishiSetu</span>
            </div>
            <p className="mt-4 max-w-sm text-xs leading-6 text-primary-foreground/55">
              Direct agricultural commerce for Karnataka farmers and licensed APMC wholesale traders.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-10 gap-y-3 text-xs text-primary-foreground/70 sm:grid-cols-4" aria-label="Footer navigation">
            <Link to="/" className="hover:text-trader transition-colors">Home</Link>
            <Link to="/mandi-prices" className="hover:text-trader transition-colors">Mandi prices</Link>
            <Link to="/schemes" className="hover:text-trader transition-colors">Govt schemes</Link>
            <Link to="/cold-storage" className="hover:text-trader transition-colors">Cold storage</Link>
          </nav>
        </div>
        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-2 border-t border-primary-foreground/10 px-5 pt-6 text-[10px] text-primary-foreground/45 sm:flex-row sm:justify-between lg:px-8">
          <p>Market, facility, scheme, and weather data shown for product demonstration.</p>
          <p>© 2026 KrishiSetu Exchange</p>
        </div>
      </footer>
    </>
  )
}

export default Footer
