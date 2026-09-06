import { Building2, DollarSign, Sprout, ShieldCheck } from 'lucide-react'

export const TrustMetrics = () => {
  const metrics = [
    {
      id: 'mandis',
      value: '140+',
      label: 'APMC Mandis',
      subtext: 'Active across 31 Karnataka districts',
      icon: Building2,
      accent: 'text-primary'
    },
    {
      id: 'commission',
      value: '₹0',
      label: 'Commission Fee',
      subtext: '100% of bid price delivered to farmer',
      icon: DollarSign,
      accent: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      id: 'crops',
      value: '60+',
      label: 'Commodities Tracked',
      subtext: 'Vegetables, pulses, grains, & spices',
      icon: Sprout,
      accent: 'text-amber-500'
    },
    {
      id: 'buyers',
      value: '100%',
      label: 'Verified APMC Buyers',
      subtext: 'GST and APMC market license audited',
      icon: ShieldCheck,
      accent: 'text-purple-600 dark:text-purple-400'
    }
  ]

  return (
    <section className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-10 sm:my-14">
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y lg:divide-y-0 lg:divide-x divide-border/60">
        {metrics.map((m, idx) => {
          const Icon = m.icon
          return (
            <div 
              key={m.id} 
              className={`space-y-2 text-center flex flex-col items-center justify-center ${
                idx > 0 && idx % 2 === 0 ? 'pt-6 lg:pt-0' : idx === 1 ? 'pt-0' : idx > 1 ? 'pt-6 lg:pt-0' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground mb-1">
                <Icon className={`w-4 h-4 ${m.accent}`} />
              </div>
              <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-mono ${m.accent}`}>
                {m.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">
                {m.label}
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground max-w-[180px] leading-relaxed">
                {m.subtext}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default TrustMetrics
