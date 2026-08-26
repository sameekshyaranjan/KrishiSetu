import { Link } from 'react-router-dom'
import { Sprout, ExternalLink, ShieldCheck, Heart } from 'lucide-react'

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/40 text-foreground pt-12 pb-8">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Brand & Mission */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-foreground">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Sprout className="w-4 h-4" />
              </div>
              <span>KrishiSetu</span>
            </Link>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Bridging Indian farmers and verified agricultural traders through transparent real-time mandi intelligence, direct harvest discovery, and instant bidding.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Agmarknet & data.gov.in Integrated</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Market Intelligence
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Home Marketplace
                </Link>
              </li>
              <li>
                <Link to="/mandi-prices" className="hover:text-primary transition-colors">
                  Live APMC Mandi Rates
                </Link>
              </li>
              <li>
                <Link to="/schemes" className="hover:text-primary transition-colors">
                  Government Welfare Schemes
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary transition-colors">
                  Farmer / Trader Onboarding
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              User Portals
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/farmer/dashboard" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <span>🌾</span> Farmer Portal
                </Link>
              </li>
              <li>
                <Link to="/trader/dashboard" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <span>💼</span> Trader Procurement Console
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <span>🛡️</span> Admin Moderation Console
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary transition-colors">
                  Sign In to Your Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Official Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Official Data Sources
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <a 
                  href="https://agmarknet.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  Agmarknet Portal <ExternalLink className="w-3 h-3 text-muted-foreground/60" />
                </a>
              </li>
              <li>
                <a 
                  href="https://data.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  Open Government Data (data.gov.in) <ExternalLink className="w-3 h-3 text-muted-foreground/60" />
                </a>
              </li>
              <li>
                <a 
                  href="https://enam.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  National Agriculture Market (eNAM) <ExternalLink className="w-3 h-3 text-muted-foreground/60" />
                </a>
              </li>
              <li>
                <a 
                  href="https://pmkisan.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  PM-KISAN Samman Nidhi <ExternalLink className="w-3 h-3 text-muted-foreground/60" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} KrishiSetu. All rights reserved. Direct Agri-Trade Infrastructure.
          </p>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>for Indian Farmers & APMC Traders</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
