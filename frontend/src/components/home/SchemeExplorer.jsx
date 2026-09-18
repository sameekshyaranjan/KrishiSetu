import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  ArrowRight,
  Landmark,
  ShieldCheck,
  IndianRupee,
  Sprout,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import ScrollPop from '@/components/common/ScrollPop'

// Scheme data — grounded in actual Schemes.jsx categories + SchemeEligibilityModal.jsx logic
// Eligibility rules sourced exactly from SchemeEligibilityModal.jsx eligibleSchemes filter
const SCHEMES = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN',
    fullName: 'Pradhan Mantri Kisan Samman Nidhi',
    category: 'Direct Income Support',
    benefit: '₹6,000/year direct bank transfer',
    eligibility: {
      landSize: ['small', 'medium'],
      requiresAadhaar: true,
      crops: [],
    },
    icon: IndianRupee,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'raitha-siri',
    name: 'Raitha Siri',
    fullName: 'Karnataka Millet Mission Scheme',
    category: 'Millet & Dryland Subsidy',
    benefit: '₹10,000/acre subsidy for millet cultivation',
    eligibility: {
      landSize: ['small', 'medium', 'large'],
      requiresAadhaar: false,
      crops: ['Millets'],
      stateOnly: true,
    },
    icon: Sprout,
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/20',
  },
  {
    id: 'pmksy',
    name: 'PMKSY',
    fullName: 'Pradhan Mantri Krishi Sinchayee Yojana',
    category: 'Irrigation & Water Conservation',
    benefit: '55% subsidy on drip/sprinkler irrigation',
    eligibility: {
      landSize: ['small', 'medium', 'large'],
      requiresAadhaar: false,
      crops: [],
    },
    icon: Landmark,
    color: 'text-sky-600',
    bg: 'bg-sky-500/10 border-sky-500/20',
  },
  {
    id: 'pmfby',
    name: 'PMFBY',
    fullName: 'Pradhan Mantri Fasal Bima Yojana',
    category: 'Crop Insurance & Risk Shield',
    benefit: 'Crop insurance cover at 1.5–5% premium',
    eligibility: {
      landSize: ['small', 'medium', 'large', 'tenant'],
      requiresAadhaar: false,
      crops: [],
    },
    icon: ShieldCheck,
    color: 'text-amber-600',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
]

