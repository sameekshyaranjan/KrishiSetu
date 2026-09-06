import { Link } from 'react-router-dom'
import { 
  Sprout, 
  Briefcase, 
  ArrowRight, 
  TrendingUp, 
  Landmark, 
  Sparkles 
} from 'lucide-react'
import { ScrollReveal } from '@/components/common/ScrollReveal'
import ProductPreview from '@/components/home/ProductPreview'
import TrustMetrics from '@/components/home/TrustMetrics'
import SupplyChainStory from '@/components/home/SupplyChainStory'
import BentoFeatures from '@/components/home/BentoFeatures'
import HowItWorks from '@/components/home/HowItWorks'
import ConversionBanner from '@/components/home/ConversionBanner'

export const Home = () => {
  return (
    <div className="space-y-12 sm:space-y-16 py-6 pb-20 overflow-x-hidden">
      
      {/* 1. Hero Main Section */}
      <section className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-4 sm:pt-8">
        
        {/* Top Feature Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-sm mb-6 animate-in fade-in duration-500">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Direct Farmer-to-Trader Digital Agri Marketplace</span>
        </div>

        {/* Dynamic Main Headline (H1) */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.15] animate-in fade-in slide-in-from-bottom-2 duration-500">
          Direct Farm Sales with{' '}
          <span className="text-emerald-700 dark:text-emerald-400">Zero Broker Fees</span>{' '}
          & Live Mandi Rates
        </h1>

        {/* Supporting Sub-headline */}
        <p className="mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
          Eliminate exploitative middlemen. List your harvest directly from Karnataka farms, receive competitive bids from licensed APMC buyers, and track real-time Agmarknet wholesale rates.
        </p>

        {/* Dual Persona Interactive Call-to-Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          {/* Farmer Primary CTA */}
          <Link 
            to="/register/farmer"
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-base shadow-sm hover:shadow-md transition-all group"
          >
            <Sprout className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Sell as Farmer <span lang="kn" className="text-xs font-normal opacity-90 ml-1">(ಕೃಷಿಕ)</span></span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </Link>

          {/* Trader Commercial CTA */}
          <Link 
            to="/register/trader"
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-base shadow-sm hover:shadow-md transition-all group"
          >
            <Briefcase className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Procure as Trader <span lang="kn" className="text-xs font-normal opacity-90 ml-1">(ವ್ಯಾಪಾರಿ)</span></span>
          </Link>
        </div>

        {/* Auxiliary Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-5 text-xs font-medium text-muted-foreground animate-in fade-in duration-500 delay-200">
          <Link 
            to="/mandi-prices" 
            className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> 
            <span>View Live Mandi Prices ↗</span>
          </Link>
          <span className="text-border">•</span>
          <Link 
            to="/schemes" 
            className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
          >
            <Landmark className="w-3.5 h-3.5 text-amber-500" /> 
            <span>Govt Welfare Schemes ↗</span>
          </Link>
        </div>

        {/* 2. Real-World Agricultural Supply Chain Slideshow (FARM -> MARKET -> BUYER -> TRADE) */}
        <ScrollReveal variant="scale-up" delay={50} duration={700}>
          <SupplyChainStory />
        </ScrollReveal>
      </section>

      {/* 3. Verified Trust Metrics Bar */}
      <TrustMetrics />

      {/* 4. Live Trading Console & Product Benchmark */}
      <section className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductPreview />
      </section>

      {/* 5. Enterprise Bento Feature Grid */}
      <BentoFeatures />

      {/* 5. Step-by-Step 4-Step Process */}
      <HowItWorks />

      {/* 6. High-Conversion Pre-Footer Call to Action */}
      <ConversionBanner />

    </div>
  )
}

export default Home
