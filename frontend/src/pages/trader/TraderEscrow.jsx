import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  Landmark, 
  DollarSign, 
  ShieldCheck, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  Unlock, 
  RefreshCw, 
  FileText, 
  Copy, 
  CheckCheck, 
  Clock, 
  Building2, 
  CreditCard, 
  Download, 
  Layers, 
  X,
  Sparkles,
  Info
} from 'lucide-react'

const INITIAL_TRANSACTIONS = [
  {
    _id: 'TXN-ESC-9941',
    date: '28 Aug 2026, 04:30 PM',
    type: 'deposit', // 'deposit' | 'lock' | 'disburse' | 'refund'
    amount: 500000,
    lotId: null,
    description: 'Corporate Escrow Capital Injection (HDFC RTGS)',
    utr: 'HDFCR52026082800441',
    status: 'Settled'
  },
  {
    _id: 'TXN-ESC-9940',
    date: '28 Aug 2026, 02:15 PM',
    type: 'lock',
    amount: 264000,
    lotId: 'LOT-KA-HSN-101',
    description: 'Auction Lock for Tomato Lot (120 Qtl @ ₹2,200)',
    utr: 'ESC-LCK-881920',
    status: 'Held in Escrow'
  },
  {
    _id: 'TXN-ESC-9939',
    date: '27 Aug 2026, 06:45 PM',
    type: 'disburse',
    amount: 185180,
    lotId: 'ORD-KA-9912',
    description: 'Direct Bank Payout to Producer Ramesh Gowda upon Weighment',
    utr: 'HDFCR52026082700918',
    status: 'Disbursed to Bank'
  },
  {
    _id: 'TXN-ESC-9938',
    date: '27 Aug 2026, 11:20 AM',
    type: 'refund',
    amount: 320000,
    lotId: 'LOT-KA-BLG-092',
    description: 'Outbid Refund: Funds Released Back to Liquid Escrow',
    utr: 'ESC-RFD-771829',
    status: 'Returned to Balance'
  },
  {
    _id: 'TXN-ESC-9937',
    date: '26 Aug 2026, 09:10 AM',
    type: 'deposit',
    amount: 1000000,
    lotId: null,
    description: 'Institutional Monthly Procurement Allocation',
    utr: 'AXISR52026082600112',
    status: 'Settled'
  }
]

