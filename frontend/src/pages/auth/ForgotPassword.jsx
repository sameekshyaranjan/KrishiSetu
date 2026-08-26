import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import authService from '@/services/authService'
import { Button } from '@/components/ui/button'
import { 
  KeyRound, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldAlert 
} from 'lucide-react'
import toast from 'react-hot-toast'

export const ForgotPassword = () => {
  const [step, setStep] = useState(1) // 1: Request OTP, 2: Reset with OTP & New Password
  const [loading, setLoading] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const navigate = useNavigate()

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const newPasswordValue = watch('newPassword')

  // Resend OTP Countdown Timer
  useEffect(() => {
    let interval = null
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    } else if (resendTimer === 0) {
      setCanResend(true)
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [step, resendTimer])

  // Step 1: Request Password Reset OTP
  const onEmailSubmit = async (data) => {
    setLoading(true)
    try {
      await authService.forgotPassword(data.email.trim())
      setSubmittedEmail(data.email.trim().toLowerCase())
      setStep(2)
      setResendTimer(60)
      setCanResend(false)
      toast.success('Password reset OTP sent to your email!')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to request reset OTP'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Submit OTP & New Password
  const onResetSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword({
        email: submittedEmail,
        otp: data.otp.trim(),
        newPassword: data.newPassword
      })

      toast.success('Password reset successful! Please sign in with your new password.')
      navigate('/login', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Password reset failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return
    setLoading(true)
    try {
      await authService.forgotPassword(submittedEmail)
      setResendTimer(60)
      setCanResend(false)
      toast.success('New password reset OTP sent!')
    } catch (err) {
      toast.error('Failed to resend OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
      
      {/* Navigation Back */}
      <div className="mb-6">
        <Link 
          to="/login" 
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 mb-1">
            <KeyRound className="w-6 h-6" />
          </div>
          
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            {step === 1 ? 'Reset Your Password' : 'Enter Verification Code'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {step === 1 
              ? 'Enter your registered email address and we will send you a 6-digit OTP code to reset your password' 
              : `We sent a 6-digit verification code to ${submittedEmail}`
            }
          </p>
        </div>

        {/* STEP 1: Email Form */}
        {step === 1 && (
          <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Registered Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Enter a valid email address' }
                  })}
                  placeholder="farmer@example.com"
                  autoFocus
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-500">{errors.email.message}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 rounded-2xl font-bold shadow-md bg-amber-500 text-white hover:bg-amber-600">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending Reset OTP...
                </span>
              ) : (
                'Send Reset OTP'
              )}
            </Button>
          </form>
        )}

        {/* STEP 2: OTP & New Password Form */}
        {step === 2 && (
          <form onSubmit={handleSubmit(onResetSubmit)} className="space-y-4">
            
            {/* OTP Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">6-Digit Verification Code</label>
              <input
                {...register('otp', { 
                  required: 'Enter 6-digit OTP',
                  minLength: { value: 6, message: 'Must be 6 digits' }
                })}
                placeholder="123456"
                maxLength={6}
                autoFocus
                className="w-full h-12 text-center tracking-[0.5em] text-xl font-mono font-bold rounded-xl bg-background border-2 border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              {errors.otp && <p className="text-[11px] text-rose-500 text-center">{errors.otp.message}</p>}
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">New Password (min 6 chars)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('newPassword', { 
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' }
                  })}
                  placeholder="••••••••"
                  className="w-full h-10 pl-9 pr-10 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-[11px] text-rose-500">{errors.newPassword.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('confirmPassword', { 
                    required: 'Please confirm password',
                    validate: (val) => val === newPasswordValue || 'Passwords do not match'
                  })}
                  placeholder="••••••••"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
              {errors.confirmPassword && <p className="text-[11px] text-rose-500">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 rounded-2xl font-bold shadow-md bg-amber-500 text-white hover:bg-amber-600">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Updating Password...
                </span>
              ) : (
                'Set New Password'
              )}
            </Button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-muted-foreground hover:text-foreground font-medium"
              >
                ← Change Email
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={!canResend || loading}
                className={`font-semibold ${
                  canResend ? 'text-amber-600 hover:underline' : 'text-muted-foreground/60 cursor-not-allowed'
                }`}
              >
                {canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="text-center pt-2 border-t border-border text-xs text-muted-foreground">
          Remember your password?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
