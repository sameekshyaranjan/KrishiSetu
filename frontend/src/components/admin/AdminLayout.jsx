import { useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  LogOut, 
  Landmark, 
  TrendingUp, 
  Sparkles, 
  Menu, 
  X,
  Activity,
  Settings,
  Scale,
  ShoppingBag,
  Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const AdminLayout = () => {
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
        ? 'bg-purple-600 text-white shadow-sm'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
    }`

  const navItems = [
    { to: '/admin/dashboard', label: 'Command Center', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'User Directory & KYC', icon: Users },
    { to: '/admin/schemes', label: 'Government Schemes', icon: BookOpen },
    { to: '/admin/cess-audits', label: 'Market Cess & Escrow', icon: Landmark },
    { to: '/admin/price-intelligence', label: 'Price & Buffer Stock', icon: TrendingUp },
    { to: '/admin/disputes', label: 'Dispute Arbitration', icon: Scale },
    { to: '/admin/settings', label: 'Platform Policy & Settings', icon: Settings },
    { to: '/mandi-prices', label: 'Live Mandi Rates', icon: Activity },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-40">
        <Link to="/admin/dashboard" className="flex items-center gap-2 font-bold text-sm text-foreground">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 border border-purple-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="block leading-tight">KrishiSetu</span>
            <span className="text-[9px] uppercase font-bold text-purple-600 tracking-wider">Admin Console</span>
          </div>
        </Link>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card p-5 justify-between shrink-0 h-screen sticky top-0">
        <div className="space-y-6">
          {/* Logo & Platform Name */}
          <Link to="/" className="flex items-center gap-2.5 font-black text-lg text-foreground group">
            <div className="w-9 h-9 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 border border-purple-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight tracking-tight">KrishiSetu</span>
              <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">APMC State Admin</span>
            </div>
          </Link>

          {/* User State Pill */}
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              AD
            </div>
            <div className="truncate">
              <p className="font-extrabold text-xs text-foreground truncate">
                {user?.name || 'State APMC Officer'}
              </p>
              <p className="text-[10px] text-purple-600 font-medium truncate">
                Karnataka Nodal Officer
              </p>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={navLinkClass}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2 pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-2xl h-10 px-3.5"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex">
          <div className="w-4/5 max-w-xs bg-card h-full p-5 flex flex-col justify-between border-r border-border animate-in slide-in-from-left">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 font-bold text-base text-foreground">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 border border-purple-500/20">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>KrishiSetu Admin</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => setMobileOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileOpen(false)}
                    className={navLinkClass}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-2xl h-10 px-3.5"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