export const TraderEscrow = () => {
  const { user } = useAuth()
  const [availableBalance, setAvailableBalance] = useState(1450000)
  const [lockedBalance, setLockedBalance] = useState(534000)
  const [inTransitBalance, setInTransitBalance] = useState(385000)
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Top-Up Modal State
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [depositAmount, setDepositAmount] = useState('500000')
  const [paymentMethod, setPaymentMethod] = useState('netbanking') // 'netbanking' | 'neft'

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Escrow trust account synchronized with banking ledger!')
    }, 600)
  }

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const handleConfirmTopUp = (e) => {
    e.preventDefault()
    const parsed = Number(depositAmount)
    if (!parsed || parsed < 10000) {
      toast.error('Minimum corporate escrow deposit is ₹10,000')
      return
    }

    const newTxn = {
      _id: `TXN-ESC-${Math.floor(1000 + Math.random() * 9000)}`,
      date: 'Just now',
      type: 'deposit',
      amount: parsed,
      lotId: null,
      description: `Corporate Escrow Top-Up (${paymentMethod.toUpperCase()})`,
      utr: `HDFCR520260829${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Settled'
    }

    setAvailableBalance((prev) => prev + parsed)
    setTransactions([newTxn, ...transactions])
    toast.success(`₹${parsed.toLocaleString('en-IN')} credited to Escrow Wallet instantly! 🎉`)
    setIsTopUpOpen(false)
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (selectedFilter === 'all') return true
      return t.type === selectedFilter
    })
  }, [transactions, selectedFilter])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header & Trust Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>RBI-Regulated Escrow Trust Account (Axis Bank & HDFC Escrow)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Trader Escrow Wallet & Settlement Vault 🏛️
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your liquid bidding capital, inspect active locked auctions, and download official banking UTR statements.
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
            Refresh Statement
          </Button>

          <Button 
            onClick={() => setIsTopUpOpen(true)}
            className="rounded-xl text-xs h-10 px-5 font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" /> Add Escrow Capital
          </Button>
        </div>
      </div>

      {/* 2. 4 Capital Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Balance 1: Available Liquid Escrow */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-card to-card border border-amber-500/30 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">Available Liquid Escrow</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">₹{availableBalance.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCheck className="w-3.5 h-3.5" /> Ready for instant bidding
          </span>
        </div>

        {/* Balance 2: Locked in Winning Bids */}
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Locked in Active Bids</span>
            <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-amber-600">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600">₹{lockedBalance.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-muted-foreground">Reserved for 2 winning lots</span>
        </div>

        {/* Balance 3: In-Transit Escrow */}
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">In-Transit Escrow</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-sky-600">₹{inTransitBalance.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-muted-foreground">Disburses upon APMC weighment</span>
        </div>

        {/* Balance 4: Lifetime Disbursed */}
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Disbursed to Farmers</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600">₹38,20,000</p>
          <span className="text-[11px] text-muted-foreground">100% On-Time Settlement</span>
        </div>
      </div>

      {/* 3. Dedicated Corporate Virtual Escrow Coordinates */}
      <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-600" />
              Dedicated Corporate RTGS / NEFT Virtual Escrow Account
            </h3>
            <p className="text-xs text-muted-foreground">
              Transfer funds directly from your corporate current account to auto-credit your liquid bidding balance.
            </p>
          </div>

          <div className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-bold flex items-center gap-1.5 self-start">
            <CheckCheck className="w-3.5 h-3.5" /> Auto-Credit Within 30 Seconds
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
            <span className="text-[11px] text-muted-foreground">Beneficiary Name</span>
            <p className="font-extrabold text-foreground truncate">KrishiSetu Escrow - {user?.name || 'Agro Corp'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-muted-foreground">Virtual Account Number</span>
              <button 
                onClick={() => handleCopy('KRISHITRD9921004', 'Virtual Account Number')}
                className="text-primary hover:underline flex items-center gap-0.5"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <p className="font-mono font-extrabold text-sm text-foreground">KRISHITRD9921004</p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-muted-foreground">Bank IFSC Code</span>
              <button 
                onClick={() => handleCopy('HDFC0000240', 'IFSC Code')}
                className="text-primary hover:underline flex items-center gap-0.5"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <p className="font-mono font-extrabold text-sm text-primary">HDFC0000240</p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-muted-foreground">Corporate UPI ID</span>
              <button 
                onClick={() => handleCopy('krishisetu.trd992@hdfcbank', 'UPI ID')}
                className="text-primary hover:underline flex items-center gap-0.5"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <p className="font-mono font-extrabold text-xs text-foreground truncate">krishisetu.trd992@hdfcbank</p>
          </div>
        </div>
      </div>

      {/* 4. Real-Time Escrow Ledger & Statement Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Escrow Audit Ledger & UTR Statements
            </h2>
            <p className="text-xs text-muted-foreground">
              Cryptographically verified audit trail of all capital locks, settlements, and bank refunds.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Statements' },
              { id: 'deposit', label: 'Deposits' },
              { id: 'lock', label: 'Auction Locks' },
              { id: 'disburse', label: 'Farmer Payouts' },
              { id: 'refund', label: 'Refunds' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedFilter === f.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border">
                <tr>
                  <th className="p-4">Transaction ID & Date</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Description & Lot Reference</th>
                  <th className="p-4">Banking UTR Ref</th>
                  <th className="p-4 text-right">Amount (₹)</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.map((txn) => (
                  <tr key={txn._id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-extrabold text-[11px] text-primary block">{txn._id}</span>
                      <span className="text-[10px] text-muted-foreground">{txn.date}</span>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                        txn.type === 'deposit'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : txn.type === 'lock'
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          : txn.type === 'disburse'
                          ? 'bg-sky-500/10 text-sky-600 border border-sky-500/20'
                          : 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                      }`}>
                        {txn.type === 'deposit' && <ArrowDownLeft className="w-3 h-3" />}
                        {txn.type === 'lock' && <Lock className="w-3 h-3" />}
                        {txn.type === 'disburse' && <ArrowUpRight className="w-3 h-3" />}
                        {txn.type === 'refund' && <Unlock className="w-3 h-3" />}
                        <span>{txn.type}</span>
                      </span>
                    </td>

                    <td className="p-4 font-medium text-foreground max-w-xs">
                      <p className="truncate">{txn.description}</p>
                      {txn.lotId && (
                        <span className="font-mono text-[10px] text-amber-600 font-bold block">{txn.lotId}</span>
                      )}
                    </td>

                    <td className="p-4 font-mono text-[11px] text-muted-foreground">
                      {txn.utr}
                    </td>

                    <td className={`p-4 text-right font-black text-sm ${
                      txn.type === 'deposit' || txn.type === 'refund'
                        ? 'text-emerald-600'
                        : 'text-foreground'
                    }`}>
                      {txn.type === 'deposit' || txn.type === 'refund' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                    </td>

                    <td className="p-4 text-right">
                      <span className="font-semibold text-foreground text-xs">{txn.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Modal: Add Funds to Escrow */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-600 uppercase">
                  Institutional Capital Injection
                </span>
                <h3 className="text-lg font-extrabold text-foreground">
                  Top-Up Escrow Wallet
                </h3>
                <p className="text-xs text-muted-foreground">
                  100% protected liquid capital for instant APMC bidding.
                </p>
              </div>

              <button 
                onClick={() => setIsTopUpOpen(false)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmTopUp} className="space-y-4">
              
              {/* Payment Method Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-muted/60 p-1 rounded-2xl border border-border text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`py-2 rounded-xl transition-all ${
                    paymentMethod === 'netbanking' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  NetBanking / UPI
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('neft')}
                  className={`py-2 rounded-xl transition-all ${
                    paymentMethod === 'neft' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  RTGS / NEFT Ref
                </button>
              </div>

              {/* Deposit Amount Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Deposit Amount (₹ INR)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-black text-muted-foreground text-base">₹</span>
                  <input
                    type="number"
                    min="10000"
                    step="5000"
                    required
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full h-12 pl-8 pr-4 rounded-2xl bg-background border border-border text-base font-black focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {['100000', '500000', '1000000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className="py-2 rounded-xl bg-muted/60 hover:bg-amber-500/10 hover:text-amber-600 border border-border text-xs font-bold text-muted-foreground transition-all"
                  >
                    +₹{(Number(amt) / 100000)} Lakh
                  </button>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Axis & HDFC Escrow Trustee Backed
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Funds remain completely in your ownership until you authorize deal fulfillment.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsTopUpOpen(false)}
                  className="rounded-xl text-xs h-11"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="rounded-xl text-xs font-bold h-11 bg-amber-600 hover:bg-amber-700 text-white shadow-md"
                >
                  Authorize Deposit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TraderEscrow
