import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Sprout, Menu, X } from 'lucide-react'

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isAuthenticated, role, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    setMenuOpen(false)
    navigate('/login')
  }

  const getDashboardPath = () => {
    const currentRole = role || user?.role
    if (currentRole === 'trader') return '/trader/dashboard'
    if (currentRole === 'admin') return '/admin/dashboard'
    return '/farmer/dashboard'
  }

  const navLinkClass = ({ isActive }) =>
    `py-2 transition-colors hover:text-primary ${isActive ? 'text-primary font-bold' : 'text-foreground'}`

  const mobileNavLinkClass = ({ isActive }) =>
    `border-b border-border py-4 transition-colors hover:text-primary ${isActive ? 'text-primary font-bold' : 'text-foreground'}`

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background shadow-xs">
      <div className="mx-auto grid h-18 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center px-5 lg:grid-cols-[auto_1fr_auto] lg:px-8">
        
        {/* Exact Landing Page Logo */}
        <Link 
          to="/" 
          className="flex min-w-0 items-center gap-3" 
          aria-label="KrishiSetu home"
          onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-primary text-primary-foreground">
            <Sprout className="size-5" />
          </span>
          <span className="min-w-0">
            <strong className="block truncate font-display text-2xl leading-none">KrishiSetu</strong>
            <span className="mt-1 block truncate text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Karnataka Agri Exchange
            </span>
          </span>
        </Link>

        {/* Exact Landing Page Canonical Center Links */}
        <nav className="hidden justify-center gap-7 text-[11px] font-bold uppercase tracking-[0.13em] lg:flex" aria-label="Main navigation">
          <NavLink 
            to="/" 
            end 
            className={navLinkClass}
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
          >
            Home
          </NavLink>
          <NavLink to="/mandi-prices" className={navLinkClass}>
            Mandi Prices
          </NavLink>
          <NavLink to="/schemes" className={navLinkClass}>
            Govt Schemes
          </NavLink>
          <NavLink to="/cold-storage" className={navLinkClass}>
            Cold Storage
          </NavLink>
        </nav>

        {/* Exact Landing Page Auth CTAs */}
        <div className="hidden items-center gap-2 lg:flex">
          {isAuthenticated ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to={getDashboardPath()}>{user?.name || 'Dashboard'}</Link>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-destructive hover:bg-destructive/10 text-xs"
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button variant="farmer" size="sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </Button>
      </div>

      {/* Exact Landing Page Mobile Navigation Sheet */}
      {menuOpen && (
        <nav className="grid border-t border-border bg-background px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] lg:hidden" aria-label="Mobile navigation">
          <NavLink 
            to="/" 
            end 
            onClick={() => {
              setMenuOpen(false)
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
            }} 
            className={mobileNavLinkClass}
          >
            Home
          </NavLink>
          <NavLink to="/mandi-prices" onClick={() => setMenuOpen(false)} className={mobileNavLinkClass}>
            Mandi Prices
          </NavLink>
          <NavLink to="/schemes" onClick={() => setMenuOpen(false)} className={mobileNavLinkClass}>
            Govt Schemes
          </NavLink>
          <NavLink to="/cold-storage" onClick={() => setMenuOpen(false)} className={mobileNavLinkClass}>
            Cold Storage
          </NavLink>
          <div className="grid grid-cols-2 gap-2 pt-4">
            {isAuthenticated ? (
              <>
                <Button variant="outline" asChild>
                  <Link to={getDashboardPath()} onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="text-destructive"
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button variant="farmer" asChild>
                  <Link to="/register" onClick={() => setMenuOpen(false)}>
                    Register
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}

export default Navbar
