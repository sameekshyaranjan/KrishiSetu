import { Outlet, Link, useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { Sprout, LayoutDashboard, PlusCircle, Layers, LogOut, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const FarmerLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Farmer Sidebar */}
      <aside className="w-64 border-r border-border bg-card p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          <Link to="/farmer/dashboard" className="flex items-center gap-2.5 font-bold text-lg text-foreground">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Sprout className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="block leading-tight">KrishiSetu</span>
              <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Farmer Portal</span>
            </div>
          </Link>

          <nav className="space-y-1 text-sm font-medium">
            <Link to="/farmer/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-semibold">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link to="/farmer/add-crop" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <PlusCircle className="w-4 h-4" />
              <span>List New Crop</span>
            </Link>
            <Link to="/farmer/my-crops" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <Layers className="w-4 h-4" />
              <span>My Crops & Bids</span>
            </Link>
            <Link to="/mandi-prices" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <Radio className="w-4 h-4 text-amber-500" />
              <span>Live Mandi Rates</span>
            </Link>
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="pt-4 border-t border-border space-y-3">
          <div className="text-xs">
            <p className="font-semibold text-foreground truncate">{user?.name || 'Farmer Ramesh'}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email || 'farmer@krishisetu.in'}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="w-full text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
            <LogOut className="w-3.5 h-3.5 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default FarmerLayout
