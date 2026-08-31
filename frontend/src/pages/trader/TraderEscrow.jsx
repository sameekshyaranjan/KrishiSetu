import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import escrowService from '@/services/escrowService'
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
  Info,
  CheckCircle2,
  Zap,
  Loader2
} from 'lucide-react'

export const TraderEscrow = () => {
  const { user } = useAuth()
  const [availableBalance, setAvailableBalance] = useState(0)
  const [lockedBalance, setLockedBalance] = useState(0)
  const [totalDisbursed, setTotalDisbursed] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  // Top-Up Modal State
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [depositAmount, setDepositAmount] = useState('1000')
  const [paymentMethod, setPaymentMethod] = useState('netbanking') // 'netbanking' | 'neft'

  const loadEscrowOverview = async () => {
    setLoading(true)
    try {
      const overview = await escrowService.getWalletOverview()
      if (overview) {
        setAvailableBalance(Number(overview.availableBalance) || 0)
        setLockedBalance(Number(overview.lockedEscrow) || 0)
        setTotalDisbursed(Number(overview.totalDisbursed) || 0)
        setTransactions(Array.isArray(overview.transactions) ? overview.transactions : [])
      } else {
        setAvailableBalance(0)
        setLockedBalance(0)
        setTotalDisbursed(0)
        setTransactions([])
      }
    } catch (err) {
      console.warn('Failed to load escrow overview:', err)
      setAvailableBalance(0)
      setLockedBalance(0)
      setTotalDisbursed(0)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEscrowOverview()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadEscrowOverview()
    setIsRefreshing(false)
    toast.success('Escrow trust account synchronized with banking ledger! ⚡')
  }

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirmTopUp = async (e) => {
    e.preventDefault()
    const parsed = Number(depositAmount)
    if (!parsed || parsed < 100) {
      toast.error('Minimum escrow deposit is ₹100')
      return
    }

    setIsSubmitting(true)
    try {
      const updated = await escrowService.depositFunds(
        parsed, 
        paymentMethod === 'netbanking' ? 'Instant NetBanking / UPI' : 'RTGS / NEFT Core Banking'
      )

      setAvailableBalance(updated.availableBalance)
      setLockedBalance(updated.lockedEscrow)
      setTotalDisbursed(updated.totalDisbursed)
      setTransactions(updated.transactions)
      toast.success(`₹${parsed.toLocaleString('en-IN')} credited to Escrow Wallet instantly! 🎉`)
      setIsTopUpOpen(false)
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Top-up transaction failed.'
      toast.error(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReleaseDBTPayout = async (txId) => {
    try {
      const updated = await escrowService.releaseEscrowPayout(txId)
      setLockedBalance(updated.lockedEscrow)
      setTotalDisbursed(updated.totalDisbursed)
      setTransactions(updated.transactions)
      toast.success('APMC Weighbridge Pass Cleared! Direct Bank Payout (DBT) disbursed to Farmer account! 💸')
    } catch (err) {
      toast.error('Failed to release payout.')
    }
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (selectedFilter === 'all') return true
      return t.status === selectedFilter || t.type === selectedFilter
    })
  }, [transactions, selectedFilter])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header & Trust Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>RBI-Regulated Escrow Trust Vault (Axis Bank & HDFC Escrow)</span>
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
            size="sm"
            onClick={() => setIsTopUpOpen(true)}
            className="rounded-xl text-xs font-bold shadow-md h-10 px-5 bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Add Escrow Capital
          </Button>
        </div>
      </div>

      {/* 2. Escrow Balance HUD Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Card 1: Liquid Available Balance */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-3 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Available Bidding Liquid</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Unlock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <h2 className="text-3xl font-black text-emerald-600 font-mono">
              ₹{availableBalance.toLocaleString('en-IN')}
            </h2>
            <p className="text-xs text-muted-foreground">Instantly allocatable for auction bidding</p>
          </div>
        </div>

        {/* Card 2: Active Locked Escrow */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-3 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Locked in Active Auctions</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <h2 className="text-3xl font-black text-amber-600 font-mono">
              ₹{lockedBalance.toLocaleString('en-IN')}
            </h2>
            <p className="text-xs text-muted-foreground">Held securely pending APMC weighment</p>
          </div>
        </div>

        {/* Card 3: Total DBT Disbursed */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-3 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Disbursed to Farmers</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <h2 className="text-3xl font-black text-foreground font-mono">
              ₹{totalDisbursed.toLocaleString('en-IN')}
            </h2>
            <p className="text-xs text-muted-foreground">Direct Benefit Transfer settled trades</p>
          </div>
        </div>
      </div>

      {/* 3. Escrow Transaction Ledger */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-6 shadow-sm">
        
        {/* Ledger Header & Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" /> Escrow Audit Trail & UTR Ledger
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Transparent, immutable banking logs with lot-by-lot milestone tracking and tax cess references.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {['all', 'locked', 'disbursed', 'deposited'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize shrink-0 ${
                  selectedFilter === filter
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-muted/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table / List */}
        <div className="space-y-3">
          {filteredTransactions.map((tx) => (
            <div
              key={tx._id}
              className="p-4 sm:p-5 rounded-2xl bg-muted/20 border border-border hover:border-border/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-xs text-foreground bg-muted px-2 py-0.5 rounded-md">
                    {tx._id}
                  </span>
                  <span className="font-bold text-sm text-foreground">
                    {tx.cropName}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    tx.status === 'locked'
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      : tx.status === 'disbursed'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                  }`}>
                    {tx.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>{tx.farmerName}</span>
                  <span>•</span>
                  <span>{tx.date}</span>
                  {tx.utr && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-foreground font-semibold flex items-center gap-1">
                        UTR: {tx.utr}
                        <button
                          onClick={() => handleCopy(tx.utr, 'UTR')}
                          className="hover:text-primary transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </span>
                    </>
                  )}
                </div>

                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                  <CheckCheck className="w-3.5 h-3.5" /> {tx.milestone}
                </p>
              </div>

              {/* Amount & Actions */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                <span className="text-lg font-black text-foreground font-mono">
                  ₹{tx.amount.toLocaleString('en-IN')}
                </span>

                {tx.status === 'locked' && (
                  <Button
                    size="sm"
                    onClick={() => handleReleaseDBTPayout(tx._id)}
                    className="rounded-xl text-[11px] font-bold h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    Simulate Weighbridge Pass & DBT 💸
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Top-Up Escrow Modal */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            <button
              onClick={() => setIsTopUpOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Instant Escrow Capital Injection</span>
              </div>
              <h2 className="text-xl font-extrabold text-foreground">
                Add Escrow Bidding Capital
              </h2>
              <p className="text-xs text-muted-foreground">
                Deposit funds into your designated RBI-regulated escrow trust account via NetBanking or RTGS.
              </p>
            </div>

            <form onSubmit={handleConfirmTopUp} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Deposit Amount (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-base font-mono font-bold text-muted-foreground">₹</span>
                  <input
                    type="number"
                    required
                    min={100}
                    step="any"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter deposit amount"
                    className="w-full h-12 pl-8 pr-4 rounded-2xl bg-background border-2 border-emerald-500/40 focus:border-emerald-500 text-lg font-mono font-black text-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick Amount Chips */}
              <div className="flex items-center gap-2">
                {['1000', '5000', '10000', '50000', '100000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className="flex-1 py-1.5 rounded-xl bg-muted/60 hover:bg-muted border border-border text-xs font-mono font-bold text-foreground transition-colors"
                  >
                    ₹{Number(amt) >= 100000 ? `${(Number(amt) / 100000).toFixed(0)}L` : `${(Number(amt) / 1000).toFixed(0)}K`}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Payment Rail *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      paymentMethod === 'netbanking'
                        ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-muted/40 border-border hover:border-emerald-500/40'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-600 mb-1" />
                    <p className="font-bold text-xs text-foreground">Instant NetBanking / UPI</p>
                    <span className="text-[10px] text-muted-foreground">Immediate sandbox balance credit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('neft')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      paymentMethod === 'neft'
                        ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-muted/40 border-border hover:border-emerald-500/40'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-emerald-600 mb-1" />
                    <p className="font-bold text-xs text-foreground">RTGS / NEFT Transfer</p>
                    <span className="text-[10px] text-muted-foreground">Virtual Account #{user?.id ? user.id.slice(-6).toUpperCase() : 'VIRT-8891'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-[11px] text-muted-foreground space-y-1">
                <p className="font-bold text-foreground flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-primary" /> 100% Capital Protection Guarantee
                </p>
                <p>Funds remain your property in the RBI trust account and are only disbursed upon digital weighbridge certification.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => setIsTopUpOpen(false)}
                  className="rounded-xl text-xs h-10 px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl text-xs font-bold h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Deposit...</span>
                    </>
                  ) : (
                    <span>Authorize Deposit 🔒</span>
                  )}
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
