import { Link } from 'react-router-dom'
import { Sprout, Briefcase, ArrowRight, ShieldCheck } from 'lucide-react'
import { ScrollReveal } from '@/components/common/ScrollReveal'

export const ConversionBanner = () => {
  return (
    <section className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <ScrollReveal variant="scale-up" duration={600}>
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-emerald-900/50 shadow-2xl text-center relative overflow-hidden space-y-8">
          
          {/* Subtle agricultural logistics background photo with deep gradient overlay */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img 
              src="/images/logistics_produce_truck.jpg" 
              alt="Agricultural Logistics" 
              className="w-full h-full object-cover object-center opacity-15 mix-blend-luminosity scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-emerald-950/90"></div>
          </div>

          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <ScrollReveal variant="fade-up" delay={50} duration={500} className="space-y-3 max-w-2xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold tracking-wider uppercase">
              <span>GET STARTED IN 60 SECONDS</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Ready to Maximize Your Agricultural Trade?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Join Karnataka farmers and licensed APMC traders already trading transparently on KrishiSetu with 0% middleman commission.
            </p>
          </ScrollReveal>

          {/* Dual Persona Buttons */}
          <ScrollReveal variant="fade-up" delay={150} duration={500} className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto relative z-10">
            <Link 
              to="/register/farmer" 
              className="w-full sm:w-auto flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-all group"
            >
              <Sprout className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Register as Farmer <span lang="kn" className="text-xs font-normal opacity-90">(ಕೃಷಿಕ)</span></span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Link>

            <Link 
              to="/register/trader" 
              className="w-full sm:w-auto flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg transition-all group"
            >
              <Briefcase className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Register as Trader <span lang="kn" className="text-xs font-normal opacity-90">(ವ್ಯಾಪಾರಿ)</span></span>
            </Link>
          </ScrollReveal>

          {/* Trust confirmation footer */}
          <ScrollReveal variant="fade-up" delay={220} duration={500} className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 pt-2 relative z-10">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Aadhaar & APMC Verified
            </span>
            <span>•</span>
            <span>0% Platform Commission</span>
            <span>•</span>
            <span>Fast Bank Settlement</span>
          </ScrollReveal>

        </div>
      </ScrollReveal>
    </section>
  )
}

export default ConversionBanner
