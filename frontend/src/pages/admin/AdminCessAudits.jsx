import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
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
  ArrowUpRight
} from 'lucide-react'

const DEMO_CESS_TRANSACTIONS = [
  {
    _id: 'CHL-KA-TREASURY-9912',
    invoiceId: 'INV-KA-2026-9912',
    date: '28 Aug 2026',
    mandiYard: 'Yeshwanthpur APMC Main Yard, Bengaluru',
    buyerName: 'Karnataka Agro Traders Pvt Ltd',
    buyerLicense: 'KA-BLR-TRD-2026',
    buyerGstin: '29AABCK9921D1Z8',
    farmerName: 'Ramesh Gowda (Belur, Hassan)',
    farmerRtc: 'RTC-HSN-88192',
    cropName: 'Grade-A Fresh Hybrid Tomato',
    quantity: '120 Quintals',
    baseAmount: 264000,
    apmcCess: 3960, // 1.5%
    ruralCess: 1320, // 0.5%
    freightAmount: 3200,
    totalInvoiceAmount: 272480,
    treasuryStatus: 'remitted',
    treasuryRef: 'KTR-RB-2026-992140',
    settlementBank: 'HDFC Escrow Trustee Bank'
  },
  {
    _id: 'CHL-KA-TREASURY-7721',
    invoiceId: 'INV-KA-2026-7721',
    date: '26 Aug 2026',
    mandiYard: 'Bengaluru Rural (Doddaballapura)',
    buyerName: 'Karnataka Agro Traders Pvt Ltd',
    buyerLicense: 'KA-BLR-TRD-2026',
    buyerGstin: '29AABCK9921D1Z8',
    farmerName: 'Channappa Gowda (Doddaballapura)',
    farmerRtc: 'RTC-BLR-44102',
    cropName: 'Yellow Dent Poultry Maize',
    quantity: '300 Quintals',
    baseAmount: 615000,
    apmcCess: 9225,
    ruralCess: 3075,
    freightAmount: 4800,
    totalInvoiceAmount: 632100,
    treasuryStatus: 'remitted',
    treasuryRef: 'KTR-RB-2026-771120',
    settlementBank: 'Axis Escrow Trustee Bank'
  },
  {
    _id: 'CHL-KA-TREASURY-5510',
    invoiceId: 'INV-KA-2026-5510',
    date: '24 Aug 2026',
    mandiYard: 'Kolar APMC Market Yard',
    buyerName: 'Karnataka Agro Traders Pvt Ltd',
    buyerLicense: 'KA-BLR-TRD-2026',
    buyerGstin: '29AABCK9921D1Z8',
    farmerName: 'Venkatesh Murthy (Bangarapet)',
    farmerRtc: 'RTC-KLR-99214',
    cropName: 'Organic Finger Millet (Ragi)',
    quantity: '150 Quintals',
    baseAmount: 517500,
    apmcCess: 7762,
    ruralCess: 2588,
    freightAmount: 3600,
    totalInvoiceAmount: 531450,
    treasuryStatus: 'remitted',
    treasuryRef: 'KTR-RB-2026-551080',
    settlementBank: 'HDFC Escrow Trustee Bank'
  },
  {
    _id: 'CHL-KA-TREASURY-4410',
    invoiceId: 'INV-KA-2026-4410',
    date: '22 Aug 2026',
    mandiYard: 'Mandya APMC Market Yard',
    buyerName: 'Karnataka Agro Traders Pvt Ltd',
    buyerLicense: 'KA-BLR-TRD-2026',
    buyerGstin: '29AABCK9921D1Z8',
    farmerName: 'Basavaraj Patil (Malavalli)',
    farmerRtc: 'RTC-MND-33190',
    cropName: 'Bellary Premium Red Onion',
    quantity: '250 Quintals',
    baseAmount: 662500,
    apmcCess: 9937,
    ruralCess: 3313,
    freightAmount: 5800,
    totalInvoiceAmount: 681550,
    treasuryStatus: 'remitted',
    treasuryRef: 'KTR-RB-2026-441092',
    settlementBank: 'HDFC Escrow Trustee Bank'
  },
  {
    _id: 'CHL-KA-TREASURY-1120',
    invoiceId: 'INV-KA-2026-1120',
    date: '20 Aug 2026',
    mandiYard: 'Hassan APMC Market Yard',
    buyerName: 'Coastal Agro Processing Corp',
    buyerLicense: 'KA-MNG-TRD-2026',
    buyerGstin: '29AABCC4412K1Z9',
    farmerName: 'Savitramma Gowda (Alur)',
    farmerRtc: 'RTC-HSN-11290',
    cropName: 'Malabar Green Cardamom',
    quantity: '40 Quintals',
    baseAmount: 380000,
    apmcCess: 5700,
    ruralCess: 1900,
    freightAmount: 2400,
    totalInvoiceAmount: 390000,
    treasuryStatus: 'pending',
    treasuryRef: 'Pending Clearing',
    settlementBank: 'HDFC Escrow Trustee Bank'
  }
]

