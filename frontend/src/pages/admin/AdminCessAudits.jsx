import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import cessService from '@/services/cessService'
import exportService from '@/services/exportService'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  Landmark, 
  ShieldCheck, 
  DollarSign, 
  FileText, 
  Download, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  Clock, 
  Building2, 
  QrCode, 
  X, 
  Printer, 
  Sparkles, 
  TrendingUp, 
  Layers, 
  ArrowUpRight,
  Receipt
} from 'lucide-react'

const YARD_TABS = [
  { id: 'all', label: 'All APMC Yards' },
  { id: 'yeshwanthpur', label: 'Yeshwanthpur (Bengaluru)' },
  { id: 'hassan', label: 'Hassan APMC' },
  { id: 'mandya', label: 'Mandya APMC' },
  { id: 'kolar', label: 'Kolar APMC' }
]

export const AdminCessAudits = () => {
  const { user } = useAuth()
  const [audits, setAudits] = useState([])
  const [selectedYard, setSelectedYard] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChallan, setSelectedChallan] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadAudits = async () => {
    try {
      const data = await cessService.getCessAudits()
      setAudits(data || [])
    } catch {
      // Fallback
    }
  }

  useEffect(() => {
    loadAudits()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadAudits()
    setIsRefreshing(false)
    toast.success('Karnataka State Treasury APMC Cess Ledger synchronized! ⚡')
  }

  const handleRemitToTreasury = async (auditId) => {
    const updated = await cessService.remitCessToTreasury(auditId)
    setAudits(updated)
    toast.success('Statutory Cess remitted to Karnataka State Treasury! 🏛️')
  }

  const handleRemitAll = async () => {
    const updated = await cessService.remitAllPending()
    setAudits(updated)
    toast.success('All pending APMC Cess remitted to State Treasury in batch! 🚀')
  }

  // Aggregate Metrics
  const totalGrossTrade = audits.reduce((acc, t) => acc + (t.tradeValue || t.baseAmount || 0), 0)
  const totalCessCollected = audits.reduce((acc, t) => acc + (t.cessAmount || t.apmcCess || 0), 0)
  const totalPendingCess = audits
    .filter((t) => t.remittanceStatus === 'pending_remittance' || t.treasuryStatus === 'pending')
    .reduce((acc, t) => acc + (t.cessAmount || t.apmcCess || 0), 0)

  // Filtered List
  const filteredAudits = useMemo(() => {
    return audits.filter((t) => {
      const matchesYard =
        selectedYard === 'all'
          ? true
          : (t.mandiYard || '').toLowerCase().includes(selectedYard)

      const q = searchQuery.toLowerCase()
      const matchesSearch =
        (t._id || '').toLowerCase().includes(q) ||
        (t.commodity || t.cropName || '').toLowerCase().includes(q) ||
        (t.traderName || t.buyerName || '').toLowerCase().includes(q) ||
        (t.farmerName || '').toLowerCase().includes(q) ||
        (t.mandiYard || '').toLowerCase().includes(q)

      return matchesYard && matchesSearch
    })
  }, [audits, selectedYard, searchQuery])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20 mb-2">
            <Landmark className="w-3.5 h-3.5" />
            <span>Karnataka State Agricultural Marketing Board (KSAMB) Statutory Revenue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Statutory 1.5% APMC Cess Audit & Treasury Ledger 🏛️
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Automated statutory mandi market fee reconciliation, e-Challan generation, and direct State Treasury remittances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-xl text-xs h-10 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync Treasury
          </Button>

          <Button 
            onClick={() => exportService.exportCessLedger(filteredAudits)}
            size="sm" 
            className="rounded-xl text-xs font-bold shadow-md h-10 px-4 bg-primary text-primary-foreground"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Cess CSV
          </Button>

          {totalPendingCess > 0 && (
            <Button
              onClick={handleRemitAll}
              size="sm"
              className="rounded-xl text-xs font-bold shadow-md h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Landmark className="w-3.5 h-3.5 mr-1.5" /> Batch Remit Pending Cess
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Gross Audited Trade Turnover</p>
            <h3 className="text-2xl font-black text-foreground font-mono">₹{totalGrossTrade.toLocaleString('en-IN')}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">100% Digital Invoicing Compliance</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Total 1.5% APMC Cess Levied</p>
            <h3 className="text-2xl font-black text-emerald-600 font-mono">₹{totalCessCollected.toLocaleString('en-IN')}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Statutory Mandi Development Fund</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Pending State Treasury Remittance</p>
            <h3 className="text-2xl font-black text-amber-600 font-mono">₹{totalPendingCess.toLocaleString('en-IN')}</h3>
            <span className="text-[11px] text-amber-600 font-medium">{totalPendingCess === 0 ? 'All Remittances Cleared' : 'Action Required'}</span>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Controls */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {YARD_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedYard(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedYard === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search challan #, commodity, buyer, or yard..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 4. Cess Audit Ledger Cards */}
      <div className="space-y-4">
        {filteredAudits.map((audit) => {
          const isRemitted = audit.remittanceStatus === 'remitted' || audit.treasuryStatus === 'remitted'
          const grossVal = audit.tradeValue || audit.baseAmount || 0
          const cessVal = audit.cessAmount || audit.apmcCess || 0

          return (
            <div
              key={audit._id}
              className="p-6 sm:p-7 rounded-3xl bg-card border border-border hover:border-primary/50 shadow-sm transition-all space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-foreground">{audit._id}</span>
                    <span className="text-xs text-muted-foreground">• {audit.collectedDate || audit.date}</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                      isRemitted
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}>
                      {isRemitted ? 'Treasury Remitted 🏛️' : 'Pending Remittance ⚠️'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-primary" /> {audit.mandiYard}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-muted-foreground block font-medium">1.5% APMC Cess:</span>
                  <span className="text-xl font-black text-emerald-600 font-mono">
                    ₹{cessVal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Trade Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                  <span className="font-bold text-foreground">Buyer / Procurement Firm:</span>
                  <p className="text-foreground font-semibold">{audit.traderName || audit.buyerName}</p>
                  <p className="text-muted-foreground font-mono text-[11px]">GSTIN: {audit.traderGstin || audit.buyerGstin}</p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                  <span className="font-bold text-foreground">Produce & Lot:</span>
                  <p className="text-foreground font-semibold">{audit.commodity || audit.cropName}</p>
                  <p className="text-muted-foreground">Producer: {audit.farmerName}</p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Trade Value:</span>
                    <span className="font-mono font-bold text-foreground">₹{grossVal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Statutory Levy:</span>
                    <span className="font-mono font-semibold text-emerald-600">1.5% KSAMB Cess</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-border/60 text-[11px]">
                    <span className="text-muted-foreground">Treasury Challan:</span>
                    <span className="font-mono font-bold text-foreground">{audit.treasuryChallanNo || audit.treasuryRef || 'Unremitted'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  Settlement Escrow: <strong className="text-foreground">Axis Bank Escrow Trust Vault</strong>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedChallan(audit)
                      toast.success(`Exporting Treasury Challan #${audit.treasuryChallanNo || audit._id}`)
                    }}
                    className="rounded-xl text-xs h-9 px-4 flex items-center gap-1.5"
                  >
                    <Receipt className="w-3.5 h-3.5" /> View Challan
                  </Button>

                  {!isRemitted && (
                    <Button
                      size="sm"
                      onClick={() => handleRemitToTreasury(audit._id)}
                      className="rounded-xl text-xs font-bold h-9 px-5 bg-primary text-primary-foreground shadow-sm"
                    >
                      Remit to State Treasury 🏛️
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AdminCessAudits
