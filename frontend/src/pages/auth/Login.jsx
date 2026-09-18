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
  const fillDemoAccount = async (role) => {
    if (role === 'farmer') {
      setAuthMode('password')
      setValue('email', 'farmer1@krishisetu.com')
      setValue('password', 'password123')
      setLoading(true)
      const res = await loginWithPassword('farmer1@krishisetu.com', 'password123')
      setLoading(false)
      if (res.success) {
        toast.success('Farmer demo session active!')
        navigate('/farmer/dashboard')
      }
    } else if (role === 'trader') {
      setAuthMode('password')
      setValue('email', 'trader1@krishisetu.com')
      setValue('password', 'password123')
      setLoading(true)
      const res = await loginWithPassword('trader1@krishisetu.com', 'password123')
      setLoading(false)
      if (res.success) {
        toast.success('Trader demo session active!')
        navigate('/trader/dashboard')
      }
    } else if (role === 'admin') {
      setAuthMode('admin')
      setValue('email', 'admin@krishisetu.in')
      setValue('password', 'password123')
      setLoading(true)
      const res = await loginWithAdmin('admin@krishisetu.in', 'password123')
      setLoading(false)
      if (res.success) {
        toast.success('Admin authentication verified!')
        navigate('/admin/dashboard')
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
        <div className="grid grid-cols-3 gap-1 bg-muted/60 p-1 rounded-sm border border-border text-xs font-semibold">
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
            OTP Login
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
                  placeholder="farmer1@krishisetu.com"
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
            <Sparkles className="size-3 text-primary" /> Instant 1-Click Demo Login:
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => fillDemoAccount('farmer')}
              className="py-1.5 px-2 rounded-sm bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground border border-border font-semibold text-center cursor-pointer"
            >
              🌾 Farmer
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('trader')}
              className="py-1.5 px-2 rounded-sm bg-muted/60 hover:bg-trader/15 hover:text-trader transition-colors text-muted-foreground border border-border font-semibold text-center cursor-pointer"
            >
              💼 Trader
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin')}
              className="py-1.5 px-2 rounded-sm bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground border border-border font-semibold text-center cursor-pointer"
            >
              🛡️ Admin
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
