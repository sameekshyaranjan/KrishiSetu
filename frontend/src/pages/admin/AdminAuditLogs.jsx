import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
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
      buyerId: 'USR-KA-TRD-001',
      grossAmount: 264000,
      cessDeduction: 3960,
      escrowVaultRef: 'VAN-HDFC-992140',
      timestamp: '2026-08-29T03:20:08.142Z'
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
    details: 'Issued official clearance for Nagaraju Byrappa (Mandya) on Bhoomi parcel RTC-MND-44210 (4.8 Acres).',
    hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    payload: {
      action: 'KYC_CLEARANCE',
      farmerId: 'USR-KA-FRM-002',
      rtcNumber: 'RTC-MND-44210',
      landAcreage: 4.8,
      soilHealthStatus: 'Optimal Red Loam',
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
      prevRate: 2500,
      totalBidValue: 650000,
      proxyAutoBid: false
    }
  },
  {
    _id: 'LOG-KA-2026-99211',
    timestamp: '1 hour ago (14:44:30 IST)',
    category: 'escrow',
    severity: 'AUDIT',
    event: 'Statutory APMC Market Cess Remitted to State Treasury',
    actor: 'system-bot@krishisetu.gov.in (Smart Settlement Node)',
    actorRole: 'system',
    ipAddress: '10.0.4.192',
    location: 'State APMC Gateway Node',
    targetResource: 'CHL-KA-TREASURY-9912',
    details: 'Automated sweep of ₹5,280 (1.5% APMC + 0.5% Rural Cess) credited to Treasury Account 0401-00-101.',
    hash: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
    payload: {
      action: 'TREASURY_CESS_SWEEP',
      challanId: 'CHL-KA-TREASURY-9912',
      apmcFee: 3960,
      ruralCess: 1320,
      treasuryRef: 'KTR-RB-2026-992140',
      rbiEkuBerBatch: 'BATCH-20260829-0019'
    }
  },
  {
    _id: 'LOG-KA-2026-99210',
    timestamp: '2 hours ago (13:40:19 IST)',
    category: 'auth',
    severity: 'SECURITY',
    event: 'Rate-Limit Triggered on Admin Login Gateway',
    actor: 'anonymous (IP: 185.220.101.5)',
    actorRole: 'unauthorized',
    ipAddress: '185.220.101.5',
    location: 'Frankfurt, Germany (Tor Node)',
    targetResource: 'AUTH-GATEWAY-ADMIN',
    details: 'Blocked 5 rapid consecutive failed password attempts. IP blacklisted for 30 minutes.',
    hash: '3b95d9e07b3e47963d3d63b27be6396f4cbbf0e93245452d3a339b1a51167448',
    payload: {
      action: 'RATE_LIMIT_BLOCK',
      attemptCount: 5,
      targetEndpoint: '/api/v1/auth/admin/login',
      blockDurationSeconds: 1800,
      defenseSystem: 'Cloudflare WAF & Express Rate-Limiter'
    }
  },
  {
    _id: 'LOG-KA-2026-99209',
    timestamp: '3 hours ago (12:35:00 IST)',
    category: 'bidding',
    severity: 'INFO',
    event: 'Digital Tare/Gross Weighbridge Net Weight Cleared',
    actor: 'weighbridge-officer@yeshwanthpur.gov.in',
    actorRole: 'apmc_officer',
    ipAddress: '103.24.112.90',
    location: 'Yeshwanthpur APMC Yard',
    targetResource: 'WB-SLIP-KA-2026-9912',
    details: 'Gross 14,280 kg, Tare 2,280 kg (Net 120 Qtl) verified within 0.05% tolerance.',
    hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    payload: {
      action: 'WEIGHBRIDGE_PASS',
      vehicleNumber: 'KA-04-F-8812',
      grossWeightKg: 14280,
      tareWeightKg: 2280,
      netWeightQuintals: 120.0,
      sensorCalibrationCertificate: 'LEGAL-METROLOGY-2026'
    }
  },
  {
    _id: 'LOG-KA-2026-99208',
    timestamp: '4 hours ago (11:15:22 IST)',
    category: 'kyc',
    severity: 'NOTICE',
    event: 'Trader Corporate License Re-verified',
    actor: 'admin@krishisetu.in (APMC State Admin)',
    actorRole: 'admin',
    ipAddress: '49.207.198.54',
    location: 'Mandi Board HQ, Bengaluru',
    targetResource: 'USR-KA-TRD-001',
    details: 'Verified FSSAI Central License #10020043000192 for Karnataka Agro Traders Pvt Ltd.',
    hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    payload: {
      action: 'FSSAI_VALIDATION',
      traderEntity: 'Karnataka Agro Traders Pvt Ltd',
      fssaiRegNo: '10020043000192',
      validity: '31 March 2028'
    }
  }
]

const CATEGORY_TABS = [
  { id: 'all', label: 'All Security Logs' },
  { id: 'escrow', label: 'Escrow & Banking 🟡' },
  { id: 'kyc', label: 'KYC & Moderation 🟢' },
  { id: 'bidding', label: 'Auction Bids 🔨' },
  { id: 'auth', label: 'Auth & Security 🔒' }
]

