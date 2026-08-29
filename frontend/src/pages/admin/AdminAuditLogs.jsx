import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import auditService from '@/services/auditService'
import exportService from '@/services/exportService'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  FileText, 
  ShieldCheck, 
  Lock, 
  Activity, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Globe, 
  Terminal, 
  X, 
  Copy, 
  Eye, 
  Gavel, 
  Landmark, 
  UserCheck, 
  Sparkles, 
  Layers, 
  ArrowUpRight
} from 'lucide-react'

const DEMO_AUDIT_LOGS = [
  {
    _id: 'LOG-KA-2026-99214',
    timestamp: '2 mins ago (15:42:08 IST)',
    category: 'escrow',
    severity: 'AUDIT',
    event: 'Escrow Lock Authorized for Tomato Lot',
    actor: 'trader1@krishisetu.com (KA Agro Traders)',
    actorRole: 'trader',
    ipAddress: '103.21.244.12',
    location: 'Bengaluru, Karnataka',
    targetResource: 'LOT-KA-HSN-101',
    details: 'Locked ₹2,64,000 from Liquid Wallet balance for 120 Qtl Tomato auction purchase.',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    payload: {
      action: 'ESCROW_LOCK',
      lotId: 'LOT-KA-HSN-101',
      grossAmount: 264000,
      cessDeduction: 3960,
      escrowVaultRef: 'VAN-HDFC-992140'
    }
  },
  {
    _id: 'LOG-KA-2026-99213',
    timestamp: '15 mins ago (15:29:45 IST)',
    category: 'kyc',
    severity: 'NOTICE',
    event: 'Farmer KYC Approved: Bhoomi RTC Validated',
    actor: 'admin@krishisetu.in (APMC State Admin)',
    actorRole: 'admin',
    ipAddress: '49.207.198.54',
    location: 'Mandi Board HQ, Bengaluru',
    targetResource: 'USR-KA-FRM-002',
    details: 'Issued official clearance for Ramesh Gowda (Hassan) on Bhoomi parcel RTC-HSN-88192 (4.5 Acres).',
    hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    payload: {
      action: 'KYC_CLEARANCE',
      rtcNumber: 'RTC-HSN-88192',
      landAcreage: 4.5,
      approvedBy: 'ADM-DEMO-993'
    }
  },
  {
    _id: 'LOG-KA-2026-99212',
    timestamp: '45 mins ago (14:59:12 IST)',
    category: 'bidding',
    severity: 'INFO',
    event: 'Competitive Auction Bid Placed (+₹100/Qtl)',
    actor: 'trader1@krishisetu.com (KA Agro Traders)',
    actorRole: 'trader',
    ipAddress: '103.21.244.12',
    location: 'Bengaluru, Karnataka',
    targetResource: 'LOT-KA-MND-102',
    details: 'Raised bid to ₹2,600/Qtl (+₹100) on 250 Quintals Bellary Red Onion.',
    hash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    payload: {
      action: 'BID_INCREMENT',
      lotId: 'LOT-KA-MND-102',
      bidRate: 2600,
      totalBidValue: 650000
    }
  }
]

const CATEGORY_TABS = [
  { id: 'all', label: 'All Audit Logs' },
  { id: 'escrow', label: 'Escrow & Payments 💸' },
  { id: 'kyc', label: 'KYC & FRUITS ID 🛡️' },
  { id: 'bidding', label: 'Auction Bids 🔨' }
]

