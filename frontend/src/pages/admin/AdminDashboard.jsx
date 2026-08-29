import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  FileText, 
  Landmark, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Activity, 
  Download, 
  RefreshCw, 
  Building2, 
  Scale, 
  UserCheck, 
  X, 
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react'

const PENDING_VERIFICATIONS = [
  {
    _id: 'KYC-FRM-8819',
    type: 'farmer',
    name: 'Nagaraju Byrappa',
    district: 'Mandya',
    documentType: 'Bhoomi RTC Land Parcel #RTC-MND-4421',
    appliedAt: '25 mins ago',
    acres: 4.8,
    soilType: 'Red Loam'
  },
  {
    _id: 'KYC-TRD-4412',
    type: 'trader',
    name: 'Coastal Agro Processing Corp',
    district: 'Mangaluru',
    documentType: 'APMC Unified License #KA-MNG-TRD-2026',
    appliedAt: '1 hour ago',
    category: 'Category-A Wholesale',
    gstin: '29AABCC4412K1Z9'
  },
  {
    _id: 'KYC-FRM-8820',
    type: 'farmer',
    name: 'Savitramma Gowda',
    district: 'Hassan',
    documentType: 'Bhoomi RTC Land Parcel #RTC-HSN-1129',
    appliedAt: '2 hours ago',
    acres: 6.2,
    soilType: 'Black Cotton Soil'
  }
]

const MANDI_YARDS_PERFORMANCE = [
  {
    yard: 'Yeshwanthpur APMC Main Yard, Bengaluru',
    turnover: 5840000,
    activeAuctions: 38,
    cessCollected: 87600,
    weighmentCompliance: '100%',
    status: 'High Volume'
  },
  {
    yard: 'Hassan APMC Market Yard',
    turnover: 4210000,
    activeAuctions: 24,
    cessCollected: 63150,
    weighmentCompliance: '98.9%',
    status: 'Optimal'
  },
  {
    yard: 'Mandya APMC Market Yard',
    turnover: 3680000,
    activeAuctions: 19,
    cessCollected: 55200,
    weighmentCompliance: '99.2%',
    status: 'Optimal'
  },
  {
    yard: 'Belagavi APMC Main Yard',
    turnover: 2850000,
    activeAuctions: 15,
    cessCollected: 42750,
    weighmentCompliance: '100%',
    status: 'Optimal'
  },
  {
    yard: 'Kolar APMC Market Yard',
    turnover: 1820000,
    activeAuctions: 12,
    cessCollected: 27300,
    weighmentCompliance: '97.8%',
    status: 'Moderate'
  }
]

const SYSTEM_AUDIT_STREAM = [
  { id: 'log-1', time: '5 mins ago', event: 'Escrow Lock Authorized', detail: '₹2,64,000 locked for Tomato Lot #LOT-KA-HSN-101 (Buyer: KA Agro Traders)', type: 'escrow' },
  { id: 'log-2', time: '22 mins ago', event: 'Weighbridge Certificate Verified', detail: 'Gross 14,280 kg, Tare 2,280 kg (Net 120 Qtl) verified at Yeshwanthpur APMC', type: 'weighment' },
  { id: 'log-3', time: '1 hour ago', event: 'Statutory Mandi Cess Remitted', detail: '₹3,960 (1.5%) credited to Karnataka State Treasury Account', type: 'cess' },
  { id: 'log-4', time: '2 hours ago', event: 'New Trader Registered', detail: 'Mysuru Wholesale Spices Ltd registered with GSTIN 29AABCM8821P1Z4', type: 'auth' }
]

