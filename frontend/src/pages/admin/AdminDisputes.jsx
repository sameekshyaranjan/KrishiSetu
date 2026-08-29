import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
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

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Karnataka APMC dispute arbitration docket synchronized!')
    }, 600)
  }

  // Execute Ruling Actions
  const handleExecuteRuling = (id, optionType) => {
    let rulingText = ''
    if (optionType === 'farmer_100') {
      rulingText = '100% Escrow Released to Farmer 🌾 (Buyer claim dismissed by APMC tribunal).'
    } else if (optionType === 'split_85_15') {
      rulingText = 'Mutual Compromise ⚖️: 85% Escrow Released to Farmer, 15% Refunded to Buyer for quality compensation.'
    } else if (optionType === 'buyer_100') {
      rulingText = '100% Full Refund to Buyer 💼 (Lot rejected for statutory non-conformance).'
    }

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
    .reduce((acc, d) => acc + d.escrowLockedAmount, 0)

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
        d._id.toLowerCase().includes(q) ||
        d.farmerName.toLowerCase().includes(q) ||
        d.buyerName.toLowerCase().includes(q) ||
        d.cropName.toLowerCase().includes(q) ||
        d.lotId.toLowerCase().includes(q) ||
        d.mandiYard.toLowerCase().includes(q)

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
            Trade Dispute Mediation & Escrow Arbitration ⚖️
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Arbitrate quality variance complaints, mediate weighbridge discrepancies, and execute statutory escrow fund apportionments.
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
            Refresh Docket
          </Button>

          <Button 
            onClick={() => toast.success('APMC Tribunal Arbitration Ruling Archive exported!')}
            className="rounded-xl text-xs h-10 px-4 font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md"
          >
            <Download className="w-4 h-4 mr-1.5" /> Export Rulings
          </Button>
        </div>
      </div>

      {/* 2. 4 Arbitration KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Active Trade Disputes</span>
          <p className="text-2xl font-black text-amber-600">{activeDisputesCount} Cases</p>
          <span className="text-[11px] text-amber-600 font-semibold">Under Assayer Inspection ⚠️</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Escrow Capital on Hold</span>
          <p className="text-2xl font-black text-purple-600">₹{(totalLockedInDispute / 100000).toFixed(2)} Lakhs</p>
          <span className="text-[11px] text-muted-foreground">Protected in Trustee Vault</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Avg Resolution Speed</span>
          <p className="text-2xl font-black text-emerald-600">4.2 Hours</p>
          <span className="text-[11px] text-emerald-600 font-bold">Fast-Tracked APMC Ruling 🟢</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Amicable Settlement Rate</span>
          <p className="text-2xl font-black text-foreground">96.4%</p>
          <span className="text-[11px] text-muted-foreground">Mutual Consensus Reached</span>
        </div>
      </div>

      {/* 3. Category Filter Tabs & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {CATEGORY_TABS.map((tab) => {
              const count =
                tab.id === 'all'
                  ? disputes.length
                  : tab.id === 'resolved'
                  ? disputes.filter((d) => d.status === 'resolved').length
                  : disputes.filter((d) => d.category === tab.id).length

              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    selectedCategory === tab.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    selectedCategory === tab.id ? 'bg-black/20 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case ID, farmer, trader, or crop..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </div>
        </div>

        {/* Dispute Table */}
        <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border">
                <tr>
                  <th className="p-4">Case ID & Time</th>
                  <th className="p-4">Disputing Parties</th>
                  <th className="p-4">Commodity / Escrow</th>
                  <th className="p-4">Claim Summary</th>
                  <th className="p-4">Tribunal Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDisputes.map((d) => (
                  <tr key={d._id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-extrabold text-[11px] text-purple-600 block">{d._id}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {d.timestamp}
                      </span>
                    </td>

                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{d.farmerName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                        <span>{d.buyerName}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-foreground">{d.cropName}</p>
                      <span className="font-mono font-extrabold text-[11px] text-purple-600 block">
                        ₹{d.escrowLockedAmount.toLocaleString('en-IN')} Locked
                      </span>
                      <span className="text-[10px] text-muted-foreground">{d.quantity}</span>
                    </td>

                    <td className="p-4 max-w-xs">
                      <p className="text-xs text-foreground line-clamp-2 leading-relaxed">{d.claimReason}</p>
                      <span className="text-[10px] text-muted-foreground">{d.mandiYard}</span>
                    </td>

                    <td className="p-4">
                      {d.status === 'resolved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Arbitrated 🟢
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[10px] font-bold border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" /> Under Review 🟡
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <Button 
                        size="sm"
                        variant={d.status === 'resolved' ? 'outline' : 'default'}
                        onClick={() => setSelectedDisputeForRuling(d)}
                        className={`rounded-xl text-xs h-8 px-3 shadow-sm font-bold ${
                          d.status === 'resolved' 
                            ? 'text-purple-600 border-purple-500/30' 
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        <Gavel className="w-3.5 h-3.5 mr-1" />
                        {d.status === 'resolved' ? 'View Ruling' : 'Arbitrate Case'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Full-Screen Dispute Arbitration & Ruling Modal */}
      {selectedDisputeForRuling && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold">
                  <Gavel className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">
                    APMC Dispute Arbitration & Escrow Apportionment Hearing
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Case Docket #{selectedDisputeForRuling._id} • {selectedDisputeForRuling.mandiYard}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedDisputeForRuling(null)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Disputing Parties Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                <span className="text-[10px] text-emerald-700 font-bold uppercase flex items-center gap-1">
                  <Sprout className="w-3.5 h-3.5" /> PRODUCER / FARMER
                </span>
                <p className="font-extrabold text-foreground text-sm">{selectedDisputeForRuling.farmerName}</p>
                <p className="text-[11px] text-muted-foreground">Phone: {selectedDisputeForRuling.farmerPhone}</p>
                <p className="text-[11px] font-mono text-muted-foreground">Bhoomi Land RTC: {selectedDisputeForRuling.farmerRtc}</p>
                <div className="p-2.5 rounded-xl bg-white/60 dark:bg-card border border-border text-[11px] text-foreground mt-2">
                  <span className="font-bold block text-emerald-700">Farmer Defense:</span>
                  &ldquo;{selectedDisputeForRuling.farmerStatement}&rdquo;
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
                <span className="text-[10px] text-amber-700 font-bold uppercase flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> COMPLAINING BUYER / TRADER
                </span>
                <p className="font-extrabold text-foreground text-sm">{selectedDisputeForRuling.buyerName}</p>
                <p className="text-[11px] text-muted-foreground">Phone: {selectedDisputeForRuling.buyerPhone}</p>
                <p className="text-[11px] font-mono text-muted-foreground">APMC License: {selectedDisputeForRuling.buyerLicense}</p>
                <div className="p-2.5 rounded-xl bg-white/60 dark:bg-card border border-border text-[11px] text-foreground mt-2">
                  <span className="font-bold block text-amber-700">Buyer Claim:</span>
                  &ldquo;{selectedDisputeForRuling.claimReason}&rdquo;
                </div>
              </div>
            </div>

            {/* Official Assayer Inspection Box */}
            <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                <span className="font-black text-purple-900 flex items-center gap-1.5 uppercase text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-purple-600" /> APMC Certified Mandi Assayer Laboratory Report
                </span>
                <span className="text-[10px] font-mono text-purple-700 font-bold">Physical Assay Stamp #KA-LAB-8819</span>
              </div>
              <p className="text-xs text-purple-950 leading-relaxed font-medium">
                {selectedDisputeForRuling.assayerInspectionReport}
              </p>
              <div className="flex justify-between items-center pt-1 font-mono text-[11px] text-purple-800">
                <span>Produce Lot: {selectedDisputeForRuling.cropName} ({selectedDisputeForRuling.quantity})</span>
                <span className="font-bold">Escrow In Trust: ₹{selectedDisputeForRuling.escrowLockedAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* If Already Resolved */}
            {selectedDisputeForRuling.status === 'resolved' && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5 uppercase text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Statutory Tribunal Ruling Enacted:
                </span>
                <p className="font-bold text-foreground">{selectedDisputeForRuling.ruling}</p>
              </div>
            )}

            {/* Arbitration Execution Action Buttons (Only for active cases) */}
            {selectedDisputeForRuling.status === 'under_review' && (
              <div className="space-y-3 pt-2 border-t border-border">
                <span className="text-xs font-black uppercase text-foreground block">
                  Select APMC Tribunal Arbitration Ruling & Apportion Escrow:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Option 1: 100% to Farmer */}
                  <button
                    onClick={() => handleExecuteRuling(selectedDisputeForRuling._id, 'farmer_100')}
                    className="p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 hover:border-emerald-600 text-left transition-all group space-y-1"
                  >
                    <div className="flex items-center gap-1.5 font-extrabold text-xs text-emerald-700">
                      <Sprout className="w-4 h-4" /> Option A: 100% to Farmer
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      Reject buyer grievance. Disburse full ₹{selectedDisputeForRuling.escrowLockedAmount.toLocaleString('en-IN')} to producer.
                    </p>
                  </button>

                  {/* Option 2: 85% Split */}
                  <button
                    onClick={() => handleExecuteRuling(selectedDisputeForRuling._id, 'split_85_15')}
                    className="p-4 rounded-2xl bg-purple-500/10 border-2 border-purple-500/30 hover:border-purple-600 text-left transition-all group space-y-1"
                  >
                    <div className="flex items-center gap-1.5 font-extrabold text-xs text-purple-700">
                      <Scale className="w-4 h-4" /> Option B: 85% - 15% Split
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      Mutual compromise: ₹{(selectedDisputeForRuling.escrowLockedAmount * 0.85).toLocaleString('en-IN')} to Farmer, 15% refund to buyer.
                    </p>
                  </button>

                  {/* Option 3: 100% to Buyer */}
                  <button
                    onClick={() => handleExecuteRuling(selectedDisputeForRuling._id, 'buyer_100')}
                    className="p-4 rounded-2xl bg-rose-500/10 border-2 border-rose-500/30 hover:border-rose-600 text-left transition-all group space-y-1"
                  >
                    <div className="flex items-center gap-1.5 font-extrabold text-xs text-rose-700">
                      <XCircle className="w-4 h-4" /> Option C: 100% Refund Buyer
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      Reject harvest. Return 100% escrow to buyer; farmer arranges pickup.
                    </p>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDisputes
