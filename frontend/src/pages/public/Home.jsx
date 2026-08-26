import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sprout, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react'

export const Home = () => {
  return (
    <div className="py-16 px-4 md:px-8 max-w-5xl mx-auto text-center space-y-8">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
        <Sprout className="w-3.5 h-3.5" /> India&apos;s Direct Agri Marketplace & Intelligence Platform
      </div>

      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
        Empowering Farmers with <span className="text-primary">Real-Time Mandi Rates</span> & Direct Bidding
      </h1>

      <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
        Eliminate exploitative middlemen. List your harvest directly, receive competitive bids from verified traders, and track live wholesale APMC prices across Karnataka and India.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <Button asChild size="lg" className="rounded-xl shadow-lg font-semibold">
          <Link to="/register">
            Get Started as Farmer / Trader <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-xl font-semibold">
          <Link to="/mandi-prices">
            <TrendingUp className="w-4 h-4 mr-2 text-primary" /> View Live Mandi Prices
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
        <div className="p-6 rounded-2xl bg-card border border-border space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            🌾
          </div>
          <h3 className="font-bold text-foreground">Direct Farmer Bidding</h3>
          <p className="text-muted-foreground text-xs leading-relaxed">List crops with high-res photos and receive real-time bids directly from licensed traders.</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            📈
          </div>
          <h3 className="font-bold text-foreground">Mandi Intelligence</h3>
          <p className="text-muted-foreground text-xs leading-relaxed">Daily price arrivals and commodity rates fetched directly from Agmarknet & data.gov.in.</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-bold text-foreground">Verified Trader Network</h3>
          <p className="text-muted-foreground text-xs leading-relaxed">Admin-verified GST and APMC trader licenses guarantee payment and contract safety.</p>
        </div>
      </div>
    </div>
  )
}

export default Home
