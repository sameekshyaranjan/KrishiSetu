import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import orderService from '@/services/orderService'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  Landmark, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Scale, 
  RefreshCw, 
  Search, 
  Building2, 
  Package, 
  FileText, 
  ArrowUpRight, 
  ChevronRight, 
  DollarSign, 
  Percent, 
  Calendar, 
  Truck, 
  X,
  CreditCard
} from 'lucide-react'

export const FarmerTransactions = () => {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState('all') // 'all' | 'escrow_locked' | 'disbursed' | 'disputed' | 'refunded'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTx, setSelectedTx] = useState(null)

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const data = await orderService.getFarmerOrders()
      setTransactions(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('[FarmerTransactions] Failed to load transactions:', err)
      toast.error('Could not load financial transactions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  // KPI Calculations based on real database records
  const totalSettledRevenue = useMemo(() => {
    return transactions
      .filter(tx => tx.rawPaymentStatus === 'payout_released' || tx.rawPaymentStatus === 'completed' || tx.paymentStatus === 'disbursed')
      .reduce((sum, tx) => sum + (tx.farmerPayoutAmount || tx.netFarmerPayout || tx.escrowAmount || 0), 0)
  }, [transactions])

  const totalEscrowLocked = useMemo(() => {
    return transactions
      .filter(tx => tx.rawPaymentStatus === 'held_in_escrow' || tx.paymentStatus === 'escrow_locked')
      .reduce((sum, tx) => sum + (tx.escrowAmount || 0), 0)
  }, [transactions])

  const totalCessContributed = useMemo(() => {
    return transactions
      .reduce((sum, tx) => sum + (tx.mandiCess || Math.round((tx.escrowAmount || 0) * 0.015)), 0)
  }, [transactions])

  const disputedTransactionsCount = useMemo(() => {
    return transactions.filter(tx => tx.isDisputed || tx.logisticsStatus === 'disputed').length
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = 
        !q ||
        (tx.orderCode || '').toLowerCase().includes(q) ||
        (tx.crop?.name || '').toLowerCase().includes(q) ||
        (tx.trader?.name || '').toLowerCase().includes(q) ||
        (tx.trader?.companyName || '').toLowerCase().includes(q) ||
        (tx.utrNumber || '').toLowerCase().includes(q)

      if (!matchesSearch) return false

      if (selectedFilter === 'escrow_locked') {
        return tx.rawPaymentStatus === 'held_in_escrow' || tx.paymentStatus === 'escrow_locked'
      }
      if (selectedFilter === 'disbursed') {
        return tx.rawPaymentStatus === 'payout_released' || tx.rawPaymentStatus === 'completed' || tx.paymentStatus === 'disbursed'
      }
      if (selectedFilter === 'disputed') {
        return tx.isDisputed || tx.logisticsStatus === 'disputed'
      }
      if (selectedFilter === 'refunded') {
        return tx.rawPaymentStatus === 'refunded' || tx.paymentStatus === 'refunded'
      }

      return true
    })
  }, [transactions, searchQuery, selectedFilter])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20 mb-2">
            <Landmark className="w-3.5 h-3.5" />
            <span>APMC Mandi Escrow & Direct Benefit Transfer (DBT) Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Financial Transactions & Escrow Disbursals
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Audit locked buyer escrow balances, track dispute settlement rulings, and verify direct bank disbursements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadTransactions} 
            disabled={loading}
            className="rounded-xl text-xs h-10 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button asChild className="rounded-xl text-xs font-bold shadow-md h-10 px-5 bg-primary text-primary-foreground">
            <Link to="/farmer/orders">
              <Truck className="w-3.5 h-3.5 mr-1.5" /> Fulfill Orders
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Settled Payouts */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Total Settled Revenue</p>
            <h3 className="text-2xl font-black text-foreground font-mono">
              ₹{totalSettledRevenue.toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] text-emerald-600 font-medium">DBT Credited to Bank</span>
          </div>
        </div>

        {/* Metric 2: Currently Locked in Escrow */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Escrow Currently Held</p>
            <h3 className="text-2xl font-black text-amber-600 font-mono">
              ₹{totalEscrowLocked.toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] text-muted-foreground">Safe in Mandi Vault</span>
          </div>
        </div>

        {/* Metric 3: APMC Mandi Cess */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold shrink-0">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">APMC Cess Contributed</p>
            <h3 className="text-2xl font-black text-foreground font-mono">
              ₹{totalCessContributed.toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] text-sky-600 font-medium">1.5% Mandi Statutory</span>
          </div>
        </div>

        {/* Metric 4: Disputed Lots */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Disputes Under Review</p>
            <h3 className="text-2xl font-black text-foreground">
              {disputedTransactionsCount} Cases
            </h3>
            <span className="text-[11px] text-purple-600 font-medium">Arbitration Tribunal</span>
          </div>
        </div>
      </div>

      {/* 3. Search and Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by order ID, crop, or buyer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'escrow_locked', label: 'Escrow Held 🔒' },
            { id: 'disbursed', label: 'Disbursed / Settled 💸' },
            { id: 'disputed', label: 'Disputed ⚖️' },
            { id: 'refunded', label: 'Refunded 🛑' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedFilter === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground mx-auto flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-base font-bold text-foreground">No Financial Transactions Found</p>
            <p className="text-xs text-muted-foreground">
              No transactions match your search query or filter criteria.
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isSettled = tx.rawPaymentStatus === 'payout_released' || tx.rawPaymentStatus === 'completed' || tx.paymentStatus === 'disbursed'
            const isRefunded = tx.rawPaymentStatus === 'refunded' || tx.paymentStatus === 'refunded'
            const isDisputed = tx.isDisputed || tx.logisticsStatus === 'disputed'
            const isResolved = tx.isResolved || tx.logisticsStatus === 'resolved' || Boolean(tx.dispute && tx.dispute.status?.startsWith('resolved_'))

            return (
              <div
                key={tx._id}
                className="p-6 rounded-3xl bg-card border border-border hover:border-primary/40 shadow-sm transition-all space-y-4"
              >
                {/* Top Row: Order Code, Date, Trader & Status Pill */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-foreground">{tx.orderCode}</span>
                        <span className="text-xs text-muted-foreground">• {tx.date}</span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-primary" /> Buyer: <span className="font-semibold text-foreground">{tx.trader.name}</span> ({tx.trader.district})
                      </p>
                    </div>
                  </div>

                  {/* Financial Status Pill */}
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isSettled 
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : isRefunded
                        ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        : isDisputed
                        ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        : 'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                      {isSettled 
                        ? 'DBT Disbursed & Settled 💸'
                        : isRefunded
                        ? 'Refunded to Buyer 🛑'
                        : isDisputed
                        ? 'Disputed • Escrow Frozen ⚖️'
                        : 'Held in Escrow 🔒'}
                    </span>
                  </div>
                </div>

                {/* Dispute Ruling Banner (if applicable) */}
                {isResolved && (
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-purple-600" /> APMC Arbitration Ruling Recorded
                      </span>
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 uppercase">
                        {tx.disputeResolution || tx.dispute?.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground font-medium">
                      {tx.disputeResolution === 'split_85_15'
                        ? `85/15 Mutual Split Approved. Farmer Payout: ₹${(tx.farmerPayoutAmount || Math.round(tx.escrowAmount * 0.85)).toLocaleString('en-IN')} (85%), Buyer Refund: ₹${(tx.traderRefundAmount || Math.round(tx.escrowAmount * 0.15)).toLocaleString('en-IN')} (15%).`
                        : tx.disputeResolution === 'payout_farmer'
                        ? `100% Payout to Farmer Approved: ₹${tx.escrowAmount?.toLocaleString('en-IN')}.`
                        : tx.disputeResolution === 'refund_trader'
                        ? '100% Refund to Buyer Approved. Escrow returned to buyer wallet and crop lot delisted.'
                        : 'Arbitration decision finalized by APMC tribunal.'}
                    </p>
                    <p className="text-[11px] font-semibold text-purple-600">
                      {tx.disputeResolutionStatus === 'awaiting_delivery'
                        ? '⏳ Money remains securely held in escrow until buyer receives and accepts lot delivery.'
                        : '✅ Financial resolution executed.'}
                    </p>
                  </div>
                )}

                {/* Middle Grid: Crop Details, Breakdown & Delivery Progress */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Crop Snapshot */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border/80">
                    <img
                      src={tx.crop.image}
                      alt={tx.crop.name}
                      className="w-14 h-14 rounded-xl object-cover border border-border shrink-0 shadow-xs"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop'
                      }}
                    />
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-foreground">{tx.crop.name}</h4>
                      <p className="text-muted-foreground">
                        Quantity: <span className="font-semibold text-foreground">{tx.crop.quantity} {tx.crop.unit}</span>
                      </p>
                      <p className="font-semibold text-primary">
                        Rate: ₹{tx.crop.rate?.toLocaleString('en-IN')}/Qtl
                      </p>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Total Buyer Escrow:</span>
                      <strong className="text-foreground font-mono">₹{tx.escrowAmount?.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>APMC Mandi Cess (1.5%):</span>
                      <strong className="text-sky-600 font-mono">₹{tx.mandiCess?.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground border-t border-border/60 pt-1">
                      <span className="font-bold text-foreground">Your Net Payout:</span>
                      <strong className={`font-mono font-black ${isSettled ? 'text-emerald-600' : 'text-primary'}`}>
                        ₹{(tx.farmerPayoutAmount || tx.netFarmerPayout)?.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  {/* Logistics & Delivery Snapshot */}
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Logistics Stage:</span>
                      <span className="font-bold text-foreground capitalize">
                        {tx.logisticsStatus?.replace(/_/g, ' ') || 'Pending'}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Vehicle Number:</span>
                      <span className="font-mono font-semibold text-foreground">
                        {tx.vehicleNumber || 'Unassigned'}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>DBT Settlement Ref:</span>
                      <span className="font-mono text-primary text-[10px]">
                        {tx.utrNumber}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border/80">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    APMC Electronic Payment Gateway Guarantee
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTx(tx)}
                      className="rounded-xl text-xs font-semibold h-8 px-3"
                    >
                      <FileText className="w-3 h-3 mr-1" /> View Receipt
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 5. Transaction Receipt Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">Mandi DBT Receipt</h3>
                  <p className="text-xs text-muted-foreground font-mono">{selectedTx.orderCode}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTx(null)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono font-bold text-foreground">{selectedTx._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Crop Consignment:</span>
                <span className="font-bold text-foreground">{selectedTx.crop?.name} ({selectedTx.crop?.quantity} {selectedTx.crop?.unit})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Procuring Trader:</span>
                <span className="font-bold text-foreground">{selectedTx.trader?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Buyer Company:</span>
                <span className="font-semibold text-foreground">{selectedTx.trader?.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking Date:</span>
                <span className="font-semibold text-foreground">{selectedTx.date}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-muted-foreground">Gross Escrow Deposited:</span>
                <span className="font-mono font-bold text-foreground">₹{selectedTx.escrowAmount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">APMC Statutory Cess (1.5%):</span>
                <span className="font-mono text-sky-600">₹{selectedTx.mandiCess?.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-sm">
                <span className="font-bold text-foreground">Net DBT Disbursed / Due:</span>
                <span className="font-mono font-black text-emerald-600">
                  ₹{(selectedTx.farmerPayoutAmount || selectedTx.netFarmerPayout)?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">DBT Reference Code:</span>
                <span className="font-mono text-primary">{selectedTx.utrNumber}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline"
                size="sm" 
                onClick={() => setSelectedTx(null)}
                className="rounded-xl text-xs font-semibold px-4"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="rounded-xl text-xs font-bold px-4 bg-primary text-primary-foreground shadow-sm"
              >
                Print Voucher
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FarmerTransactions
