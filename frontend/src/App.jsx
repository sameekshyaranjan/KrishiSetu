import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import api from '@/services/api'
import useAuth from '@/hooks/useAuth'
import useSocket from '@/hooks/useSocket'
import { 
  CheckCircle2, 
  Server, 
  Sparkles, 
  Sprout, 
  AlertCircle, 
  UserCheck, 
  LogOut, 
  ShieldCheck,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react'

function App() {
  const [count, setCount] = useState(0)
  const [backendStatus, setBackendStatus] = useState({ loading: true, online: false, message: '' })
  
  const { user, isAuthenticated, role, setSession, logout, loading: authLoading } = useAuth()
  const { isConnected: isSocketConnected, socketUrl } = useSocket()

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await api.get('/health', { timeout: 3000 })
        setBackendStatus({ loading: false, online: true, message: res.data?.status || 'Connected' })
      } catch (err) {
        setBackendStatus({ 
          loading: false, 
          online: false, 
          message: err.code === 'ECONNABORTED' ? 'Timeout' : 'Offline / Unreachable' 
        })
      }
    }

    checkBackend()
  }, [])

  const handleMockLogin = (mockRole) => {
    const mockUser = {
      id: 'mock_123',
      name: mockRole === 'farmer' ? 'Ramesh Patel (Farmer)' : mockRole === 'trader' ? 'Karnataka Agro Traders' : 'Super Admin',
      email: `${mockRole}@krishisetu.in`,
      role: mockRole
    }
    setSession('mock_jwt_token_stage_82', mockUser)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-xl text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 border border-primary/20">
          <Sprout className="w-8 h-8 text-primary" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-1">
          KrishiSetu
        </h1>
        <p className="text-muted-foreground text-xs mb-5">
          Direct Farmer-to-Trader Marketplace & Mandi Intelligence
        </p>

        {/* Global Architecture Status */}
        <div className="bg-muted/50 rounded-xl p-4 border border-border mb-4 text-left space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-primary font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>useSocket Hook (Stage 82)</span>
            </div>
            
            <div className="flex items-center gap-1 text-xs font-semibold">
              <Server className="w-3.5 h-3.5" />
              {backendStatus.loading ? (
                <span className="text-muted-foreground">Checking...</span>
              ) : backendStatus.online ? (
                <span className="text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </span>
              ) : (
                <span className="text-amber-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Offline
                </span>
              )}
            </div>
          </div>

          {/* Real-Time WebSocket Channel Status */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Activity className="w-3.5 h-3.5 text-amber-500" />
              WebSocket Channel:
            </span>
            {isSocketConnected ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-medium border border-emerald-500/20">
                <Wifi className="w-3 h-3" /> Live
              </span>
            ) : isAuthenticated ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[11px] font-medium border border-amber-500/20">
                <Activity className="w-3 h-3 animate-spin" /> Connecting...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-medium border border-border">
                <WifiOff className="w-3 h-3" /> Standby (Auth Required)
              </span>
            )}
          </div>
          
          {/* Current Auth State */}
          <div className="pt-2 border-t border-border/50 text-xs">
            {authLoading ? (
              <p className="text-muted-foreground">Hydrating session...</p>
            ) : isAuthenticated ? (
              <div className="flex items-center justify-between bg-primary/10 p-2 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-primary" />
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{user?.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">Role: {role}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={logout} className="h-7 text-xs text-rose-500 hover:text-rose-600">
                  <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-background p-2 rounded-lg border border-border">
                <span className="text-muted-foreground">No active session (Guest)</span>
                <span className="text-[10px] uppercase font-bold text-amber-500">Unauthenticated</span>
              </div>
            )}
          </div>
        </div>

        {/* Mock Role Switcher for Testing */}
        <div className="mb-5 text-left">
          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Test useAuth & useSocket Handshake:
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <Button size="sm" variant={role === 'farmer' ? 'default' : 'outline'} onClick={() => handleMockLogin('farmer')} className="text-xs h-8">
              🌾 Farmer
            </Button>
            <Button size="sm" variant={role === 'trader' ? 'default' : 'outline'} onClick={() => handleMockLogin('trader')} className="text-xs h-8">
              💼 Trader
            </Button>
            <Button size="sm" variant={role === 'admin' ? 'default' : 'outline'} onClick={() => handleMockLogin('admin')} className="text-xs h-8">
              🛡️ Admin
            </Button>
          </div>
        </div>

        <Button 
          onClick={() => setCount((c) => c + 1)}
          className="w-full flex items-center justify-center gap-2 shadow-md"
        >
          <Sparkles className="w-4 h-4" />
          Interactive Counter: <span className="font-bold">{count}</span>
        </Button>
      </div>
    </div>
  )
}

export default App
