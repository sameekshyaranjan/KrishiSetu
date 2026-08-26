import { Link, useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Sprout, ShieldCheck, UserCheck } from 'lucide-react'

export const Login = () => {
  const { setSession } = useAuth()
  const navigate = useNavigate()

  const handleQuickLogin = (role) => {
    const mockUser = {
      id: 'usr_123',
      name: role === 'farmer' ? 'Ramesh Kumar (Farmer)' : role === 'trader' ? 'Karnataka Agro Traders' : 'Super Admin',
      email: `${role}@krishisetu.in`,
      role
    }
    setSession('jwt_token_verified', mockUser)
    navigate(role === 'farmer' ? '/farmer/dashboard' : role === 'trader' ? '/trader/dashboard' : '/admin/dashboard')
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-xl text-center space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary border border-primary/20">
          <Sprout className="w-7 h-7" />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sign in to KrishiSetu</h1>
          <p className="text-muted-foreground text-xs mt-1">Access your personalized portal & real-time bids</p>
        </div>

        <div className="p-4 rounded-xl bg-muted/50 border border-border text-left space-y-2">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Select Role to Test Protected Routes:
          </p>
          <div className="grid grid-cols-1 gap-2 pt-1">
            <Button onClick={() => handleQuickLogin('farmer')} className="justify-start gap-2 h-10">
              🌾 Continue as Farmer
            </Button>
            <Button onClick={() => handleQuickLogin('trader')} variant="secondary" className="justify-start gap-2 h-10">
              💼 Continue as Trader
            </Button>
            <Button onClick={() => handleQuickLogin('admin')} variant="outline" className="justify-start gap-2 h-10">
              🛡️ Continue as Admin
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account? <Link to="/register" className="text-primary font-semibold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
