import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sprout, Briefcase, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'

export const Register = () => {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
          <Sparkles className="w-3.5 h-3.5" /> Join KrishiSetu Digital Agri-Market
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Choose Your Account Type
        </h1>
        <p className="text-muted-foreground text-sm">
          Select how you want to participate in India&apos;s direct farmer-trader intelligence ecosystem.
        </p>
      </div>

      {/* Choice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* Option 1: Farmer */}
        <div className="group relative rounded-3xl bg-card border-2 border-border hover:border-primary/60 p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-2xl font-bold border border-emerald-500/20 group-hover:scale-110 transition-transform">
              🌾
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-foreground">I am a Farmer</h2>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                  ಕೃಷಿಕ / किसान
                </span>
              </div>
              <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                For farmers, growers, and agricultural producers looking to sell crops directly at competitive market rates.
              </p>
            </div>

            {/* Benefits */}
            <ul className="space-y-2.5 pt-2 text-xs text-foreground/90">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Receive competitive bids from verified APMC traders</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Track live Agmarknet mandi rates & price alerts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero commission middlemen exploitation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>SMS & missed-call updates for low connectivity</span>
              </li>
            </ul>
          </div>

          <Button asChild size="lg" className="w-full rounded-2xl font-semibold shadow-md group-hover:shadow-primary/20">
            <Link to="/register/farmer">
              Register as Farmer <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Option 2: Trader */}
        <div className="group relative rounded-3xl bg-card border-2 border-border hover:border-amber-500/60 p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-2xl font-bold border border-amber-500/20 group-hover:scale-110 transition-transform">
              💼
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-foreground">I am a Trader</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[11px] font-bold">
                  ವ್ಯಾಪಾರಿ / व्यापारी
                </span>
              </div>
              <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                For licensed APMC commission agents, buyers, food processors, and bulk commodity traders.
              </p>
            </div>

            {/* Benefits */}
            <ul className="space-y-2.5 pt-2 text-xs text-foreground/90">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Direct access to verified farm-gate crop listings</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Place bids directly in real-time digital auctions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Verified buyer badge to build farmer trust</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Comprehensive quality specifications and photo inspection</span>
              </li>
            </ul>
          </div>

          <Button asChild size="lg" variant="secondary" className="w-full rounded-2xl font-semibold shadow-md bg-amber-500 text-white hover:bg-amber-600">
            <Link to="/register/trader">
              Register as Trader <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Existing Account Footer */}
      <div className="text-center pt-4 text-xs text-muted-foreground">
        Already have an active account?{' '}
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Sign In here
        </Link>
      </div>
    </div>
  )
}

export default Register
