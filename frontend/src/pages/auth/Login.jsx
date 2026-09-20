import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import useAuth from '@/hooks/useAuth'
import authService from '@/services/authService'
import { Button } from '@/components/ui/button'
import { 
  Sprout, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  KeyRound, 
  Sparkles, 
  ShieldCheck, 
  Radio, 
  ArrowRight,
  Briefcase
} from 'lucide-react'
import toast from 'react-hot-toast'

export const Login = () => {
  const [authMode, setAuthMode] = useState('password') // 'password' | 'otp' | 'admin'
  const [otpSent, setOtpSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otpEmail, setOtpEmail] = useState('')
  const [otpValue, setOtpValue] = useState('')

  const { loginWithPassword, loginWithAdmin, verifyAndSetSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const destinationPath = (userRole) => {
    if (location.state?.from?.pathname) {
      return location.state.from.pathname
    }
    if (userRole === 'farmer') return '/farmer/dashboard'
    if (userRole === 'trader') return '/trader/dashboard'
    if (userRole === 'admin') return '/admin/dashboard'
    return '/'
  }

  // 1. Password Login Handler (Farmer / Trader)
  const onPasswordSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await loginWithPassword(data.email.trim(), data.password)
      if (res.success) {
        toast.success(`Welcome back, ${res.user.name || 'User'}!`)
        navigate(destinationPath(res.user.role), { replace: true })
      } else {
        toast.error(res.error || 'Invalid email or password')
      }
    } catch (err) {
      toast.error('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  // 2. Admin Login Handler
  const onAdminSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await loginWithAdmin(data.email.trim(), data.password)
      if (res.success) {
        toast.success('Admin authentication verified!')
        navigate('/admin/dashboard', { replace: true })
      } else {
        toast.error(res.error || 'Invalid admin credentials')
      }
    } catch (err) {
      toast.error('Admin login failed.')
    } finally {
      setLoading(false)
    }
  }

  // 3. OTP Login: Step A (Request OTP)
  const handleRequestOtp = async (data) => {
    setLoading(true)
    try {
      await authService.sendLoginOTP(data.email.trim())
      setOtpEmail(data.email.trim())
      setOtpSent(true)
      toast.success('Verification OTP sent to your email!')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // 3. OTP Login: Step B (Verify OTP)
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otpValue || otpValue.length < 6) {
      toast.error('Please enter the complete 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const res = await verifyAndSetSession({
        email: otpEmail,
        otp: otpValue.trim(),
        isRegistration: false
      })

      if (res.success) {
        toast.success(`Welcome back, ${res.user.name || 'User'}!`)
        navigate(destinationPath(res.user.role), { replace: true })
      } else {
        toast.error(res.error || 'Invalid OTP code')
      }
    } catch (err) {
      toast.error('OTP verification failed.')
    } finally {
      setLoading(false)
    }
  }

  // 4. Quick Demo Autofill and Instant Login
  const fillDemoAccount = async (role, directLogin = true) => {
    if (role === 'farmer') {
      setValue('email', 'demo.farmer@krishisetu.com')
      setValue('password', 'Password@123')
      if (directLogin) {
        setLoading(true)
        const res = await loginWithPassword('demo.farmer@krishisetu.com', 'Password@123')
        setLoading(false)
        if (res.success) {
          toast.success('Welcome, Mallikarjun Gowda! (Demo Farmer)')
          navigate(destinationPath(res.user?.role || 'farmer'), { replace: true })
        } else {
          toast.error(res.error || 'Failed to login as Demo Farmer')
        }
      } else {
        setAuthMode('password')
      }
    } else if (role === 'trader') {
      setValue('email', 'demo.trader@krishisetu.com')
      setValue('password', 'Password@123')
      if (directLogin) {
        setLoading(true)
        const res = await loginWithPassword('demo.trader@krishisetu.com', 'Password@123')
        setLoading(false)
        if (res.success) {
          toast.success('Welcome, Basavaraj APMC Traders! (Demo Trader)')
          navigate(destinationPath(res.user?.role || 'trader'), { replace: true })
        } else {
          toast.error(res.error || 'Failed to login as Demo Trader')
        }
      } else {
        setAuthMode('password')
      }
    } else if (role === 'admin') {
      setValue('email', 'admin@krishisetu.in')
      setValue('password', 'password123')
      if (directLogin) {
        setLoading(true)
        const res = await loginWithAdmin('admin@krishisetu.in', 'password123')
        setLoading(false)
        if (res.success) {
          toast.success('Admin authentication verified!')
          navigate('/admin/dashboard', { replace: true })
        } else {
          toast.error(res.error || 'Failed to login as Admin')
        }
      } else {
        setAuthMode('admin')
      }
    }
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
      <div className="bg-card border border-border rounded-md p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Exact Landing Page Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Link to="/" className="flex items-center gap-3" aria-label="KrishiSetu home">
              <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-primary text-primary-foreground">
                <Sprout className="size-5" />
              </span>
              <div className="text-left">
                <strong className="block font-display text-2xl leading-none">KrishiSetu</strong>
                <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Karnataka Agri Exchange
                </span>
              </div>
            </Link>
          </div>
          
          <div>
            <h1 className="font-display text-3xl font-normal text-foreground">
              {authMode === 'admin' ? 'Admin Portal Access' : 'Sign in to KrishiSetu'}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {authMode === 'admin' 
                ? 'Restricted access for system administrators & APMC moderators' 
                : 'Direct Farmer-Trader Marketplace & Mandi Rates'
              }
            </p>
          </div>
        </div>

        {/* Auth Mode Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-muted/60 p-1 rounded-sm border border-border text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setAuthMode('demo'); setOtpSent(false); }}
            className={`py-1.5 rounded-sm transition-all cursor-pointer flex items-center justify-center gap-1 ${
              authMode === 'demo' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="size-3" /> Demo
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('password'); setOtpSent(false); }}
            className={`py-1.5 rounded-sm transition-all cursor-pointer ${
              authMode === 'password' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('otp'); setOtpSent(false); }}
            className={`py-1.5 rounded-sm transition-all cursor-pointer ${
              authMode === 'otp' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            OTP
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('admin'); setOtpSent(false); }}
            className={`py-1.5 rounded-sm transition-all cursor-pointer ${
              authMode === 'admin' ? 'bg-card text-primary shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Admin
          </button>
        </div>

        {/* MODE 0: Instant Sandbox Demo Accounts */}
        {authMode === 'demo' && (
          <div className="space-y-3.5">
            <div className="bg-primary/5 border border-primary/20 rounded-md p-3 text-xs">
              <p className="font-semibold text-primary flex items-center gap-1.5">
                <Sparkles className="size-3.5" /> Instant Testing Sandbox
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Pre-configured Karnataka test accounts. Click below to sign in directly without typing credentials.
              </p>
            </div>

            {/* Demo Farmer Card */}
            <div className="border border-border/80 bg-background hover:border-primary/40 rounded-md p-3.5 space-y-2 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded mb-1">
                    🌾 Verified Farmer
                  </span>
                  <h3 className="text-xs font-bold text-foreground">Mallikarjun Gowda</h3>
                  <p className="text-[11px] text-muted-foreground">Mandya District • Crops: Paddy, Sugarcane, Ragi</p>
                </div>
              </div>
              <div className="text-[11px] font-mono bg-muted/50 p-1.5 rounded text-muted-foreground flex justify-between">
                <span>demo.farmer@krishisetu.com</span>
                <span>Password@123</span>
              </div>
              <Button
                type="button"
                disabled={loading}
                onClick={() => fillDemoAccount('farmer', true)}
                variant="farmer"
                className="w-full h-8 text-xs font-semibold cursor-pointer"
              >
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : '⚡ Direct Login as Demo Farmer'}
              </Button>
            </div>

            {/* Demo Trader Card */}
            <div className="border border-border/80 bg-background hover:border-trader/40 rounded-md p-3.5 space-y-2 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded mb-1">
                    💼 Verified APMC Trader
                  </span>
                  <h3 className="text-xs font-bold text-foreground">Basavaraj APMC Traders</h3>
                  <p className="text-[11px] text-muted-foreground">Bengaluru Urban APMC • ₹5,00,000 Wallet Balance</p>
                </div>
              </div>
              <div className="text-[11px] font-mono bg-muted/50 p-1.5 rounded text-muted-foreground flex justify-between">
                <span>demo.trader@krishisetu.com</span>
                <span>Password@123</span>
              </div>
              <Button
                type="button"
                disabled={loading}
                onClick={() => fillDemoAccount('trader', true)}
                variant="trader"
                className="w-full h-8 text-xs font-semibold cursor-pointer"
              >
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : '⚡ Direct Login as Demo Trader'}
              </Button>
            </div>

            {/* Demo Admin Card */}
            <div className="border border-border/80 bg-background hover:border-primary/40 rounded-md p-3 space-y-2 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded mb-1">
                    🛡️ System Admin
                  </span>
                  <h3 className="text-xs font-bold text-foreground">State APMC Officer (admin@krishisetu.in)</h3>
                </div>
              </div>
              <Button
                type="button"
                disabled={loading}
                onClick={() => fillDemoAccount('admin', true)}
                variant="outline"
                className="w-full h-8 text-xs font-semibold cursor-pointer"
              >
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : '⚡ Direct Login as Admin'}
              </Button>
            </div>
          </div>
        )}

        {/* MODE 1: Standard Password Login (Farmer / Trader) */}
        {authMode === 'password' && (
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  placeholder="demo.farmer@krishisetu.com"
                  className="w-full h-10 pl-9 pr-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              {errors.email && <p className="text-[11px] text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  placeholder="••••••••"
                  className="w-full h-10 pl-9 pr-10 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={loading} variant="farmer" className="w-full h-10 rounded-sm font-semibold shadow-xs text-xs">
              {loading ? <Loader2 className="size-4 animate-spin" /> : 'Sign In to Portal'}
            </Button>
          </form>
        )}

        {/* MODE 2: OTP Login */}
        {authMode === 'otp' && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSubmit(handleRequestOtp)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Registered Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                    <input
                      type="email"
                      {...register('email', { required: 'Email is required' })}
                      placeholder="farmer@example.com"
                      className="w-full h-10 pl-9 pr-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} variant="farmer" className="w-full h-10 rounded-sm font-semibold shadow-xs text-xs">
                  {loading ? <Loader2 className="size-4 animate-spin" /> : 'Send Login OTP'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5 text-center">
                  <p className="text-xs text-muted-foreground">
                    Enter code sent to <strong className="text-foreground">{otpEmail}</strong>
                  </p>
                  <input
                    type="text"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    maxLength={6}
                    autoFocus
                    className="w-full h-11 text-center tracking-[0.5em] text-lg font-mono font-bold rounded-md bg-background border border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <Button type="submit" disabled={loading || otpValue.length < 6} variant="farmer" className="w-full h-10 rounded-sm font-semibold shadow-xs text-xs">
                  {loading ? <Loader2 className="size-4 animate-spin" /> : 'Verify & Sign In'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-xs text-muted-foreground hover:text-foreground font-medium"
                  >
                    ← Use a different email
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* MODE 3: Admin Console Access */}
        {authMode === 'admin' && (
          <form onSubmit={handleSubmit(onAdminSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Admin Email</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-primary absolute left-3 top-3" />
                <input
                  type="email"
                  {...register('email', { required: 'Admin email is required' })}
                  placeholder="admin@krishisetu.in"
                  className="w-full h-10 pl-9 pr-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Security Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-primary absolute left-3 top-3" />
                <input
                  type="password"
                  {...register('password', { required: 'Password is required' })}
                  placeholder="••••••••"
                  className="w-full h-10 pl-9 pr-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} variant="default" className="w-full h-10 rounded-sm font-semibold shadow-xs text-xs">
              {loading ? <Loader2 className="size-4 animate-spin" /> : 'Authenticate Admin'}
            </Button>
          </form>
        )}

        {/* 1-Click Quick Demo Autofill & Login Bar */}
        <div className="pt-3 border-t border-border space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Sparkles className="size-3 text-primary" /> Instant 1-Click Sandbox Login:
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              type="button"
              disabled={loading}
              onClick={() => fillDemoAccount('farmer', true)}
              className="py-1.5 px-2 rounded-sm bg-muted/60 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors text-muted-foreground border border-border font-semibold text-center cursor-pointer disabled:opacity-50"
              title="Sign in instantly as Demo Farmer Mallikarjun Gowda"
            >
              🌾 Demo Farmer
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => fillDemoAccount('trader', true)}
              className="py-1.5 px-2 rounded-sm bg-muted/60 hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-400 transition-colors text-muted-foreground border border-border font-semibold text-center cursor-pointer disabled:opacity-50"
              title="Sign in instantly as Demo Trader Basavaraj APMC Traders"
            >
              💼 Demo Trader
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => fillDemoAccount('admin', true)}
              className="py-1.5 px-2 rounded-sm bg-muted/60 hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-400 transition-colors text-muted-foreground border border-border font-semibold text-center cursor-pointer disabled:opacity-50"
              title="Sign in instantly as APMC Admin Officer"
            >
              🛡️ Demo Admin
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 text-xs text-muted-foreground border-t border-border">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Register as Farmer / Trader
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
