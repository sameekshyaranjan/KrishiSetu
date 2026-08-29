import { useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { 
  Briefcase, 
  LayoutDashboard, 
  ShoppingCart, 
  Gavel, 
  LogOut, 
  Radio, 
  Truck, 
  DollarSign, 
  FileText, 
  ShieldCheck, 
  Menu, 
  X,
  TrendingUp,
  Landmark,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const TraderLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-amber-600 text-white shadow-sm'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
    }`

  const navItems = [
    { to: '/trader/dashboard', label: 'Trader Command Center', icon: LayoutDashboard, end: true },
    { to: '/trader/marketplace', label: 'Crop Marketplace', icon: ShoppingCart },
    { to: '/trader/my-bids', label: 'My Active Bids', icon: Gavel },
    { to: '/trader/escrow', label: 'Escrow Vault & Wallet', icon: Landmark },
    { to: '/trader/orders', label: 'Procurement Shipments', icon: Truck },
    { to: '/trader/invoices', label: 'Mandi Invoices & Tax', icon: FileText },
    { to: '/trader/notifications', label: 'Alerts & Messages', icon: Bell },
    { to: '/mandi-prices', label: 'Live Mandi Rates', icon: TrendingUp },
    { to: '/trader/profile', label: 'APMC License & KYC', icon: ShieldCheck },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-40">
        <Link to="/trader/dashboard" className="flex items-center gap-2 font-bold text-sm text-foreground">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <span className="block leading-tight">KrishiSetu</span>
            <span className="text-[9px] uppercase font-bold text-amber-600 tracking-wider">Trader Portal</span>
          </div>
        </Link>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 h-9 w-9 text-muted-foreground"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

      {/* Mobile Sidebar Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-b border-border bg-card p-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={navLinkClass}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
          <div className="pt-3 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Trader Sidebar */}
      <aside className="w-64 border-r border-border bg-card p-6 flex-col justify-between hidden md:flex shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="space-y-6">
          
          {/* Logo & Portal Header */}
          <Link to="/trader/dashboard" className="flex items-center gap-2.5 font-bold text-lg text-foreground">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20 shadow-sm">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="block leading-tight tracking-tight">KrishiSetu</span>
              <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Trader Portal</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={navLinkClass}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* User Profile Card & Logout */}
        <div className="pt-4 border-t border-border space-y-3">
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 text-xs space-y-0.5">
            <p className="font-extrabold text-foreground truncate">{user?.name || 'Karnataka Agro Traders'}</p>
            <p className="text-[11px] text-amber-600 font-semibold truncate">APMC License: Verified</p>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout} 
            className="w-full rounded-xl text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 shadow-sm h-9"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default TraderLayout
