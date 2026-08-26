import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import authService from '@/services/authService'
import useAuth from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { 
  Briefcase, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  MapPin, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Lock, 
  User, 
  Building2, 
  FileBadge, 
  RefreshCw 
} from 'lucide-react'
import toast from 'react-hot-toast'

const KARNATAKA_APMC_DISTRICTS = [
  'Hubli APMC', 'Belagavi APMC', 'Yeshwanthpur APMC', 
  'Mysuru APMC', 'Davanagere APMC', 'Ballari APMC', 
  'Kolar APMC', 'Shimoga APMC', 'Haveri APMC', 'Gadag APMC'
]

export const TraderRegister = () => {
  const [step, setStep] = useState(1) // 1: Form, 2: OTP Verification
  const [loading, setLoading] = useState(false)
  const [selectedDistricts, setSelectedDistricts] = useState(['Hubli APMC', 'Belagavi APMC'])
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const { verifyAndSetSession } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      operatingStates: ['Karnataka']
    }
  })

  // Countdown timer for OTP resend
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

  const toggleDistrict = (district) => {
    if (selectedDistricts.includes(district)) {
      if (selectedDistricts.length > 1) {
        setSelectedDistricts(selectedDistricts.filter((d) => d !== district))
      } else {
        toast.error('Please select at least 1 APMC operating market')
      }
    } else {
      setSelectedDistricts([...selectedDistricts, district])
    }
  }

  // Step 1 Submit: Send Trader Data & Request OTP
  const onFormSubmit = async (data) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        operatingStates: ['Karnataka'],
        operatingDistricts: selectedDistricts
      }

      await authService.registerTrader(payload)
      setSubmittedEmail(data.email.toLowerCase())
      setStep(2)
      setResendTimer(60)
      setCanResend(false)
      toast.success('OTP sent to email for verification!')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Trader registration failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Step 2 Submit: Verify OTP & Activate Trader Session
  const onOtpSubmit = async (e) => {
    e.preventDefault()
    if (!otp || otp.length < 6) {
      toast.error('Please enter the complete 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const res = await verifyAndSetSession({
        email: submittedEmail,
        otp: otp.trim(),
        isRegistration: true
      })

      if (res.success) {
        toast.success('Welcome to KrishiSetu! Trader account activated.')
        navigate('/trader/dashboard')
      } else {
        toast.error(res.error || 'Invalid OTP')
      }
    } catch (err) {
      toast.error('OTP verification failed. Please check the code and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return
    setLoading(true)
    try {
      await authService.sendLoginOTP(submittedEmail)
      setResendTimer(60)
      setCanResend(false)
      toast.success('New OTP sent!')
    } catch (err) {
      toast.error('Failed to resend OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      
      {/* Navigation Back */}
      <div className="mb-6">
        <Link 
          to="/register" 
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Change account type
        </Link>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 mb-1">
            <Briefcase className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Trader & Buyer Registration
          </h1>
          <p className="text-xs text-muted-foreground">
            {step === 1 
              ? 'Register your trading firm to participate in direct farm-gate crop auctions' 
              : `Enter the 6-digit verification code sent to ${submittedEmail}`
            }
          </p>
        </div>

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            
            {/* 1. Authorised Representative */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                <User className="w-4 h-4 text-amber-600" /> 1. Authorised Representative
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Contact Person Name *</label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    placeholder="e.g. Suresh Hegde"
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  {errors.name && <p className="text-[11px] text-rose-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Mobile Phone Number *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-mono">+91</span>
                    <input
                      {...register('phone', { 
                        required: 'Phone number is required',
                        pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit Indian phone' }
                      })}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full h-10 pl-12 pr-3 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] text-rose-500">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Official Email Address *</label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Enter valid email' }
                    })}
                    placeholder="trader@company.com"
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  {errors.email && <p className="text-[11px] text-rose-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Password (min 6 chars) *</label>
                  <input
                    type="password"
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Minimum 6 characters' }
                    })}
                    placeholder="••••••••"
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  {errors.password && <p className="text-[11px] text-rose-500">{errors.password.message}</p>}
                </div>
              </div>
            </div>

            {/* 2. Business & APMC Details */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                <Building2 className="w-4 h-4 text-amber-600" /> 2. Business & License Details
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Trading Firm / Company Name *</label>
                <input
                  {...register('companyName', { required: 'Company name is required' })}
                  placeholder="e.g. Karnataka Agro Traders Pvt Ltd"
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
                {errors.companyName && <p className="text-[11px] text-rose-500">{errors.companyName.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">GSTIN Number *</label>
                  <input
                    {...register('gstNumber', { 
                      required: 'GSTIN is required',
                      pattern: { 
                        value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 
                        message: 'Enter valid 15-character GSTIN (e.g. 29AAAAA0000A1Z5)' 
                      }
                    })}
                    placeholder="29AAAAA0000A1Z5"
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  {errors.gstNumber && <p className="text-[11px] text-rose-500">{errors.gstNumber.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">APMC License Number *</label>
                  <input
                    {...register('licenseNumber', { required: 'APMC License number is required' })}
                    placeholder="e.g. APMC-HUB-2024-884"
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  {errors.licenseNumber && <p className="text-[11px] text-rose-500">{errors.licenseNumber.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Registered Business Address *</label>
                <input
                  {...register('businessAddress', { required: 'Business address is required' })}
                  placeholder="e.g. Shop #42, APMC Yard, Amargol, Hubli, Karnataka"
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
                {errors.businessAddress && <p className="text-[11px] text-rose-500">{errors.businessAddress.message}</p>}
              </div>
            </div>

            {/* 3. Operating APMC Mandis */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                <MapPin className="w-4 h-4 text-amber-600" /> 3. Operating APMC Markets
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground block">
                  Select Primary APMC Markets (Tap to toggle):
                </label>
                <div className="flex flex-wrap gap-2">
                  {KARNATAKA_APMC_DISTRICTS.map((district) => {
                    const isSelected = selectedDistricts.includes(district)
                    return (
                      <button
                        type="button"
                        key={district}
                        onClick={() => toggleDistrict(district)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-white font-semibold shadow-sm scale-105'
                            : 'bg-muted/70 text-muted-foreground hover:bg-muted border border-border'
                        }`}
                      >
                        {isSelected ? `✓ ${district}` : `+ ${district}`}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl text-base font-bold shadow-lg mt-6 bg-amber-500 text-white hover:bg-amber-600"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Submitting Verification Details...
                </span>
              ) : (
                'Send Verification OTP'
              )}
            </Button>
          </form>
        )}

        {/* STEP 2: OTP Verification Screen */}
        {step === 2 && (
          <form onSubmit={onOtpSubmit} className="space-y-6 max-w-sm mx-auto">
            <div className="space-y-2 text-center">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                maxLength={6}
                autoFocus
                className="w-full h-14 text-center tracking-[0.5em] text-2xl font-mono font-extrabold rounded-2xl bg-background border-2 border-amber-500/50 focus:outline-none focus:ring-4 focus:ring-amber-500/20 shadow-inner"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full h-12 rounded-2xl font-bold shadow-lg bg-amber-500 text-white hover:bg-amber-600"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Activating Trader Account...
                </span>
              ) : (
                'Verify & Complete Registration'
              )}
            </Button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-muted-foreground hover:text-foreground font-medium"
              >
                ← Change Form Details
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
          Already registered?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TraderRegister
