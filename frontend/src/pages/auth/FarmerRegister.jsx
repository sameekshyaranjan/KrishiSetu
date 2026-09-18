import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import authService from '@/services/authService'
import useAuth from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { 
  Sprout, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  MapPin, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Lock, 
  User, 
  Globe, 
  Trees, 
  RefreshCw,
  Landmark,
  Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'

const KARNATAKA_DISTRICTS = [
  'Dharwad', 'Belagavi', 'Mysuru', 'Mandya', 'Kolar', 
  'Ballari', 'Shimoga', 'Hassan', 'Davanagere', 'Haveri', 
  'Tumakuru', 'Chikkamagaluru', 'Bagalkot', 'Gadag', 'Vijayapura'
]

const POPULAR_CROPS = [
  'Maize', 'Ragi', 'Tomato', 'Onion', 'Cotton', 
  'Paddy', 'Turmeric', 'Sugarcane', 'Chilli', 'Groundnut', 'Soybean'
]

export const FarmerRegister = () => {
  const [step, setStep] = useState(1) // 1: Form, 2: OTP Verification
  const [loading, setLoading] = useState(false)
  const [selectedCrops, setSelectedCrops] = useState(['Maize', 'Ragi'])
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [rtcNumber, setRtcNumber] = useState('RTC-HSN-88192')
  const [bhoomiVerified, setBhoomiVerified] = useState(true)

  const { verifyAndSetSession } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      state: 'Karnataka',
      district: 'Hassan',
      taluk: 'Belur',
      village: 'Belur Village',
      preferredLanguage: 'kannada',
      landSizeAcres: 5
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

  const toggleCrop = (crop) => {
    if (selectedCrops.includes(crop)) {
      if (selectedCrops.length > 1) {
        setSelectedCrops(selectedCrops.filter((c) => c !== crop))
      } else {
        toast.error('Please select at least 1 crop')
      }
    } else {
      setSelectedCrops([...selectedCrops, crop])
    }
  }

  const [formDataCache, setFormDataCache] = useState(null)

  // Step 1 Submit: Send Registration Data & Request OTP
  const onFormSubmit = async (data) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        mobile: data.phone || data.mobile,
        rtcNumber: rtcNumber || 'RTC-HSN-88192',
        cropsGrown: selectedCrops,
        landSizeAcres: Number(data.landSizeAcres)
      }
      setFormDataCache(payload)

      await authService.registerFarmer(payload)
      setSubmittedEmail(data.email.toLowerCase())
      setStep(2)
      setResendTimer(60)
      setCanResend(false)
      toast.success('Verification OTP sent to your email address!')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Step 2 Submit: Verify OTP & Activate Account
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
        toast.success('Welcome to KrishiSetu! Farmer account activated. 🌾')
        navigate('/farmer/dashboard')
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
        await authService.registerFarmer(formDataCache)
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

      {/* Main Card Container */}
      <div className="bg-card border border-border rounded-md p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="size-9 rounded-sm bg-primary text-primary-foreground flex items-center justify-center mx-auto">
            <Sprout className="size-5" />
          </div>
          <h1 className="font-display text-3xl font-normal text-foreground">
            {step === 1 ? 'Register as Farmer (ರೈತ)' : 'Verify Mobile / Email OTP'}
          </h1>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {step === 1 
              ? 'Join Karnataka’s verified digital APMC marketplace with 0% brokerage and direct bank payouts.'
              : `Enter the 6-digit verification code sent to ${submittedEmail}`
            }
          </p>
        </div>

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            
            {/* 1. Personal & Contact Details */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5 border-b border-border pb-2">
                <User className="size-3.5 text-primary" /> 1. Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Full Name (ರೈತರ ಹೆಸರು) *</label>
                  <input
                    {...register('name', { required: 'Full name is required' })}
                    placeholder="e.g. Ramesh Gowda"
                    className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  />
                  {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Phone Number *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-mono">+91</span>
                    <input
                      {...register('phone', { 
                        required: 'Phone number is required',
                        pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit Indian phone' }
                      })}
                      placeholder="9845123456"
                      maxLength={10}
                      className="w-full h-10 pl-11 pr-3 rounded-md bg-background border border-border text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] text-destructive">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Email Address *</label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Enter valid email' }
                    })}
                    placeholder="farmer@example.com"
                    className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
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
                    className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                  {errors.password && <p className="text-[11px] text-destructive">{errors.password.message}</p>}
                </div>
              </div>
            </div>

            {/* 2. Farm Location */}
            <div className="space-y-4 pt-2">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5 border-b border-border pb-2">
                <MapPin className="size-3.5 text-primary" /> 2. Farm Location & Bhoomi Land Registry
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">State</label>
                  <input
                    {...register('state')}
                    readOnly
                    className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-xs font-medium text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">District *</label>
                  <select
                    {...register('district', { required: 'Select district' })}
                    className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  >
                    {KARNATAKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Taluk *</label>
                  <input
                    {...register('taluk', { required: 'Taluk is required' })}
                    placeholder="e.g. Belur"
                    className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Village / Locality *</label>
                  <input
                    {...register('village', { required: 'Village name is required' })}
                    placeholder="e.g. Navalgund Village"
                    className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">Bhoomi RTC Survey #</label>
                    <span className="text-[10px] text-primary font-bold flex items-center gap-1">
                      <ShieldCheck className="size-3 text-primary" /> Bhoomi Verified
                    </span>
                  </div>
                  <input
                    type="text"
                    value={rtcNumber}
                    onChange={(e) => {
                      setRtcNumber(e.target.value)
                      setBhoomiVerified(e.target.value.length > 5)
                    }}
                    placeholder="e.g. RTC-HSN-88192"
                    className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* 3. Crop & Farm Profile */}
            <div className="space-y-4 pt-2">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5 border-b border-border pb-2">
                <Trees className="size-3.5 text-primary" /> 3. Crop & Land Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Total Land Size (Acres) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    {...register('landSizeAcres', { required: 'Enter land size' })}
                    className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Preferred SMS Language</label>
                  <select
                    {...register('preferredLanguage')}
                    className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  >
                    <option value="kannada">ಕನ್ನಡ (Kannada)</option>
                    <option value="hindi">हिन्दी (Hindi)</option>
                    <option value="english">English</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Select Crops Grown (Tap to toggle):
                </label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_CROPS.map((crop) => {
                    const isSelected = selectedCrops.includes(crop)
                    return (
                      <button
                        type="button"
                        key={crop}
                        onClick={() => toggleCrop(crop)}
                        className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'bg-muted/70 text-muted-foreground hover:bg-muted border border-border'
                        }`}
                      >
                        {isSelected ? `✓ ${crop}` : `+ ${crop}`}
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
              variant="farmer"
              size="lg"
              className="w-full h-10 rounded-sm text-xs font-bold shadow-xs mt-6"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Sending Verification Code...
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
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                autoFocus
                className="w-full h-12 text-center text-xl font-mono font-bold tracking-[0.5em] rounded-md bg-background border border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || otp.length < 6}
              variant="farmer"
              size="lg"
              className="w-full h-10 rounded-sm text-xs font-bold shadow-xs"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Verifying Account...
                </span>
              ) : (
                'Verify & Complete Registration'
              )}
            </Button>

            {/* Resend & Back controls */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="hover:text-foreground underline transition-colors cursor-pointer"
              >
                ← Edit registration details
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={!canResend || loading}
                className={`font-semibold transition-colors ${
                  canResend 
                    ? 'text-primary hover:underline cursor-pointer' 
                    : 'text-muted-foreground cursor-not-allowed opacity-60'
                }`}
              >
                {canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default FarmerRegister
