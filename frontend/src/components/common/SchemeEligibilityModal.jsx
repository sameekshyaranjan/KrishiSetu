import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  X, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  Landmark, 
  ExternalLink, 
  ArrowRight, 
  RefreshCw,
  HelpCircle,
  ShieldCheck
} from 'lucide-react'

export const SchemeEligibilityModal = ({ isOpen, onClose, schemes = [] }) => {
  const [step, setStep] = useState(1) // 1: Questions, 2: Results
  const [landSize, setLandSize] = useState('small') // 'small' (<5ac), 'medium' (5-10ac), 'large' (>10ac), 'tenant'
  const [state, setState] = useState('karnataka')
  const [isAadhaarLinked, setIsAadhaarLinked] = useState(true)
  const [selectedCrops, setSelectedCrops] = useState(['Millets', 'Food Grains'])

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const toggleCrop = (crop) => {
    if (selectedCrops.includes(crop)) {
      if (selectedCrops.length > 1) {
        setSelectedCrops(selectedCrops.filter((c) => c !== crop))
      }
    } else {
      setSelectedCrops([...selectedCrops, crop])
    }
  }

  // Calculate Eligibility Match
  const eligibleSchemes = schemes.filter((s) => {
    const name = s.name.toLowerCase()
    
    // PM-KISAN: Small/medium landholders with Aadhaar linked
    if (name.includes('pm-kisan')) {
      return (landSize === 'small' || landSize === 'medium') && isAadhaarLinked
    }
    // Raitha Siri: Karnataka farmers growing Millets
    if (name.includes('raitha siri')) {
      return state === 'karnataka' && selectedCrops.includes('Millets')
    }
    // PMKSY: Farmers with land (not landless)
    if (name.includes('pmksy')) {
      return landSize !== 'tenant'
    }
    // PMFBY, KCC, Soil Health Card: All farmers eligible
    return true
  })

  // Estimated annual benefit calculation
  const getEstimatedBenefit = () => {
    let cash = 0
    let subsidy = []
    
    if (eligibleSchemes.some(s => s.name.toLowerCase().includes('pm-kisan'))) cash += 6000
    if (eligibleSchemes.some(s => s.name.toLowerCase().includes('raitha siri'))) cash += 10000
    if (eligibleSchemes.some(s => s.name.toLowerCase().includes('kcc'))) subsidy.push('4% Low-Interest Credit')
    if (eligibleSchemes.some(s => s.name.toLowerCase().includes('pmksy'))) subsidy.push('55% Irrigation Subsidy')
    if (eligibleSchemes.some(s => s.name.toLowerCase().includes('pmfby'))) subsidy.push('Crop Insurance Cover')

    return { cash, subsidy }
  }

  const { cash, subsidy } = getEstimatedBenefit()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Scheme Eligibility Wizard
          </div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
            {step === 1 ? 'Check Your Government Scheme Eligibility' : 'Your Matching Welfare Entitlements'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {step === 1 
              ? 'Answer 4 quick questions about your farm to calculate all available DBT grants and subsidies' 
              : `Based on your profile, you are eligible for ${eligibleSchemes.length} official government programs!`
            }
          </p>
        </div>

        {/* STEP 1: Interactive Questionnaire */}
        {step === 1 && (
          <div className="space-y-5 pt-2">
            
            {/* Q1: Land Size */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                1. Total Landholding Size:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setLandSize('small')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    landSize === 'small' 
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm' 
                      : 'border-border bg-background hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <span className="block font-semibold">Small & Marginal</span>
                  <span className="text-[11px] text-muted-foreground">Less than 5 Acres</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLandSize('medium')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    landSize === 'medium' 
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm' 
                      : 'border-border bg-background hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <span className="block font-semibold">Medium Farmer</span>
                  <span className="text-[11px] text-muted-foreground">5 to 10 Acres</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLandSize('large')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    landSize === 'large' 
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm' 
                      : 'border-border bg-background hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <span className="block font-semibold">Large Farmer</span>
                  <span className="text-[11px] text-muted-foreground">More than 10 Acres</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLandSize('tenant')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    landSize === 'tenant' 
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm' 
                      : 'border-border bg-background hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <span className="block font-semibold">Tenant / Oral Lessee</span>
                  <span className="text-[11px] text-muted-foreground">Cultivates leased land</span>
                </button>
              </div>
            </div>

            {/* Q2: State */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                2. State of Cultivation:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setState('karnataka')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    state === 'karnataka' 
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm' 
                      : 'border-border bg-background hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <span className="block font-semibold">🌾 Karnataka</span>
                  <span className="text-[11px] text-muted-foreground">Eligible for State + Central</span>
                </button>

                <button
                  type="button"
                  onClick={() => setState('other')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    state === 'other' 
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm' 
                      : 'border-border bg-background hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <span className="block font-semibold">🏛️ Other Indian State</span>
                  <span className="text-[11px] text-muted-foreground">Eligible for Central Schemes</span>
                </button>
              </div>
            </div>

            {/* Q3: Crops Grown */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                3. Crops Cultivated (Tap to toggle):
              </label>
              <div className="flex flex-wrap gap-2">
                {['Millets', 'Food Grains', 'Vegetables', 'Cash Crops'].map((crop) => {
                  const isSelected = selectedCrops.includes(crop)
                  return (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => toggleCrop(crop)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isSelected 
                          ? 'bg-primary text-primary-foreground font-semibold shadow-sm scale-105' 
                          : 'bg-muted/60 text-muted-foreground hover:bg-muted border border-border'
                      }`}
                    >
                      {isSelected ? `✓ ${crop}` : `+ ${crop}`}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Q4: Aadhaar Bank Link */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                4. Is your Aadhaar linked to your Bank Account?
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsAadhaarLinked(true)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isAadhaarLinked 
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 font-bold' 
                      : 'border-border bg-background text-muted-foreground'
                  }`}
                >
                  ✓ Yes, Linked for DBT
                </button>
                <button
                  type="button"
                  onClick={() => setIsAadhaarLinked(false)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    !isAadhaarLinked 
                      ? 'border-amber-500 bg-amber-500/10 text-amber-600 font-bold' 
                      : 'border-border bg-background text-muted-foreground'
                  }`}
                >
                  ✗ Not Linked Yet
                </button>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setStep(2)}
              className="w-full h-12 rounded-2xl font-bold shadow-lg mt-4 text-base"
            >
              Evaluate My Matching Schemes <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* STEP 2: Calculated Eligibility Results */}
        {step === 2 && (
          <div className="space-y-6 pt-2">
            
            {/* Total Benefit Award Highlight Banner */}
            <div className="p-5 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-xs uppercase tracking-wider">
                <Award className="w-4 h-4" /> Total Estimated Financial Entitlement
              </div>
              
              <div className="flex items-baseline gap-2">
                {cash > 0 ? (
                  <span className="text-3xl sm:text-4xl font-black text-emerald-700 dark:text-emerald-400">
                    ₹{cash.toLocaleString('en-IN')} <span className="text-sm font-semibold text-foreground">/ year Direct Cash</span>
                  </span>
                ) : (
                  <span className="text-2xl font-bold text-foreground">
                    Subsidized Credit & Insurance Enrolled
                  </span>
                )}
              </div>

              {subsidy.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {subsidy.map((sub, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                      + {sub}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* List of Eligible Schemes */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Matching Programs ({eligibleSchemes.length}):
              </h3>

              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                {eligibleSchemes.map((s) => (
                  <div 
                    key={s._id}
                    className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-extrabold text-foreground">{s.name}</span>
                      </div>
                      <p className="text-muted-foreground text-[11px]">{s.benefitSummary || s.ministry}</p>
                    </div>

                    <Button asChild size="sm" variant="outline" className="rounded-xl text-xs shrink-0 h-8">
                      <a href={s.officialLink} target="_blank" rel="noopener noreferrer" className="gap-1">
                        Apply <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-border gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Re-evaluate Farm Details
              </Button>

              <Button
                size="sm"
                onClick={onClose}
                className="rounded-xl text-xs font-bold px-5"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SchemeEligibilityModal
