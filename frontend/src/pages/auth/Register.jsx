import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export const Register = () => {
  return (
    <div className="py-16 px-5 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          Join KrishiSetu Digital Agri-Exchange
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-normal leading-tight text-foreground">
          Choose Your Account Type
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl mx-auto leading-relaxed">
          Direct commerce without the cartel. Select how you want to participate in Karnataka&apos;s verified agricultural network.
        </p>
      </div>

      {/* Choice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* Option 1: Farmer */}
        <div className="group relative rounded-md bg-card border border-border hover:border-primary/60 p-8 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="size-12 rounded-sm bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
              🌾
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-normal text-foreground">I am a Farmer</h2>
                <span className="px-2 py-0.5 rounded-sm bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                  ಕೃಷಿಕ / किसान
                </span>
              </div>
              <p className="text-muted-foreground text-xs mt-1.5 leading-relaxed">
                For farmers, growers, and agricultural producers looking to sell crops directly at competitive market rates with 0% brokerage.
              </p>
            </div>

            {/* Benefits */}
            <ul className="space-y-2.5 pt-2 text-xs text-foreground/90">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0" />
                <span>Receive competitive bids from verified APMC wholesale traders</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0" />
                <span>Track live Agmarknet mandi benchmark rates & price alerts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0" />
                <span>Zero commission middlemen deduction & bank-backed escrow payout</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0" />
                <span>Automated Bhoomi RTC land verification</span>
              </li>
            </ul>
          </div>

          <Button asChild variant="farmer" size="lg" className="w-full rounded-sm font-semibold shadow-xs text-xs h-10">
            <Link to="/register/farmer">
              Register as Farmer <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>

        {/* Option 2: Trader */}
        <div className="group relative rounded-md bg-card border border-border hover:border-trader/60 p-8 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="size-12 rounded-sm bg-trader/15 text-trader flex items-center justify-center text-2xl font-bold">
              💼
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-normal text-foreground">I am a Trader</h2>
                <span className="px-2 py-0.5 rounded-sm bg-trader/15 text-trader text-[10px] font-bold uppercase tracking-wider">
                  ವ್ಯಾಪಾರಿ / व्यापारी
                </span>
              </div>
              <p className="text-muted-foreground text-xs mt-1.5 leading-relaxed">
                For licensed APMC commission agents, buyers, food processors, and bulk commodity traders looking for verified farm-gate lots.
              </p>
            </div>

            {/* Benefits */}
            <ul className="space-y-2.5 pt-2 text-xs text-foreground/90">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-trader shrink-0" />
                <span>Direct access to verified farm-gate crop listings across Karnataka</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-trader shrink-0" />
                <span>Place bids directly in real-time digital trade floor</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-trader shrink-0" />
                <span>Verified APMC license credentials & digital weighbridge audit</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-trader shrink-0" />
                <span>Transparent dispute resolution and quality inspection reports</span>
              </li>
            </ul>
          </div>

          <Button asChild variant="trader" size="lg" className="w-full rounded-sm font-semibold shadow-xs text-xs h-10">
            <Link to="/register/trader">
              Register as Trader <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Existing Account Footer */}
      <div className="text-center pt-4 text-xs text-muted-foreground border-t border-border">
        Already have an active account?{' '}
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Sign In here
        </Link>
      </div>
    </div>
  )
}

export default Register