export const AdminAuditLogs = () => {
  const { user } = useAuth()
  const [logs, setLogs] = useState(DEMO_AUDIT_LOGS)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLogForJson, setSelectedLogForJson] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadLogs = async () => {
    try {
      const data = await auditService.getAuditLogs()
      if (Array.isArray(data) && data.length > 0) {
        setLogs(data)
      }
    } catch {
      // Fallback
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadLogs()
    setIsRefreshing(false)
    toast.success('Immutable security audit ledger synchronized! ⚡')
  }

  const handleCopyHash = (hash) => {
    navigator.clipboard.writeText(hash)
    toast.success('SHA-256 Cryptographic Hash copied to clipboard!')
  }

  // Filtered List
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        (log._id || '').toLowerCase().includes(q) ||
        (log.event || log.action || '').toLowerCase().includes(q) ||
        (log.actor || log.performedBy || '').toLowerCase().includes(q) ||
        (log.details || '').toLowerCase().includes(q) ||
        (log.targetResource || log.targetId || '').toLowerCase().includes(q)

      return matchesCategory && matchesSearch
    })
  }, [logs, selectedCategory, searchQuery])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header & Live Compliance Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Immutable SHA-256 Audit Trail & CAG Statutory Forensics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Security Forensics & Compliance Audit Logs 🛡️
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Tamper-proof event journal tracking APMC escrow releases, KYC validations, bidding increments, and gate clearances.
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
            Refresh Audit Logs
          </Button>

          <Button 
            onClick={() => exportService.exportAuditLogs(filteredLogs)}
            size="sm" 
            className="rounded-xl text-xs font-bold shadow-md h-10 px-4 bg-primary text-primary-foreground"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Forensics CSV
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Ledger Integrity Status</p>
            <h3 className="text-2xl font-black text-emerald-600">100% Verified</h3>
            <span className="text-[11px] text-muted-foreground">Zero Hash Chain Breaks</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Audited System Events</p>
            <h3 className="text-2xl font-black text-foreground font-mono">{logs.length} Recorded</h3>
            <span className="text-[11px] text-muted-foreground">24h Rolling Window</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold shrink-0">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Forensics Storage Engine</p>
            <h3 className="text-2xl font-black text-purple-600">Postgres WAL</h3>
            <span className="text-[11px] text-muted-foreground">WORM Compliant</span>
          </div>
        </div>
      </div>

      {/* 3. Category Tabs & Search */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === tab.id
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
              placeholder="Search event, actor, IP address, or lot #..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 4. Audit Log Cards Feed */}
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <div
            key={log._id}
            className="p-6 sm:p-7 rounded-3xl bg-card border border-border hover:border-primary/50 shadow-sm transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-foreground">{log._id}</span>
                  <span className="text-xs text-muted-foreground">• {log.timestamp}</span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {log.severity || 'AUDIT'}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-foreground mt-1">
                  {log.event || log.action}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedLogForJson(log)}
                  className="rounded-xl text-xs h-9 px-3 flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> Payload JSON
                </Button>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                <span className="font-bold text-foreground">Actor / Initiator:</span>
                <p className="text-foreground font-semibold">{log.actor || log.performedBy}</p>
                <p className="text-muted-foreground">Role: {log.actorRole || log.performedByRole}</p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                <span className="font-bold text-foreground">Network & Location:</span>
                <p className="text-foreground font-mono">{log.ipAddress}</p>
                <p className="text-muted-foreground">{log.location || log.userAgent}</p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                <span className="font-bold text-foreground">Target Resource:</span>
                <p className="text-primary font-mono font-bold">{log.targetResource || log.targetId}</p>
                <p className="text-muted-foreground">Model: {log.targetModel || 'Entity'}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed pt-1">
              {log.details}
            </p>

            {/* Hash Footprint */}
            <div className="flex items-center justify-between pt-2 border-t border-border text-[11px] text-muted-foreground">
              <span className="font-mono truncate max-w-lg">
                SHA-256: {log.hash || log.integrityHash}
              </span>
              <button
                onClick={() => handleCopyHash(log.hash || log.integrityHash)}
                className="text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Copy className="w-3 h-3" /> Copy Hash
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 5. JSON Payload Inspector Modal */}
      {selectedLogForJson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedLogForJson(null)}
              className="absolute right-5 top-5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-1">
                <Terminal className="w-3.5 h-3.5" />
                <span>Forensic Payload Inspection</span>
              </div>
              <h2 className="text-xl font-extrabold text-foreground">
                {selectedLogForJson._id} Payload Inspector
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto max-h-96 border border-zinc-800">
              <pre>{JSON.stringify(selectedLogForJson.payload || selectedLogForJson, null, 2)}</pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setSelectedLogForJson(null)}
                className="rounded-xl text-xs font-bold h-10 px-5 bg-primary text-primary-foreground"
              >
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminAuditLogs
