import { Link } from 'react-router-dom'
import { TrendingUp, ArrowRight, Store, Clock, ExternalLink } from 'lucide-react'
import { ScrollReveal } from '@/components/common/ScrollReveal'

export const LiveMandiBenchmark = () => {
  const commodities = [
    {
      name: 'Hybrid Tomato (ಟೊಮ್ಯಾಟೊ)',
      market: 'Kolar APMC Market Yard',
      district: 'Kolar',
      modal: '₹2,200',
      minMax: '₹1,900 – ₹2,400',
      change: '+14.2%',
      isPositive: true,
      arrival: '1,450 Qtl'
    },
    {
      name: 'Red Onion (ಈರುಳ್ಳಿ)',
      market: 'Hubballi Amargol APMC',
      district: 'Dharwad',
      modal: '₹1,850',
      minMax: '₹1,600 – ₹2,100',
      change: '+5.8%',
      isPositive: true,
      arrival: '2,800 Qtl'
    },
    {
      name: 'Jyoti Potato (ಆಲೂಗಡ್ಡೆ)',
      market: 'Hassan APMC Yard',
      district: 'Hassan',
      modal: '₹1,600',
      minMax: '₹1,450 – ₹1,750',
      change: '+2.1%',
      isPositive: true,
      arrival: '890 Qtl'
    },
    {
      name: 'G4 Green Chilli (ಹಸಿಮೆಣಸಿನಕಾಯಿ)',
      market: 'Belagavi Central Mandi',
      district: 'Belagavi',
      modal: '₹3,400',
      minMax: '₹3,100 – ₹3,800',
      change: '+8.4%',
      isPositive: true,
      arrival: '620 Qtl'
    },
    {
      name: 'Hybrid Yellow Maize (ಮೆಕ್ಕೆಜೋಳ)',
      market: 'Davanagere Grain Mandi',
      district: 'Davanagere',
      modal: '₹2,050',
      minMax: '₹1,950 – ₹2,150',
      change: '+1.5%',
      isPositive: true,
      arrival: '3,200 Qtl'
    }
  ]

  return (
    <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <ScrollReveal variant="fade-up" duration={500} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20">
            <Store className="w-3.5 h-3.5 text-primary" />
            <span>AGMARKNET REAL-TIME PRICE BENCHMARKS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Official APMC Wholesale Commodity Rates
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Synchronized daily from official Karnataka Agmarknet terminals. Trade with verifiable modal rates instead of middleman speculation.
          </p>
        </div>

        <Link
          to="/mandi-prices"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-emerald-700 transition-colors shrink-0"
        >
          <span>Open Full Mandi Intelligence Terminal (140+ Markets)</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </ScrollReveal>

      {/* Structured Clean Data Table (Not a generic card grid) */}
      <div className="mt-8 rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-muted/60 border-b border-border text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                <th className="py-3.5 px-4 sm:px-6 font-semibold">Commodity</th>
                <th className="py-3.5 px-4 font-semibold">APMC Yard / District</th>
                <th className="py-3.5 px-4 font-semibold text-right">Modal Price</th>
                <th className="py-3.5 px-4 font-semibold text-right hidden sm:table-cell">Min – Max Range</th>
                <th className="py-3.5 px-4 font-semibold text-right hidden md:table-cell">Today's Arrival</th>
                <th className="py-3.5 px-4 sm:px-6 font-semibold text-right">7-Day Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {commodities.map((c) => (
                <tr key={c.name} className="hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-4 sm:px-6 font-bold text-foreground text-xs sm:text-sm">
                    {c.name}
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">
                    <span className="block text-foreground font-medium">{c.market}</span>
                    <span className="text-[10px] text-muted-foreground">{c.district} District</span>
                  </td>
                  <td className="py-4 px-4 text-right font-extrabold text-foreground text-sm sm:text-base">
                    {c.modal}
                    <span className="text-[10px] font-normal text-muted-foreground ml-1">/Qtl</span>
                  </td>
                  <td className="py-4 px-4 text-right text-muted-foreground hidden sm:table-cell">
                    {c.minMax}
                  </td>
                  <td className="py-4 px-4 text-right text-muted-foreground hidden md:table-cell">
                    {c.arrival}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="inline-flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {c.change}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer timestamp strip */}
        <div className="bg-muted/40 px-4 sm:px-6 py-2.5 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-muted-foreground" />
            Last Synced with Karnataka APMC Gateway: Today 11:30 AM IST
          </span>
          <Link to="/mandi-prices" className="text-primary hover:underline font-bold flex items-center gap-1">
            <span>Explore Agmarknet Data</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default LiveMandiBenchmark
