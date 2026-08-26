import useAuth from '@/hooks/useAuth'
import { Briefcase, ShoppingCart, Gavel, CheckCircle2 } from 'lucide-react'

export const TraderDashboard = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
          Welcome back, {user?.name || 'Trader'} 💼
        </h1>
        <p className="text-muted-foreground text-xs">
          Discover verified farm listings, place live bids, and manage harvest procurement contracts.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Market Listings</span>
            <ShoppingCart className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">48 Available</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">My Active Bids</span>
            <Gavel className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">5 Bids</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">KYC Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">Verified</p>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-card border border-border text-center text-muted-foreground text-xs">
        💼 Trader Crop Marketplace & Bidding Console will be built in Stage 125-135.
      </div>
    </div>
  )
}

export default TraderDashboard
