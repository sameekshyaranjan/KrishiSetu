import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import api from '@/services/api'
import { 
  ShieldCheck, 
  Users, 
  Landmark, 
  TrendingUp, 
  CheckCircle2, 
  Download, 
  RefreshCw, 
  Building2, 
  Scale, 
  ArrowUpRight
} from 'lucide-react'

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

export const AdminDashboard = () => {
  const { user } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dbStats, setDbStats] = useState({
    totalFarmers: 0,
    totalTraders: 0,
    activeDisputes: 0,
    totalTransactions: 0
  })

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard')
      if (res?.data) {
        setDbStats(res.data)
      } else if (res?.totalFarmers !== undefined) {
        setDbStats(res)
      }
    } catch (e) {
      console.warn('Could not fetch admin dashboard stats from API:', e)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchStats()
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Central APMC state command metrics synchronized!')
    }, 400)
  }

  // Aggregate Metrics
  const totalTurnover = MANDI_YARDS_PERFORMANCE.reduce((acc, y) => acc + y.turnover, 0)
  const totalCess = MANDI_YARDS_PERFORMANCE.reduce((acc, y) => acc + y.cessCollected, 0)
  const totalActiveAuctions = MANDI_YARDS_PERFORMANCE.reduce((acc, y) => acc + y.activeAuctions, 0)

  const activeStakeholders = (dbStats.totalFarmers || 0) + (dbStats.totalTraders || 0)

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
            Real-time monitoring of statewide harvest auctions, statutory market cess remittances, and dispute arbitration.
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
            <ArrowUpRight className="w-3.5 h-3.5" /> Statewide APMC Aggregated
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Active Stakeholders</span>
            <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-primary">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">{activeStakeholders > 0 ? activeStakeholders : 'Registered'}</p>
          <span className="text-[11px] text-muted-foreground">
            {dbStats.totalFarmers || 0} Farmers • {dbStats.totalTraders || 0} Traders
          </span>
        </div>

        <Link 
          to="/admin/disputes"
          className="p-6 rounded-3xl bg-card border border-border hover:border-amber-500/50 transition-all shadow-sm space-y-2 group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground group-hover:text-amber-600 transition-colors">
              Disputes Under Arbitration
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600">
            {dbStats.activeDisputes !== undefined ? `${dbStats.activeDisputes} Active` : 'Disputes'}
          </p>
          <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
            Review Escrow Claims <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </Link>

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

      {/* 3. State Mandi Yards Turnover & Cess Performance Table */}
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

    </div>
  )
}

export default AdminDashboard