// Inputs match SchemeEligibilityModal.jsx state fields exactly
export const SchemeExplorer = () => {
  const [landSize, setLandSize] = useState('small')
  const [isAadhaarLinked, setIsAadhaarLinked] = useState(true)
  const [selectedCrops, setSelectedCrops] = useState(['Millets', 'Food Grains'])
  const [expanded, setExpanded] = useState(null)

  // Eligibility logic ported from SchemeEligibilityModal.jsx
  const eligibleSchemes = useMemo(() => {
    return SCHEMES.filter((s) => {
      if (!s.eligibility.landSize.includes(landSize)) return false
      if (s.eligibility.requiresAadhaar && !isAadhaarLinked) return false
      if (s.eligibility.crops.length > 0) {
        return s.eligibility.crops.some((c) => selectedCrops.includes(c))
      }
      return true
    })
  }, [landSize, isAadhaarLinked, selectedCrops])

  // Estimated benefit (from SchemeEligibilityModal.jsx getEstimatedBenefit)
  const estimatedCash = useMemo(() => {
    let cash = 0
    if (eligibleSchemes.some(s => s.id === 'pm-kisan')) cash += 6000
    if (eligibleSchemes.some(s => s.id === 'raitha-siri')) cash += 10000
    return cash
  }, [eligibleSchemes])

  const CROPS = ['Food Grains', 'Millets', 'Vegetables', 'Fruits', 'Cotton', 'Sugarcane']

  const toggleCrop = (crop) => {
    setSelectedCrops(prev =>
      prev.includes(crop)
        ? prev.length > 1 ? prev.filter(c => c !== crop) : prev
        : [...prev, crop]
    )
  }

  return (
    <section id="schemes" className="border-b border-border bg-secondary py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">

        {/* Header */}
        <div className="grid gap-4 border-b border-border pb-8 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              Government schemes
            </p>
            <h2 className="mt-3 font-display text-4xl leading-none sm:text-5xl">
              Know which schemes you qualify for.
            </h2>
          </div>
          <p className="text-sm leading-7 text-muted-foreground max-w-sm lg:justify-self-end lg:text-right">
            Answer three questions. KrishiSetu instantly matches you with relevant central and state government schemes.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">

          {/* LEFT — eligibility inputs */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-foreground">Quick eligibility check</h3>

            {/* Land size — from SchemeEligibilityModal landSize options */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground block mb-2">
                Land holding
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'small', label: 'Small', sub: 'Below 5 acres' },
                  { id: 'medium', label: 'Medium', sub: '5 – 10 acres' },
                  { id: 'large', label: 'Large', sub: 'Above 10 acres' },
                  { id: 'tenant', label: 'Tenant', sub: 'Leased land' },
                ].map(({ id, label, sub }) => (
                  <button
                    key={id}
                    onClick={() => setLandSize(id)}
                    className={`rounded-sm border p-3 text-left transition-colors ${
                      landSize === id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border bg-background hover:border-primary/30'
                    }`}
                  >
                    <p className={`text-xs font-bold ${landSize === id ? 'text-primary' : 'text-foreground'}`}>
                      {label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Aadhaar linked */}
            <div className="flex items-center justify-between rounded-sm border border-border bg-background p-4">
              <div>
                <p className="text-xs font-semibold text-foreground">Aadhaar linked to bank account?</p>
                <p className="text-[10px] text-muted-foreground">Required for DBT schemes like PM-KISAN</p>
              </div>
              <button
                onClick={() => setIsAadhaarLinked(v => !v)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  isAadhaarLinked ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
                role="switch"
                aria-checked={isAadhaarLinked}
              >
                <span className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                  isAadhaarLinked ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Crops grown */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground block mb-2">
                Crops you grow (select all that apply)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CROPS.map((crop) => (
                  <button
                    key={crop}
                    onClick={() => toggleCrop(crop)}
                    className={`rounded-sm border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      selectedCrops.includes(crop)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/30'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated benefit */}
            {estimatedCash > 0 && (
              <div className="rounded-sm border border-primary/20 bg-primary/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
                  Estimated annual benefit
                </p>
                <p className="mt-1 font-display text-3xl text-foreground">
                  ₹{estimatedCash.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-muted-foreground">Direct cash transfers only</p>
              </div>
            )}

            <Button variant="farmer" size="xl" className="w-full" asChild>
              <Link to="/schemes">
                View full scheme directory <ArrowRight />
              </Link>
            </Button>
          </div>

          {/* RIGHT — matched schemes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">
                {eligibleSchemes.length} scheme{eligibleSchemes.length !== 1 ? 's' : ''} matched
              </h3>
              <span className="text-[10px] text-muted-foreground">
                Based on your profile
              </span>
            </div>

            <div className="space-y-3">
              {SCHEMES.map((scheme, idx) => {
                const isEligible = eligibleSchemes.some(s => s.id === scheme.id)
                const isOpen = expanded === scheme.id
                const Icon = scheme.icon

                return (
                  <ScrollPop
                    key={scheme.id}
                    delay={idx * 75}
                    className={`border rounded-sm transition-all ${
                      isEligible
                        ? 'border-border bg-card'
                        : 'border-border/50 bg-muted/20 opacity-50'
                    }`}
                  >
                    <button
                      onClick={() => isEligible && setExpanded(isOpen ? null : scheme.id)}
                      className="w-full text-left px-4 py-4 flex items-start gap-3"
                    >
                      <div className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border ${scheme.bg}`}>
                        <Icon className={`size-4 ${scheme.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-foreground">{scheme.name}</span>
                          <span className="text-[10px] text-muted-foreground hidden sm:inline">· {scheme.fullName}</span>
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {scheme.category}
                          </span>
                        </div>
                        <p className="text-xs text-primary font-semibold mt-0.5">{scheme.benefit}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isEligible ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-0.5">
                            <CheckCircle2 className="size-3" /> Eligible
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground bg-muted rounded px-2 py-0.5">
                            Ineligible
                          </span>
                        )}
                        <ChevronRight className={`size-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                      </div>
                    </button>

                    {/* Expanded details */}
                    {isOpen && (
                      <div className="border-t border-border px-4 py-4 bg-muted/30">
                        <p className="text-xs text-muted-foreground leading-5 mb-3">
                          {scheme.id === 'pm-kisan' && 'Small/marginal farmers with Aadhaar-linked bank accounts receive ₹2,000 in three equal installments annually.'}
                          {scheme.id === 'raitha-siri' && 'Karnataka state scheme. Farmers growing millets (ragi, bajra, jowar) receive per-acre subsidy for promoting sustainable dryland farming.'}
                          {scheme.id === 'pmksy' && 'Subsidy on drip and sprinkler irrigation systems. Implementation via State Agriculture Departments.'}
                          {scheme.id === 'pmfby' && 'Crop insurance covering yield loss from natural calamities, pest attacks and diseases at subsidized premium rates.'}
                        </p>
                        <Link
                          to="/schemes"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          Apply via KrishiSetu <ArrowRight className="size-3.5" />
                        </Link>
                      </div>
                    )}
                  </ScrollPop>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SchemeExplorer
