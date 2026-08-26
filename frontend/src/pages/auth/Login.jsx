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

  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

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

  // Quick Demo Autofill Helper
  const fillDemoAccount = (role) => {
    if (role === 'farmer') {
      setAuthMode('password')
      setValue('email', 'ramesh.farmer@example.com')
      setValue('password', 'password123')
    } else if (role === 'trader') {
      setAuthMode('password')
      setValue('email', 'suresh.trader@example.com')
      setValue('password', 'password123')
    } else if (role === 'admin') {
      setAuthMode('admin')
      setValue('email', 'admin@krishisetu.in')
      setValue('password', 'admin123')
    }
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-1">
            {authMode === 'admin' ? (
              <ShieldCheck className="w-6 h-6 text-purple-600" />
            ) : authMode === 'otp' ? (
              <Radio className="w-6 h-6 text-amber-500" />
            ) : (
              <Sprout className="w-6 h-6 text-primary" />
            )}
          </div>
          
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            {authMode === 'admin' ? 'Admin Portal Access' : 'Sign in to KrishiSetu'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {authMode === 'admin' 
              ? 'Restricted access for system administrators & APMC moderators' 
              : 'Direct Farmer-Trader Marketplace & Mandi Rates'
            }
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-muted/60 p-1 rounded-xl border border-border text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setAuthMode('password'); setOtpSent(false); }}
            className={`py-1.5 rounded-lg transition-all ${
              authMode === 'password' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('otp'); setOtpSent(false); }}
            className={`py-1.5 rounded-lg transition-all ${
              authMode === 'otp' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            OTP Login
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('admin'); setOtpSent(false); }}
            className={`py-1.5 rounded-lg transition-all ${
              authMode === 'admin' ? 'bg-card text-purple-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🛡️ Admin
          </button>
        </div>

        {/* MODE 1: Standard Password Login (Farmer / Trader) */}
        {authMode === 'password' && (
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  placeholder="name@example.com"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  placeholder="••••••••"
                  className="w-full h-10 pl-9 pr-10 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-rose-500">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 rounded-2xl font-bold shadow-md">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
            </Button>
          </form>
        )}

        {/* MODE 2: Passwordless OTP Login */}
        {authMode === 'otp' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSubmit(handleRequestOtp)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Registered Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                    <input
                      type="email"
                      {...register('email', { required: 'Email is required' })}
                      placeholder="farmer@example.com"
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-11 rounded-2xl font-bold shadow-md">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Login OTP'}
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
                    className="w-full h-12 text-center tracking-[0.5em] text-xl font-mono font-bold rounded-xl bg-background border-2 border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <Button type="submit" disabled={loading || otpValue.length < 6} className="w-full h-11 rounded-2xl font-bold shadow-md">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Sign In'}
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
              <label className="text-xs font-medium text-foreground">Admin Email</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-purple-600 absolute left-3 top-3" />
                <input
                  type="email"
                  {...register('email', { required: 'Admin email is required' })}
                  placeholder="admin@krishisetu.in"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Security Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-purple-600 absolute left-3 top-3" />
                <input
                  type="password"
                  {...register('password', { required: 'Password is required' })}
                  placeholder="••••••••"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 rounded-2xl font-bold shadow-md bg-purple-600 hover:bg-purple-700 text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Authenticate Admin'}
            </Button>
          </form>
        )}

        {/* 1-Click Quick Demo Autofill Bar */}
        <div className="pt-2 border-t border-border space-y-2">
          <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Quick Demo Login:
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => fillDemoAccount('farmer')}
              className="py-1 px-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground border border-border"
            >
              🌾 Farmer
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('trader')}
              className="py-1 px-2 rounded-lg bg-muted hover:bg-amber-500/10 hover:text-amber-600 transition-colors text-muted-foreground border border-border"
            >
              💼 Trader
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin')}
              className="py-1 px-2 rounded-lg bg-muted hover:bg-purple-500/10 hover:text-purple-600 transition-colors text-muted-foreground border border-border"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 text-xs text-muted-foreground">
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
