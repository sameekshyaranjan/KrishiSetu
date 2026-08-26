import useAuth from '@/hooks/useAuth'
import { Sprout, TrendingUp, Layers, CheckCircle2 } from 'lucide-react'

export const FarmerDashboard = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
          Welcome back, {user?.name || 'Farmer'} 🌾
        </h1>
        <p className="text-muted-foreground text-xs">
          Manage your active crop listings, view incoming trader bids, and track mandi price trends.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Listings</span>
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">3 Crops</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Live Trader Bids</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">12 Bids</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Completed Sales</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">₹1,45,000</p>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-card border border-border text-center text-muted-foreground text-xs">
        🌾 Farmer Crop Management & Real-Time Bidding Table will be built in Stage 110-120.
      </div>
    </div>
  )
}

export default FarmerDashboard