export const AdminDashboard = () => {
  const { user } = useAuth()
  const [kycQueue, setKycQueue] = useState(PENDING_VERIFICATIONS)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Central APMC state command metrics synchronized!')
    }, 600)
  }

  const handleApproveKyc = (id, name) => {
    setKycQueue((prev) => prev.filter((k) => k._id !== id))
    toast.success(`KYC Approved for ${name}! Clearance certificate issued. 🟢`)
  }

  const handleRejectKyc = (id, name) => {
    setKycQueue((prev) => prev.filter((k) => k._id !== id))
    toast.error(`Clarification requested from ${name}.`)
  }

  // Aggregate Metrics
  const totalTurnover = MANDI_YARDS_PERFORMANCE.reduce((acc, y) => acc + y.turnover, 0)
  const totalCess = MANDI_YARDS_PERFORMANCE.reduce((acc, y) => acc + y.cessCollected, 0)
  const totalActiveAuctions = MANDI_YARDS_PERFORMANCE.reduce((acc, y) => acc + y.activeAuctions, 0)

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header & Live State APMC Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-semibold border border-purple-500/20 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Government of Karnataka • Agricultural Marketing Board State Node</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            State APMC Command Center & Oversight Dashboard 🏛️
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time monitoring of statewide harvest auctions, statutory market cess remittances, and stakeholder KYC moderation.
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
            Refresh State Feeds
          </Button>

          <Button 
            onClick={() => toast.success('Statewide Agricultural Economic Report FY 2026-27 exported!')}
            className="rounded-xl text-xs h-10 px-4 font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md"
          >
            <Download className="w-4 h-4 mr-1.5" /> Export State Report
          </Button>
        </div>
      </div>

      {/* 2. 4 Macro-Economic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 via-card to-card border border-purple-500/30 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700">Gross Mandi Turnover</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">₹{(totalTurnover / 10000000).toFixed(2)} Cr</p>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +16.4% YoY Volume Growth
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Active Stakeholders</span>
            <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-primary">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">1,482 Users</p>
          <span className="text-[11px] text-muted-foreground">1,240 Farmers • 242 Traders</span>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Pending KYC Moderation</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600">{kycQueue.length} Requests</p>
          <span className="text-[11px] text-amber-600 font-semibold">Bhoomi RTC & APMC Licenses</span>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">APMC Cess Remitted</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600">₹{totalCess.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-emerald-600 font-bold">100% Remitted to State Treasury</span>
        </div>
      </div>

      {/* 3. Pending KYC Verification Quick Triage Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-600" />
              Pending Farmer & Trader KYC Verification Queue ({kycQueue.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Review Land RTC demographic records and corporate APMC wholesale permits awaiting state authorization.
            </p>
          </div>

          <Button asChild variant="outline" size="sm" className="rounded-xl text-xs h-9">
            <Link to="/admin/users">
              View All Directory <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>

        {kycQueue.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kycQueue.map((item) => (
              <div 
                key={item._id}
                className="p-5 rounded-3xl bg-card border border-border hover:border-purple-500/40 transition-all shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase">{item._id}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                      item.type === 'farmer' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {item.type} KYC
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-foreground">{item.name}</h3>
                  <p className="text-xs text-muted-foreground font-semibold">
                    District: <span className="text-foreground">{item.district}</span> • Applied: {item.appliedAt}
                  </p>

                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 text-xs space-y-1 font-mono">
                    <span className="text-[10px] text-muted-foreground font-sans block font-bold">Document Submitted:</span>
                    <p className="text-foreground font-semibold truncate">{item.documentType}</p>
                    {item.acres && <span className="text-[11px] text-emerald-600 block">{item.acres} Acres • {item.soilType}</span>}
                    {item.gstin && <span className="text-[11px] text-primary block">GSTIN: {item.gstin}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectKyc(item._id, item.name)}
                    className="rounded-xl text-xs h-9 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                  >
                    Clarify
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleApproveKyc(item._id, item.name)}
                    className="rounded-xl text-xs font-bold h-9 bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                  >
                    Approve 🟢
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-3xl bg-card border border-border space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-foreground">KYC Queue Cleared</p>
            <p className="text-xs text-muted-foreground">All farmer and trader verification requests have been audited.</p>
          </div>
        )}
      </div>

      {/* 4. State Mandi Yards Turnover & Cess Performance Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              Karnataka APMC Market Yards Turnover & Statutory Compliance
            </h2>
            <p className="text-xs text-muted-foreground">
              District-wise procurement metrics, active eNAM auctions, and statutory cess reconciliation.
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-purple-600 bg-purple-500/10 px-3 py-1 rounded-xl border border-purple-500/20 self-start">
            {totalActiveAuctions} Active State Auctions
          </span>
        </div>

        <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border">
                <tr>
                  <th className="p-4">APMC Market Yard</th>
                  <th className="p-4">Active Auctions</th>
                  <th className="p-4">Gross Turnover (₹)</th>
                  <th className="p-4">Statutory Cess (1.5%)</th>
                  <th className="p-4">Weighment Audit Pass</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MANDI_YARDS_PERFORMANCE.map((yard, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <p className="font-extrabold text-foreground">{yard.yard}</p>
                      <span className="text-[10px] text-muted-foreground">State Node #{idx + 101}</span>
                    </td>

                    <td className="p-4 font-mono font-bold text-foreground">
                      {yard.activeAuctions} Lots
                    </td>

                    <td className="p-4 font-mono font-black text-foreground">
                      ₹{yard.turnover.toLocaleString('en-IN')}
                    </td>

                    <td className="p-4 font-mono font-extrabold text-emerald-600">
                      ₹{yard.cessCollected.toLocaleString('en-IN')}
                    </td>

                    <td className="p-4 font-bold text-foreground">
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {yard.weighmentCompliance}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                        yard.status === 'High Volume'
                          ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      }`}>
                        {yard.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Real-Time Platform Security & Escrow Audit Log Strip */}
      <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-extrabold text-foreground">
              Real-Time Platform Security & Escrow Transaction Stream
            </h3>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            Audit Ledger: Block #2026-KA-9912
          </span>
        </div>

        <div className="divide-y divide-border text-xs">
          {SYSTEM_AUDIT_STREAM.map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground font-mono text-[10px] shrink-0 w-20">{log.time}</span>
                <div>
                  <span className="font-extrabold text-foreground">{log.event}</span>
                  <p className="text-[11px] text-muted-foreground">{log.detail}</p>
                </div>
              </div>

              <span className="font-mono text-[10px] font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-md self-start sm:self-center shrink-0">
                {log.type.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
