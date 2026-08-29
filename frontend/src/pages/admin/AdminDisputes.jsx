import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import disputeService from '@/services/disputeService'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  Scale, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Clock, 
  UserCheck, 
  Building2, 
  Sparkles, 
  Layers, 
  Eye, 
  X, 
  DollarSign, 
  Sprout, 
  Briefcase,
  Gavel,
  ArrowUpRight
} from 'lucide-react'

const DEMO_DISPUTES = [
  {
    _id: 'DSP-KA-2026-001',
    timestamp: '1 hour ago (14:30 IST)',
    category: 'quality',
    severity: 'HIGH',
    mandiYard: 'Yeshwanthpur APMC Main Yard, Bengaluru',
    farmerName: 'Ramesh Gowda',
    farmerPhone: '+91 98451 23456',
    farmerRtc: 'RTC-HSN-88192',
    buyerName: 'Karnataka Agro Traders Pvt Ltd',
    buyerPhone: '+91 98860 55432',
    buyerLicense: 'KA-BLR-TRD-2026',
    lotId: 'LOT-KA-HSN-101',
    cropName: 'Grade-A Fresh Hybrid Tomato',
    quantity: '120 Quintals',
    escrowLockedAmount: 264000,
    claimReason: 'Buyer reports 8.5% overripe fruit defect rate vs 3.0% maximum agreed Grade-A tolerance.',
    farmerStatement: 'Harvest was loaded fresh at 05:00 AM; transit delay by buyer caused minor softening.',
    assayerInspectionReport: 'Official APMC Assayer sample tested: 6.2% overripe softening; remaining 93.8% complies with Grade-A standard.',
    status: 'under_review', // 'under_review' | 'resolved'
    ruling: null
  },
  {
    _id: 'DSP-KA-2026-002',
    timestamp: '3 hours ago (12:15 IST)',
    category: 'transit',
    severity: 'HIGH',
    mandiYard: 'Mandya APMC Market Yard',
    farmerName: 'Basavaraj Patil',
    farmerPhone: '+91 98801 44556',
    farmerRtc: 'RTC-MND-33190',
    buyerName: 'Coastal Agro Processing Corp',
    buyerPhone: '+91 99002 44120',
    buyerLicense: 'KA-MNG-TRD-2026',
    lotId: 'LOT-KA-MND-102',
    cropName: 'Bellary Premium Red Onion',
    quantity: '250 Quintals',
    escrowLockedAmount: 662500,
    claimReason: 'Transporter arrived 6 hours past scheduled gate window resulting in unloading bottleneck.',
    farmerStatement: 'Truck was dispatched on time; heavy rain near Channapatna caused highway delay.',
    assayerInspectionReport: 'Produce condition 100% sound. Delay did not impact commodity marketability.',
    status: 'under_review',
    ruling: null
  },
  {
    _id: 'DSP-KA-2026-003',
    timestamp: '5 hours ago (10:45 IST)',
    category: 'weighbridge',
    severity: 'MEDIUM',
    mandiYard: 'Kolar APMC Market Yard',
    farmerName: 'Venkatesh Murthy',
    farmerPhone: '+91 99805 77612',
    farmerRtc: 'RTC-KLR-99214',
    buyerName: 'Karnataka Agro Traders Pvt Ltd',
    buyerPhone: '+91 98860 55432',
    buyerLicense: 'KA-BLR-TRD-2026',
    lotId: 'LOT-KA-KLR-103',
    cropName: 'Organic Finger Millet (Ragi)',
    quantity: '150 Quintals',
    escrowLockedAmount: 517500,
    claimReason: 'Weighbridge reading shows 148.8 Qtl vs declared 150.0 Qtl (1.2 Qtl moisture shrinkage).',
    farmerStatement: 'Moisture loss during 48-hour storage in dry summer climate.',
    assayerInspectionReport: 'Legal Metrology recalibration verified: Net weight 148.8 Qtl within allowable 1.0% natural shrinkage.',
    status: 'under_review',
    ruling: null
  },
  {
    _id: 'DSP-KA-2026-004',
    timestamp: '1 day ago (28 Aug 2026)',
    category: 'quality',
    severity: 'RESOLVED',
    mandiYard: 'Bengaluru Rural (Doddaballapura)',
    farmerName: 'Channappa Gowda',
    farmerPhone: '+91 94480 33112',
    farmerRtc: 'RTC-BLR-44102',
    buyerName: 'Karnataka Agro Traders Pvt Ltd',
    buyerPhone: '+91 98860 55432',
    buyerLicense: 'KA-BLR-TRD-2026',
    lotId: 'LOT-KA-BLR-104',
    cropName: 'Yellow Dent Poultry Maize',
    quantity: '300 Quintals',
    escrowLockedAmount: 615000,
    claimReason: 'Moisture content tested at 14.5% vs 13.0% maximum contract specification.',
    farmerStatement: 'Harvest was sundried for 3 days before packaging.',
    assayerInspectionReport: 'APMC Moisture Meter certified 14.2%.',
    status: 'resolved',
    ruling: '95% Disbursed to Farmer (₹5,84,250), 5% Refunded to Buyer (₹30,750) for additional mechanical drying.'
  }
]

const CATEGORY_TABS = [
  { id: 'all', label: 'All Disputes' },
  { id: 'quality', label: 'Quality Variance 💧' },
  { id: 'transit', label: 'Transit & Delay 🚛' },
  { id: 'weighbridge', label: 'Weighbridge Discrepancy ⚖️' },
  { id: 'resolved', label: 'Resolved Rulings 🟢' }
]

export const AdminDisputes = () => {
  const { user } = useAuth()
  const [disputes, setDisputes] = useState(DEMO_DISPUTES)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDisputeForRuling, setSelectedDisputeForRuling] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadDisputes = async () => {
    try {
      const data = await disputeService.getAllDisputes()
      if (Array.isArray(data) && data.length > 0) {
        // Merge with existing rich demo items if needed
        setDisputes(data.map((d) => ({
          ...d,
          cropName: d.cropName || d.commodity,
          escrowLockedAmount: d.escrowLockedAmount || d.escrowAmount,
          mandiYard: d.mandiYard || 'Hassan APMC Market Yard'
        })))
      }
    } catch {
      // Keep state
    }
  }

  useEffect(() => {
    loadDisputes()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadDisputes()
    setIsRefreshing(false)
    toast.success('Karnataka APMC dispute arbitration docket synchronized! ⚡')
  }

  // Execute Ruling Actions
  const handleExecuteRuling = async (id, optionType) => {
    let rulingText = ''
    let farmerPct = 85
    let traderPct = 15
    let action = 'payout_farmer'

    if (optionType === 'farmer_100') {
      rulingText = '100% Escrow Released to Farmer 🌾 (Buyer claim dismissed by APMC tribunal).'
      farmerPct = 100
      traderPct = 0
      action = 'payout_farmer'
    } else if (optionType === 'split_85_15') {
      rulingText = 'Mutual Compromise ⚖️: 85% Escrow Released to Farmer, 15% Refunded to Buyer for quality sorting allowance.'
      farmerPct = 85
      traderPct = 15
      action = 'payout_farmer'
    } else if (optionType === 'buyer_100') {
      rulingText = '100% Full Refund to Buyer 💼 (Lot rejected for statutory non-conformance).'
      farmerPct = 0
      traderPct = 100
      action = 'refund_trader'
    }

    await disputeService.resolveDispute(id, {
      action,
      farmerPercent: farmerPct,
      traderPercent: traderPct,
      verdictNotes: rulingText
    })

    setDisputes((prev) =>
      prev.map((d) => (d._id === id ? { ...d, status: 'resolved', ruling: rulingText } : d))
    )
    setSelectedDisputeForRuling(null)
    toast.success(`Statutory APMC Ruling Executed: ${rulingText}`)
  }

  // Aggregate Metrics
  const activeDisputesCount = disputes.filter((d) => d.status === 'under_review').length
  const totalLockedInDispute = disputes
    .filter((d) => d.status === 'under_review')
    .reduce((acc, d) => acc + (d.escrowLockedAmount || d.escrowAmount || 0), 0)

  // Filtered List
  const filteredDisputes = useMemo(() => {
    return disputes.filter((d) => {
      const matchesCategory =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'resolved'
          ? d.status === 'resolved'
          : d.category === selectedCategory

      const q = searchQuery.toLowerCase()
      const matchesSearch =
        (d._id || '').toLowerCase().includes(q) ||
        (d.farmerName || '').toLowerCase().includes(q) ||
        (d.buyerName || d.traderName || '').toLowerCase().includes(q) ||
        (d.cropName || d.commodity || '').toLowerCase().includes(q) ||
        (d.lotId || '').toLowerCase().includes(q) ||
        (d.mandiYard || '').toLowerCase().includes(q)

      return matchesCategory && matchesSearch
    })
  }, [disputes, selectedCategory, searchQuery])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-semibold border border-purple-500/20 mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Karnataka APMC Statutory Dispute Redressal Tribunal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Dispute Arbitration & Quality Claims ⚖️
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Arbitrate quality grading variances, transit damage claims, and weighbridge shrinkage with binding escrow disbursement rulings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-xl text-xs h-10 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync APMC Docket
          </Button>

          <Button 
            onClick={() => toast.success('APMC Statutory Arbitration Summary PDF exported!')}
            size="sm" 
            className="rounded-xl text-xs font-bold shadow-md h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Docket PDF
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Cases Pending Ruling</p>
            <h3 className="text-2xl font-black text-foreground">{activeDisputesCount} Active Hearings</h3>
            <span className="text-[11px] text-amber-600 font-medium">Avg Resolution Time: 4.2 Hours</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Escrow Locked Under Dispute</p>
            <h3 className="text-2xl font-black text-purple-600 font-mono">₹{totalLockedInDispute.toLocaleString('en-IN')}</h3>
            <span className="text-[11px] text-muted-foreground">Held in RBI Trust Vault</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Dispute Resolution Rate</p>
            <h3 className="text-2xl font-black text-emerald-600">98.4%</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Zero Court Escalations</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case #, producer, buyer, or APMC yard..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 4. Disputes List */}
      <div className="space-y-4">
        {filteredDisputes.map((dispute) => {
          const isResolved = dispute.status === 'resolved'
          const lockedAmount = dispute.escrowLockedAmount || dispute.escrowAmount || 0

          return (
            <div
              key={dispute._id}
              className={`p-6 sm:p-7 rounded-3xl border transition-all space-y-5 ${
                isResolved
                  ? 'bg-card border-border/80 opacity-90'
                  : 'bg-card border-purple-500/30 shadow-md'
              }`}
            >
              {/* Header: Case #, Severity, Escrow */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-foreground">{dispute._id}</span>
                    <span className="text-xs text-muted-foreground">• {dispute.timestamp || dispute.filedDate}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      isResolved
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                    }`}>
                      {isResolved ? 'Resolved 🟢' : `${dispute.severity} Priority`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-purple-600" /> {dispute.mandiYard}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-muted-foreground block font-medium">Locked Escrow Vault:</span>
                  <span className="text-xl font-black text-purple-600 font-mono">
                    ₹{lockedAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Producer & Buyer Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5 text-emerald-600" /> Producer: {dispute.farmerName}
                  </span>
                  <p className="text-muted-foreground">{dispute.farmerPhone} • Lot #{dispute.lotId}</p>
                  <p className="font-semibold text-foreground pt-1">Produce: {dispute.cropName || dispute.commodity}</p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-amber-600" /> Buyer: {dispute.buyerName || dispute.traderName}
                  </span>
                  <p className="text-muted-foreground">{dispute.buyerPhone || dispute.traderMobile}</p>
                  <p className="font-semibold text-foreground pt-1">Claim: {dispute.claimReason || dispute.disputeReason}</p>
                </div>
              </div>

              {/* Assayer Inspection Note */}
              <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 text-xs space-y-1">
                <span className="font-bold text-purple-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> APMC Official Assayer Laboratory Certificate
                </span>
                <p className="text-muted-foreground">
                  {dispute.assayerInspectionReport || dispute.hearingNotes?.[0] || 'Quality parameters independently certified by APMC mandi lab.'}
                </p>
              </div>

              {/* Resolved Ruling Box or Action Buttons */}
              {isResolved ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                  <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                    <Gavel className="w-4 h-4 text-emerald-600" /> Official APMC Statutory Ruling
                  </span>
                  <p className="font-medium text-foreground">{dispute.ruling || dispute.verdict?.verdictNotes}</p>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-border">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExecuteRuling(dispute._id, 'buyer_100')}
                    className="rounded-xl text-xs h-9 font-semibold text-rose-600 hover:bg-rose-500/10 border-rose-500/30"
                  >
                    100% Refund to Buyer
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleExecuteRuling(dispute._id, 'split_85_15')}
                    className="rounded-xl text-xs h-9 font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                  >
                    Mutual Split (85% Farmer / 15% Buyer) ⚖️
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleExecuteRuling(dispute._id, 'farmer_100')}
                    className="rounded-xl text-xs h-9 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    100% Payout to Farmer 🌾
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AdminDisputes
