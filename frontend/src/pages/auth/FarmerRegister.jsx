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
  RefreshCw 
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

  const { verifyAndSetSession } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      state: 'Karnataka',
      district: 'Dharwad',
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

  // Step 1 Submit: Send Registration Data & Request OTP
  const onFormSubmit = async (data) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        cropsGrown: selectedCrops,
        landSizeAcres: Number(data.landSizeAcres)
      }

      await authService.registerFarmer(payload)
      setSubmittedEmail(data.email.toLowerCase())
      setStep(2)
      setResendTimer(60)
      setCanResend(false)
      toast.success('OTP sent to your email for verification!')
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
        toast.success('Welcome to KrishiSetu! Account activated.')
        navigate('/farmer/dashboard')
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
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 mb-1">
            <Sprout className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Farmer Registration
          </h1>
          <p className="text-xs text-muted-foreground">
            {step === 1 
              ? 'Enter your farm details to start selling crops directly with 0% broker fee' 
              : `Enter the 6-digit verification code sent to ${submittedEmail}`
            }
          </p>
        </div>

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            
            {/* 1. Personal Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                <User className="w-4 h-4 text-primary" /> 1. Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Full Name *</label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    placeholder="e.g. Ramesh Kumar Patel"
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  {errors.name && <p className="text-[11px] text-rose-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Phone Number *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-mono">+91</span>
                    <input
                      {...register('phone', { 
                        required: 'Phone number is required',
                        pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit Indian phone' }
                      })}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full h-10 pl-12 pr-3 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] text-rose-500">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Email Address *</label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Enter valid email' }
                    })}
                    placeholder="farmer@example.com"
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  {errors.password && <p className="text-[11px] text-rose-500">{errors.password.message}</p>}
                </div>
              </div>
            </div>

            {/* 2. Farm Location */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                <MapPin className="w-4 h-4 text-primary" /> 2. Farm Location
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">State</label>
                  <input
                    {...register('state')}
                    readOnly
                    className="w-full h-10 px-3 rounded-xl bg-muted/50 border border-border text-sm font-medium text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">District *</label>
                  <select
                    {...register('district', { required: 'Select district' })}
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {KARNATAKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Taluk *</label>
                  <input
                    {...register('taluk', { required: 'Taluk is required' })}
                    placeholder="e.g. Hubli"
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  {errors.taluk && <p className="text-[11px] text-rose-500">{errors.taluk.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Village / Locality *</label>
                <input
                  {...register('village', { required: 'Village name is required' })}
                  placeholder="e.g. Navalgund Village"
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                {errors.village && <p className="text-[11px] text-rose-500">{errors.village.message}</p>}
              </div>
            </div>

            {/* 3. Crop & Farm Profile */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                <Trees className="w-4 h-4 text-primary" /> 3. Crop & Land Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Total Land Size (Acres) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    {...register('landSizeAcres', { required: 'Enter land size' })}
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Preferred SMS Language</label>
                  <select
                    {...register('preferredLanguage')}
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="kannada">ಕನ್ನಡ (Kannada)</option>
                    <option value="hindi">हिन्दी (Hindi)</option>
                    <option value="english">English</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground block">
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-primary-foreground font-semibold shadow-sm scale-105'
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
              className="w-full h-12 rounded-2xl text-base font-bold shadow-lg mt-6"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Sending Verification Code...
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
                className="w-full h-14 text-center tracking-[0.5em] text-2xl font-mono font-extrabold rounded-2xl bg-background border-2 border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/20 shadow-inner"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full h-12 rounded-2xl font-bold shadow-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Verifying Account...
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
                  canResend ? 'text-primary hover:underline' : 'text-muted-foreground/60 cursor-not-allowed'
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

export default FarmerRegister