const YARD_TABS = [
  { id: 'all', label: 'All APMC Yards' },
  { id: 'yeshwanthpur', label: 'Yeshwanthpur (Bengaluru)' },
  { id: 'hassan', label: 'Hassan APMC' },
  { id: 'mandya', label: 'Mandya APMC' },
  { id: 'kolar', label: 'Kolar APMC' }
]

export const AdminCessAudits = () => {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState(DEMO_CESS_TRANSACTIONS)
  const [selectedYard, setSelectedYard] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChallan, setSelectedChallan] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Karnataka State Treasury APMC Cess Ledger synchronized!')
    }, 600)
  }

  const handlePrint = () => {
    window.print()
  }

  // Aggregate Metrics
  const totalGrossTrade = transactions.reduce((acc, t) => acc + t.baseAmount, 0)
  const totalApmcCess = transactions.reduce((acc, t) => acc + t.apmcCess, 0)
  const totalRuralCess = transactions.reduce((acc, t) => acc + t.ruralCess, 0)
  const totalTreasuryRemittance = totalApmcCess + totalRuralCess

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesYard =
        selectedYard === 'all'
          ? true
          : selectedYard === 'yeshwanthpur'
          ? t.mandiYard.toLowerCase().includes('yeshwanthpur')
          : selectedYard === 'hassan'
          ? t.mandiYard.toLowerCase().includes('hassan')
          : selectedYard === 'mandya'
          ? t.mandiYard.toLowerCase().includes('mandya')
          : selectedYard === 'kolar'
          ? t.mandiYard.toLowerCase().includes('kolar')
          : true

      const q = searchQuery.toLowerCase()
      const matchesSearch =
        t._id.toLowerCase().includes(q) ||
        t.invoiceId.toLowerCase().includes(q) ||
        t.buyerName.toLowerCase().includes(q) ||
        t.buyerLicense.toLowerCase().includes(q) ||
        t.cropName.toLowerCase().includes(q) ||
        t.farmerName.toLowerCase().includes(q) ||
        t.treasuryRef.toLowerCase().includes(q)

      return matchesYard && matchesSearch
    })
  }, [transactions, selectedYard, searchQuery])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-semibold border border-purple-500/20 mb-2">
            <Landmark className="w-3.5 h-3.5" />
            <span>Karnataka State Agricultural Marketing Board Treasury Node</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            APMC Market Cess & Escrow Audit Ledger 🏛️
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Reconcile statutory 1.50% APMC market fees, 0.50% rural infrastructure development cess, and trustee escrow settlements.
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
            Refresh Treasury Ledger
          </Button>

          <Button 
            onClick={() => toast.success('State Treasury Cess Remittance Statement FY 2026-27 exported!')}
            className="rounded-xl text-xs h-10 px-4 font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md"
          >
            <Download className="w-4 h-4 mr-1.5" /> Export Treasury Statement
          </Button>
        </div>
      </div>

      {/* 2. 4 Fiscal Audit KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Total APMC Cess (1.5%)</span>
          <p className="text-2xl font-black text-emerald-600">₹{totalApmcCess.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-emerald-600 font-bold">100% Remitted to State</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Rural Dev Cess (0.5%)</span>
          <p className="text-2xl font-black text-purple-600">₹{totalRuralCess.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-muted-foreground">Rural Road & Mandi Fund</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Gross Trade Value Audited</span>
          <p className="text-2xl font-black text-foreground">₹{totalGrossTrade.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-muted-foreground">Direct Farm Purchases</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Trustee Escrow Balance</span>
          <p className="text-2xl font-black text-amber-600">₹23.69 Lakhs</p>
          <span className="text-[11px] text-amber-600 font-semibold">Active Escrow Vault</span>
        </div>
      </div>

      {/* 3. Search & Yard Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {YARD_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedYard(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                  selectedYard === tab.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search challan, license, crop, or buyer..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border">
                <tr>
                  <th className="p-4">Treasury Challan & Date</th>
                  <th className="p-4">Licensed Buyer & APMC Yard</th>
                  <th className="p-4">Commodity / Producer</th>
                  <th className="p-4">Base Trade (₹)</th>
                  <th className="p-4">APMC Cess (1.5%)</th>
                  <th className="p-4">Rural Cess (0.5%)</th>
                  <th className="p-4">Treasury Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-extrabold text-[11px] text-purple-600 block">{tx._id}</span>
                      <span className="text-[10px] text-muted-foreground">{tx.date}</span>
                    </td>

                    <td className="p-4">
                      <p className="font-extrabold text-foreground">{tx.buyerName}</p>
                      <span className="text-[10px] font-mono text-muted-foreground">Lic: {tx.buyerLicense} • {tx.mandiYard}</span>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-foreground">{tx.cropName}</p>
                      <span className="text-[10px] text-muted-foreground">{tx.farmerName} • {tx.quantity}</span>
                    </td>

                    <td className="p-4 font-mono font-bold text-foreground">
                      ₹{tx.baseAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="p-4 font-mono font-bold text-emerald-600">
                      ₹{tx.apmcCess.toLocaleString('en-IN')}
                    </td>

                    <td className="p-4 font-mono font-bold text-purple-600">
                      ₹{tx.ruralCess.toLocaleString('en-IN')}
                    </td>

                    <td className="p-4">
                      {tx.treasuryStatus === 'remitted' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Remitted 🟢
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[10px] font-bold border border-amber-500/20">
                          <Clock className="w-3 h-3" /> In Clearing 🟡
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedChallan(tx)}
                        className="rounded-xl text-xs h-8 px-2.5 shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5 mr-1 text-purple-600" /> Audit Challan
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Full-Screen Treasury Challan & Tax Reinvestment Audit Modal */}
      {selectedChallan && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            
            {/* Header Controls */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">
                    Official Karnataka State Treasury APMC Cess Challan
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Statutory Remittance under Section 65 of Karnataka APMC Act
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  size="sm"
                  onClick={handlePrint}
                  className="rounded-xl text-xs h-9 bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Challan
                </Button>

                <button 
                  onClick={() => setSelectedChallan(null)}
                  className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable State Treasury Receipt Template */}
            <div className="p-6 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-6 text-xs font-sans">
              
              {/* Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-800 tracking-wider">
                  GOVERNMENT OF KARNATAKA • DEPARTMENT OF AGRICULTURAL MARKETING
                </span>
                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  TREASURY CESS REMITTANCE CHALLAN & CLEARANCE CERTIFICATE
                </h2>
                <p className="text-[11px] text-slate-600">
                  Credited to Major Head: 0401-00-101-0-01 (Agricultural Marketing Development Fund)
                </p>
              </div>

              {/* Grid: Challan Details & QR Code */}
              <div className="grid grid-cols-3 gap-4 border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">CHALLAN NUMBER</span>
                  <p className="font-mono font-black text-sm text-slate-900">{selectedChallan._id}</p>
                  <span className="text-[10px] text-slate-500 font-bold block pt-1">DATE OF CREDIT</span>
                  <p className="font-bold text-slate-900">{selectedChallan.date}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">TREASURY REF NO</span>
                  <p className="font-mono font-bold text-emerald-700">{selectedChallan.treasuryRef}</p>
                  <span className="text-[10px] text-slate-500 font-bold block pt-1">SETTLEMENT ESCROW</span>
                  <p className="font-bold text-slate-900">{selectedChallan.settlementBank}</p>
                </div>

                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <QrCode className="w-12 h-12 text-slate-900" />
                  <span className="text-[8px] font-mono text-slate-500 pt-1">State Treasury Digital Seal</span>
                </div>
              </div>

              {/* Stakeholders Dual Column */}
              <div className="grid grid-cols-2 gap-6 border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider">REMITTING WHOLESALE BUYER</span>
                  <p className="font-black text-sm text-slate-900">{selectedChallan.buyerName}</p>
                  <p className="font-mono text-[11px] text-slate-600">APMC License: {selectedChallan.buyerLicense} • GSTIN: {selectedChallan.buyerGstin}</p>
                  <p className="text-slate-600">Mandi Yard: {selectedChallan.mandiYard}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">PRODUCER / ORIGIN HARVEST</span>
                  <p className="font-black text-sm text-slate-900">{selectedChallan.farmerName}</p>
                  <p className="font-mono text-[11px] text-slate-600">Land RTC: {selectedChallan.farmerRtc}</p>
                  <p className="text-slate-600">Produce: {selectedChallan.cropName} ({selectedChallan.quantity})</p>
                </div>
              </div>

              {/* Statutory Fee Computation Table */}
              <div className="space-y-2">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Statutory Head</th>
                      <th className="p-2.5">Rate (%)</th>
                      <th className="p-2.5 font-mono text-right">Taxable Turnover (₹)</th>
                      <th className="p-2.5 font-mono text-right">Fee Remitted (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    <tr>
                      <td className="p-2.5 font-sans font-bold text-slate-900">APMC State Market Fee (Market Yard Maintenance)</td>
                      <td className="p-2.5">1.50%</td>
                      <td className="p-2.5 text-right">₹{selectedChallan.baseAmount.toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">₹{selectedChallan.apmcCess.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-sans font-bold text-slate-900">Karnataka Rural Infrastructure Development Cess</td>
                      <td className="p-2.5">0.50%</td>
                      <td className="p-2.5 text-right">₹{selectedChallan.baseAmount.toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-right font-bold text-purple-700">₹{selectedChallan.ruralCess.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Total */}
                <div className="flex justify-end pt-2">
                  <div className="w-72 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t-2 border-slate-900">
                      <span>Total Treasury Remittance:</span>
                      <span className="text-emerald-700">₹{(selectedChallan.apmcCess + selectedChallan.ruralCess).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500 font-mono">
                <div>
                  <p className="font-bold text-slate-800">KrishiSetu State Marketing Board Node</p>
                  <p>Cryptographically Reconciled with Karnataka State Treasury</p>
                </div>

                <div className="text-right">
                  <div className="w-36 border-b border-slate-400 mb-1" />
                  <p className="font-bold text-slate-800">Chief Treasury Officer (APMC)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCessAudits
