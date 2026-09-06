import { UploadCloud, Gavel, Lock, Banknote, ArrowRight } from 'lucide-react'

export const HowItWorks = () => {
  const steps = [
    {
      step: '01',
      title: 'List Crop in 60s',
      desc: 'Snap photos of your lot, specify quintals, harvest readiness, and set your baseline reserve price.',
      icon: UploadCloud,
      color: 'text-emerald-600 bg-emerald-500/10'
    },
    {
      step: '02',
      title: 'Receive Live Bids',
      desc: 'Licensed APMC traders across Karnataka compete. Review bids and counter-offers in real-time.',
      icon: Gavel,
      color: 'text-amber-600 bg-amber-500/10'
    },
    {
      step: '03',
      title: 'Escrow Protection',
      desc: 'Buyer deposits 100% of agreed value into secure escrow before taking physical delivery.',
      icon: Lock,
      color: 'text-blue-600 bg-blue-500/10'
    },
    {
      step: '04',
      title: 'Instant Direct Payout',
      desc: 'Upon delivery verification at the APMC yard, funds release directly to your Aadhaar-linked bank account.',
      icon: Banknote,
      color: 'text-purple-600 bg-purple-500/10'
    }
  ]

  return (
    <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-primary">
          HOW KRISHISETU WORKS
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Simple 4-Step Process: From Harvest to Direct Bank Settlement
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Designed for smooth operation on basic smartphones in both rural field conditions and wholesale APMC offices.
        </p>
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((item, index) => {
          const Icon = item.icon
          return (
            <div 
              key={item.step}
              className="p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-sm hover:border-primary/50 transition-all space-y-5 relative flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Step Badge */}
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-mono font-black text-xs flex items-center justify-center border border-primary/20">
                    {item.step}
                  </span>
                  <div className={`w-11 h-11 rounded-2xl ${item.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Step Title and Description */}
                <div className="space-y-2">
                  <h3 className="font-bold text-base sm:text-lg text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Progress indicator connector arrow for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-muted-foreground/30">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default HowItWorks
