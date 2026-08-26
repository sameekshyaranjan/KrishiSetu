import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { 
  Sprout, 
  Menu, 
  X, 
  TrendingUp, 
  BookOpen, 
  UserCheck, 
  LogOut, 
  LayoutDashboard, 
  ShieldCheck, 
  Briefcase,
  CloudSun
} from 'lucide-react'

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, role, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
    navigate('/login')
  }

  const getDashboardPath = () => {
    const currentRole = role || user?.role
    if (currentRole === 'trader') return '/trader/dashboard'
    if (currentRole === 'admin') return '/admin/dashboard'
    return '/farmer/dashboard'
  }

  const navLinkClasses = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary/10 text-primary font-semibold'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
    }`

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-foreground group">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-105 transition-transform">
            <Sprout className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="leading-tight tracking-tight">KrishiSetu</span>
            <span className="text-[10px] text-muted-foreground font-normal">Agri Intelligence</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          <NavLink to="/" end className={navLinkClasses}>
            Home
          </NavLink>
          <NavLink to="/mandi-prices" className={navLinkClasses}>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Mandi Prices
            </span>
          </NavLink>
          <NavLink to="/schemes" className={navLinkClasses}>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-500" />
              Govt Schemes
            </span>
          </NavLink>
          <NavLink to="/farmer/weather" className={navLinkClasses}>
            <span className="flex items-center gap-1.5">
              <CloudSun className="w-4 h-4 text-sky-500" />
              Weather Radar
            </span>
          </NavLink>
        </nav>

        {/* Desktop Authentication Controls */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link 
                to={getDashboardPath()} 
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border hover:border-primary/50 transition-all text-xs font-semibold text-foreground shadow-sm"
              >
                {role === 'farmer' && <Sprout className="w-3.5 h-3.5 text-primary" />}
                {role === 'trader' && <Briefcase className="w-3.5 h-3.5 text-amber-600" />}
                {role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />}
                <span className="truncate max-w-[120px]">{user?.name || 'My Portal'}</span>
              </Link>

              <Button 
                asChild 
                size="sm" 
                className="rounded-xl text-xs h-8 shadow-sm font-medium"
              >
                <Link to={getDashboardPath()}>
                  <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" /> Dashboard
                </Link>
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="rounded-xl text-xs h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs h-8 font-medium">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="rounded-xl text-xs h-8 shadow-sm font-semibold">
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 h-9 w-9 text-muted-foreground hover:text-foreground"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-card/95 backdrop-blur px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
            >
              Home
            </Link>
            <Link
              to="/mandi-prices"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
            >
              Live Mandi Rates
            </Link>
            <Link
              to="/schemes"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
            >
              Government Schemes
            </Link>
            <Link
              to="/farmer/weather"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted flex items-center gap-2"
            >
              <CloudSun className="w-4 h-4 text-sky-500" />
              <span>Weather Radar & Advisory</span>
            </Link>
          </nav>

          <div className="pt-3 border-t border-border flex flex-col space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" size="sm" className="w-full rounded-xl">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild size="sm" className="w-full rounded-xl">
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    Register
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
