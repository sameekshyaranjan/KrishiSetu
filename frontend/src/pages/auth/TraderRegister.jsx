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
  const [formDataCache, setFormDataCache] = useState(null)

  const onFormSubmit = async (data) => {
    setLoading(true)
    try {
      const primaryDistrict = data.district || selectedDistricts[0]?.replace(' APMC', '') || 'Hubballi / Dharwad'
      const payload = {
        ...data,
        district: primaryDistrict,
        state: 'Karnataka',
        mobile: data.phone || data.mobile,
        operatingStates: ['Karnataka'],
        operatingDistricts: selectedDistricts,
        operatingLocations: selectedDistricts
      }
      setFormDataCache(payload)

      await authService.registerTrader(payload)
      setSubmittedEmail(data.email.toLowerCase())
      setStep(2)
      setResendTimer(60)
      setCanResend(false)
      toast.success('Verification OTP sent to your email address!')
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
        toast.success('Welcome to KrishiSetu! Trader account activated. 💼')
        navigate('/trader/dashboard')
      } else {
        toast.error(res.error || 'Invalid OTP code')
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'OTP verification failed'
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
      if (formDataCache) {
        await authService.registerTrader(formDataCache)
      } else {
        await authService.sendLoginOTP(submittedEmail)
      }
      setResendTimer(60)
      setCanResend(false)
      toast.success('New OTP sent to your email!')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend OTP'
      toast.error(msg)
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

      <div className="bg-card border border-border rounded-md p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="size-9 rounded-sm bg-trader/15 text-trader flex items-center justify-center mx-auto">
            <Briefcase className="size-5" />
          </div>
          <h1 className="font-display text-3xl font-normal text-foreground">
            Trader & Buyer Registration
          </h1>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
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
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5 border-b border-border pb-2">
                <User className="size-3.5 text-trader" /> 1. Authorised Representative
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Contact Person Name *</label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    placeholder="e.g. Suresh Hegde"
                    className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-trader font-medium"
                  />
                  {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Mobile Phone Number *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-mono">+91</span>
                    <input
                      {...register('phone', { 
                        required: 'Phone number is required',
                        pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit Indian phone' }
                      })}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full h-10 pl-11 pr-3 rounded-md bg-background border border-border text-xs font-mono focus:outline-none focus:ring-1 focus:ring-trader"
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] text-destructive">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Official Email Address *</label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Enter valid email' }
                    })}
                    placeholder="trader@company.com"
                    className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-trader"
                  />
                  {errors.email && <p className="text-[11px] text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Password (min 6 chars) *</label>
                  <input
                    type="password"
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Minimum 6 characters' }
                    })}
                    placeholder="••••••••"
                    className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-trader font-mono"
                  />
                  {errors.password && <p className="text-[11px] text-destructive">{errors.password.message}</p>}
                </div>
              </div>
            </div>

            {/* 2. Business & APMC Details */}
            <div className="space-y-4 pt-2">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5 border-b border-border pb-2">
                <Building2 className="size-3.5 text-trader" /> 2. Business & License Details
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Trading Firm / Company Name *</label>
                <input
                  {...register('companyName', { required: 'Company name is required' })}
                  placeholder="e.g. Karnataka Agro Traders Pvt Ltd"
                  className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-trader font-medium"
                />
                {errors.companyName && <p className="text-[11px] text-destructive">{errors.companyName.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">GSTIN Number *</label>
                  <input
                    {...register('gstNumber', { 
                      required: 'GSTIN is required',
                      pattern: { 
                        value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 
                        message: 'Enter valid 15-character GSTIN (e.g. 29AAAAA0000A1Z5)' 
                      }
                    })}
                    placeholder="29AAAAA0000A1Z5"
                    className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-trader"
                  />
                  {errors.gstNumber && <p className="text-[11px] text-destructive">{errors.gstNumber.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">APMC License Number *</label>
                  <input
                    {...register('licenseNumber', { required: 'APMC License number is required' })}
                    placeholder="e.g. APMC-HUB-2024-884"
                    className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs font-mono focus:outline-none focus:ring-1 focus:ring-trader"
                  />
                  {errors.licenseNumber && <p className="text-[11px] text-destructive">{errors.licenseNumber.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Registered Business Address *</label>
                <input
                  {...register('businessAddress', { required: 'Business address is required' })}
                  placeholder="e.g. Shop #42, APMC Yard, Amargol, Hubli, Karnataka"
                  className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-trader font-medium"
                />
                {errors.businessAddress && <p className="text-[11px] text-destructive">{errors.businessAddress.message}</p>}
              </div>
            </div>

            {/* 3. Operating APMC Mandis */}
            <div className="space-y-3 pt-2">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5 border-b border-border pb-2">
                <MapPin className="size-3.5 text-trader" /> 3. Operating APMC Markets
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">
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
                        className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-trader text-trader-foreground shadow-xs'
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
              variant="trader"
              size="lg"
              className="w-full h-10 rounded-sm text-xs font-bold shadow-xs mt-6"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Submitting Verification Details...
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
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                maxLength={6}
                autoFocus
                className="w-full h-12 text-center tracking-[0.5em] text-xl font-mono font-bold rounded-md bg-background border border-trader/40 focus:outline-none focus:ring-1 focus:ring-trader"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || otp.length < 6}
              variant="trader"
              size="lg"
              className="w-full h-10 rounded-sm text-xs font-bold shadow-xs"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Activating Trader Account...
                </span>
              ) : (
                'Verify & Complete Registration'
              )}
            </Button>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-muted-foreground hover:text-foreground underline cursor-pointer"
              >
                ← Change Form Details
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={!canResend || loading}
                className={`font-semibold ${
                  canResend ? 'text-trader hover:underline cursor-pointer' : 'text-muted-foreground/60 cursor-not-allowed'
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