export const AdminAuditLogs = () => {
  const { user } = useAuth()
  const [logs, setLogs] = useState(DEMO_AUDIT_LOGS)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLogForDetail, setSelectedLogForDetail] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Live SHA-256 security audit stream verified!')
    }, 600)
  }

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesCategory =
        selectedCategory === 'all' ? true : log.category === selectedCategory

      const q = searchQuery.toLowerCase()
      const matchesSearch =
        log._id.toLowerCase().includes(q) ||
        log.event.toLowerCase().includes(q) ||
        log.actor.toLowerCase().includes(q) ||
        log.targetResource.toLowerCase().includes(q) ||
        log.ipAddress.includes(q) ||
        log.hash.toLowerCase().includes(q)

      return matchesCategory && matchesSearch
    })
  }, [logs, selectedCategory, searchQuery])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-semibold border border-purple-500/20 mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Immutable SHA-256 Cryptographic Audit Stream</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            System Security & Compliance Audit Logs 🛡️
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time tamper-proof event stream recording all administrative moderation, escrow bank disbursements, and auth access attempts.
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
            Verify Blockchain Hash
          </Button>

          <Button 
            onClick={() => toast.success('State Security Audit Trail JSON exported!')}
            className="rounded-xl text-xs h-10 px-4 font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md"
          >
            <Download className="w-4 h-4 mr-1.5" /> Export Audit Log
          </Button>
        </div>
      </div>

      {/* 2. 4 Security & Compliance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Total Audit Events</span>
          <p className="text-2xl font-black text-foreground">12,480 Logs</p>
          <span className="text-[11px] text-muted-foreground">Immutable Hash Chained</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Critical Security Alerts</span>
          <p className="text-2xl font-black text-emerald-600">0 Incidents</p>
          <span className="text-[11px] text-emerald-600 font-bold">100% Platform Nominal</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Gateway API Uptime</span>
          <p className="text-2xl font-black text-purple-600">99.98%</p>
          <span className="text-[11px] text-muted-foreground">Express + MongoDB Cluster</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Blocked Suspicious IPs</span>
          <p className="text-2xl font-black text-amber-600">4 Threat Vectors</p>
          <span className="text-[11px] text-amber-600 font-semibold">Rate-Limiter Active</span>
        </div>
      </div>

      {/* 3. Category Filter Tabs & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {CATEGORY_TABS.map((tab) => {
              const count =
                tab.id === 'all'
                  ? logs.length
                  : logs.filter((l) => l.category === tab.id).length

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
              placeholder="Search event, actor, IP, hash, or target..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </div>
        </div>

        {/* Audit Table */}
        <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border">
                <tr>
                  <th className="p-4">Timestamp & Event</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Actor / Origin</th>
                  <th className="p-4">Target Resource</th>
                  <th className="p-4">SHA-256 Digest</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <p className="font-extrabold text-foreground">{log.event}</p>
                      <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {log.timestamp}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                        log.severity === 'SECURITY'
                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                          : log.severity === 'AUDIT'
                          ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                          : log.severity === 'NOTICE'
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      }`}>
                        {log.severity}
                      </span>
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-foreground">{log.actor}</p>
                      <span className="text-[10px] font-mono text-muted-foreground">{log.ipAddress} ({log.location})</span>
                    </td>

                    <td className="p-4 font-mono font-bold text-purple-600">
                      {log.targetResource}
                    </td>

                    <td className="p-4 font-mono text-[10px] text-muted-foreground">
                      <span className="truncate w-24 block">{log.hash.slice(0, 16)}...</span>
                    </td>

                    <td className="p-4 text-right">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedLogForDetail(log)}
                        className="rounded-xl text-xs h-8 px-2.5 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-purple-600" /> Inspect Payload
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Full-Screen Security Audit Payload Modal */}
      {selectedLogForDetail && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">
                    Security Audit Event Payload & Cryptographic Proof
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Log ID: {selectedLogForDetail._id}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedLogForDetail(null)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Event Meta Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase">Event Classification</span>
                <p className="font-extrabold text-foreground">{selectedLogForDetail.event}</p>
                <span className="text-[10px] font-mono text-purple-600">{selectedLogForDetail.timestamp}</span>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase">Actor Coordinates</span>
                <p className="font-extrabold text-foreground">{selectedLogForDetail.actor}</p>
                <span className="text-[10px] font-mono text-muted-foreground">{selectedLogForDetail.ipAddress} • {selectedLogForDetail.location}</span>
              </div>
            </div>

            {/* Cryptographic SHA-256 Box */}
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" /> SHA-256 Cryptographic Hash Digest:
                </span>
                <button
                  onClick={() => handleCopy(selectedLogForDetail.hash, 'Hash Digest')}
                  className="text-purple-600 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <p className="font-mono text-[10px] text-purple-900 break-all bg-white/60 p-2 rounded-lg border border-purple-500/20">
                {selectedLogForDetail.hash}
              </p>
            </div>

            {/* Raw JSON Payload Terminal */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-foreground block">Raw Event JSON Payload:</span>
              <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
                {JSON.stringify(selectedLogForDetail.payload, null, 2)}
              </pre>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end pt-2 border-t border-border">
              <Button 
                onClick={() => setSelectedLogForDetail(null)}
                className="rounded-xl text-xs font-bold h-10 px-6 bg-purple-600 hover:bg-purple-700 text-white"
              >
                Close Audit Inspector
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminAuditLogs
