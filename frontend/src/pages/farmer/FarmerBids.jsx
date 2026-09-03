import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import cropService from '@/services/cropService'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import TradeChatModal from '@/components/common/TradeChatModal'
import { 
  Gavel, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  Sparkles, 
  Building2, 
  Star, 
  Search, 
  Filter, 
  RefreshCw, 
  ArrowRight, 
  X, 
  AlertCircle,
  Truck,
  Check,
  MessageSquare
} from 'lucide-react'

export const FarmerBids = () => {
  const { user } = useAuth()
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'pending' | 'accepted' | 'rejected'
  const [selectedCropFilter, setSelectedCropFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [selectedBidForEscrow, setSelectedBidForEscrow] = useState(null)
  const [counterBidModal, setCounterBidModal] = useState(null)
  const [counterPrice, setCounterPrice] = useState(0)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedChatBid, setSelectedChatBid] = useState(null)

  const loadBids = async () => {
    setLoading(true)
    try {
      const data = await cropService.getMyBids()
      setBids(data || [])
    } catch (err) {
      console.error('[FarmerBids] Failed to load bids:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBids()
  }, [])

  // 1. Accept Bid Handler (Direct or via Escrow Modal)
  const handleAcceptBid = async (bidId) => {
    setActionLoading(true)
    try {
      await cropService.acceptBid(bidId)
      setBids((prev) =>
        prev.map((b) =>
          b._id === bidId ? { ...b, status: 'accepted' } : b
        )
      )
      toast.success('🎉 Bid Accepted! Escrow locked in database for this crop lot.')
      setSelectedBidForEscrow(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept bid. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  // 2. Reject Bid Handler
  const handleRejectBid = async (bidId) => {
    try {
      await cropService.rejectBid(bidId)
      setBids((prev) =>
        prev.map((b) =>
          b._id === bidId ? { ...b, status: 'rejected' } : b
        )
      )
      toast.success('Bid declined.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline bid.')
    }
  }

  // 3. Counter Offer Handler
  const handleSendCounter = (e) => {
    e.preventDefault()
    if (!counterPrice || counterPrice <= 0) return
    toast.success(`Counter offer of ₹${counterPrice.toLocaleString('en-IN')}/Qtl sent to trader!`)
    setCounterBidModal(null)
  }

  // Derived Unique Crops for Dropdown Filter
  const uniqueCropNames = useMemo(() => {
    const names = new Set()
    bids.forEach((b) => {
      const cName = b.crop?.name || b.cropListing?.name
      if (cName) names.add(cName)
    })
    return Array.from(names)
  }, [bids])

  // Filtered Bids List
  const filteredBids = useMemo(() => {
    return bids.filter((b) => {
      const cName = b.crop?.name || b.cropListing?.name || ''
      const tName = b.trader?.name || b.trader?.companyName || ''
      const matchesSearch = 
        tName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cName.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter
      const matchesCrop = selectedCropFilter === 'all' || cName === selectedCropFilter

      return matchesSearch && matchesStatus && matchesCrop
    })
  }, [bids, searchQuery, statusFilter, selectedCropFilter])

  // KPIs
  const pendingCount = bids.filter((b) => b.status === 'pending').length
  const highestOffer = bids.reduce((max, b) => {
    const amt = b.amount || b.bidPrice || 0
    return amt > max ? amt : max
  }, 0)
  const totalEscrowPotential = bids
    .filter((b) => b.status === 'pending' || b.status === 'accepted')
    .reduce((sum, b) => {
      const amt = b.amount || b.bidPrice || 0
      const qty = b.crop?.quantity || b.cropListing?.quantity || 50
      return sum + (b.totalAmount || (amt * qty))
    }, 0)

  return (
    <div className="space-y-8">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20 mb-2">
            <Gavel className="w-3.5 h-3.5" />
            <span>Live Trader Inbound Offers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Inbound Trader Bids & Negotiations
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Review competitive offers from verified APMC traders, negotiate counter prices, and lock escrow contracts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadBids} 
            disabled={loading}
            className="rounded-xl text-xs shadow-sm h-10"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Bids
          </Button>
          <Button asChild className="rounded-xl text-xs font-bold shadow-md h-10 px-4">
            <Link to="/farmer/listings">
              View Crop Lots
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Key Negotiation Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Metric 1: Pending Bids */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Pending Action</p>
            <h3 className="text-2xl font-black text-foreground">{pendingCount} Offers</h3>
            <span className="text-[11px] text-amber-600 font-medium">Awaiting your approval</span>
          </div>
        </div>

        {/* Metric 2: Highest Active Offer */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Highest Bid Rate</p>
            <h3 className="text-2xl font-black text-primary">₹{highestOffer.toLocaleString('en-IN')}/Qtl</h3>
            <span className="text-[11px] text-emerald-600 font-medium">+14.2% above floor</span>
          </div>
        </div>

        {/* Metric 3: Total Potential Value */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Active Escrow Pipeline</p>
            <h3 className="text-2xl font-black text-foreground">₹{totalEscrowPotential.toLocaleString('en-IN')}</h3>
            <span className="text-[11px] text-muted-foreground">Direct bank deposit</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-3xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by trader name or crop..."
              className="w-full h-10 pl-10 pr-3 rounded-2xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Crop Lot Filter Dropdown */}
            {uniqueCropNames.length > 0 && (
              <select
                value={selectedCropFilter}
                onChange={(e) => setSelectedCropFilter(e.target.value)}
                className="h-10 px-3 rounded-2xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
              >
                <option value="all">All Crop Lots</option>
                {uniqueCropNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            )}

            {/* Status Filter Buttons */}
            <div className="flex items-center bg-muted/60 p-1 rounded-2xl border border-border text-xs font-semibold shrink-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  statusFilter === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All ({bids.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  statusFilter === 'pending' ? 'bg-card text-amber-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Pending ({bids.filter(b => b.status === 'pending').length})
              </button>
              <button
                onClick={() => setStatusFilter('accepted')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  statusFilter === 'accepted' ? 'bg-card text-emerald-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Accepted ({bids.filter(b => b.status === 'accepted').length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Inbound Bids Cards Stream */}
      <div className="space-y-4">
        {filteredBids.map((bid) => {
          const isPending = bid.status === 'pending'
          const isAccepted = bid.status === 'accepted'
          const isRejected = bid.status === 'rejected'
          const isCancelled = bid.status === 'cancelled' || bid.status === 'withdrawn'
          const crop = bid.crop || bid.cropListing || {}
          const quantity = crop.quantity || 50
          const offerRate = Number(bid.amount || bid.bidPrice || 0)
          const baseRate = Number(crop.basePrice || 2000)
          const totalVal = bid.totalAmount || (offerRate * quantity)
          const reserveDiff = offerRate - baseRate

          return (
            <div 
              key={bid._id}
              className={`p-6 rounded-3xl bg-card border transition-all ${
                isAccepted 
                  ? 'border-emerald-500/50 bg-emerald-500/[0.02]' 
                  : isRejected 
                  ? 'border-border/60 opacity-60' 
                  : 'border-border hover:border-primary/50 shadow-sm'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Left: Crop & Trader Info */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-muted overflow-hidden shrink-0 border border-border">
                    <img 
                      src={crop.images?.[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop'} 
                      alt={crop.name || 'Crop'} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-base sm:text-lg text-foreground">
                        {crop.name || 'Produce Lot'}
                      </h3>
                      <span className="text-xs text-muted-foreground font-semibold">
                        • {quantity} Quintals
                      </span>
                    </div>

                    {/* Trader Trust Card */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-foreground flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-primary" />
                        {bid.trader?.name || bid.trader?.companyName || 'Verified APMC Trader'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> APMC Verified
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> 4.9 (42 Trades)
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground pt-1">
                      Reserve floor: <span className="font-semibold text-foreground">₹{baseRate.toLocaleString('en-IN')}/Qtl</span>
                    </p>
                  </div>
                </div>

                {/* Center / Right: Offer Numbers & Status */}
                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-border">
                  
                  {/* Financial Values */}
                  <div className="text-left lg:text-right space-y-1">
                    <div className="flex items-center lg:justify-end gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">Offer Rate:</span>
                      <span className="text-2xl font-black text-primary">
                        ₹{offerRate.toLocaleString('en-IN')}/Qtl
                      </span>
                    </div>

                    <div className="flex items-center lg:justify-end gap-2 text-xs">
                      <span className="font-bold text-foreground">
                        Total: ₹{totalVal.toLocaleString('en-IN')}
                      </span>
                      {reserveDiff > 0 && (
                        <span className="text-emerald-600 font-bold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          +₹{reserveDiff}/Qtl
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions / Status Badges */}
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedChatBid(bid)}
                      className="rounded-xl text-xs h-10 px-3 font-semibold text-purple-600 border-purple-500/30 hover:bg-purple-500/10 flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </Button>

                    {isPending && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setCounterBidModal(bid)
                            setCounterPrice(offerRate + 100)
                          }}
                          className="rounded-xl text-xs h-10 px-3 font-semibold"
                        >
                          Counter
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleRejectBid(bid._id)}
                          className="rounded-xl text-xs h-10 px-3 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 font-semibold"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedBidForEscrow(bid)}
                          className="rounded-xl text-xs font-bold h-10 px-4 bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                        >
                          <Check className="w-4 h-4 mr-1.5" /> Accept Offer
                        </Button>
                      </>
                    )}

                    {isAccepted && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Escrow Locked • Awaiting Dispatch</span>
                      </div>
                    )}

                    {isRejected && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted text-muted-foreground text-xs font-medium">
                        <XCircle className="w-4 h-4" />
                        <span>Declined</span>
                      </div>
                    )}

                    {isCancelled && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-bold">
                        <XCircle className="w-4 h-4" />
                        <span>Cancelled by Trader</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredBids.length === 0 && !loading && (
        <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
          <p className="text-base font-bold text-foreground">No inbound bids matching your current filters</p>
          <p className="text-xs text-muted-foreground">Keep your crop listings updated with competitive reserve rates to attract APMC traders.</p>
          <Button asChild size="sm">
            <Link to="/farmer/listings">Manage My Crop Lots</Link>
          </Button>
        </div>
      )}

      {/* 5. Escrow Authorization Modal */}
      {selectedBidForEscrow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            <button
              onClick={() => setSelectedBidForEscrow(null)}
              className="absolute right-5 top-5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> Direct APMC Escrow Security
              </div>
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                Confirm Deal & Lock Escrow
              </h2>
              <p className="text-xs text-muted-foreground">
                Accepting this bid locks the buyer's funds in escrow. Funds are disbursed to your bank account upon pickup.
              </p>
            </div>

            {/* Deal Breakdown */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Produce Lot:</span>
                <span className="font-bold text-foreground">{selectedBidForEscrow.cropListing?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trader Name:</span>
                <span className="font-bold text-foreground">{selectedBidForEscrow.trader?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Agreed Rate:</span>
                <span className="font-bold text-foreground">₹{selectedBidForEscrow.bidPrice?.toLocaleString('en-IN')}/Qtl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lot Quantity:</span>
                <span className="font-bold text-foreground">{selectedBidForEscrow.cropListing?.quantity || 50} Quintals</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/60">
                <span className="text-sm font-bold text-foreground">Total Payout:</span>
                <span className="text-lg font-black text-primary">
                  ₹{(selectedBidForEscrow.totalAmount || (selectedBidForEscrow.bidPrice * (selectedBidForEscrow.cropListing?.quantity || 50))).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedBidForEscrow(null)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                disabled={actionLoading}
                onClick={() => handleAcceptBid(selectedBidForEscrow._id)}
                className="rounded-xl text-xs font-bold shadow-md px-6 bg-primary text-primary-foreground"
              >
                {actionLoading ? 'Locking Escrow...' : 'Confirm & Authorize Escrow'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Counter Offer Modal */}
      {counterBidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            <button
              onClick={() => setCounterBidModal(null)}
              className="absolute right-5 top-5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                Send Counter Offer
              </h2>
              <p className="text-xs text-muted-foreground">
                Propose an alternate rate to {counterBidModal.trader?.name}.
              </p>
            </div>

            <form onSubmit={handleSendCounter} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Your Counter Rate (₹ / Quintal)
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <span className="text-[10px] text-muted-foreground block">
                  Original trader offer was ₹{counterBidModal.bidPrice?.toLocaleString('en-IN')}/Qtl.
                </span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setCounterBidModal(null)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl text-xs font-bold shadow-md px-5 bg-primary text-primary-foreground"
                >
                  Send Counter Proposal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Real-Time Trade Negotiation Modal */}
      {selectedChatBid && (
        <TradeChatModal
          isOpen={Boolean(selectedChatBid)}
          onClose={() => setSelectedChatBid(null)}
          recipientId={selectedChatBid.trader?._id || selectedChatBid.trader}
          recipientName={selectedChatBid.trader?.name || selectedChatBid.trader?.companyName || 'Verified APMC Trader'}
          recipientRole="Trader"
          crop={{
            _id: selectedChatBid.crop?._id || selectedChatBid.crop,
            title: selectedChatBid.crop?.name || selectedChatBid.cropListing?.name || 'Produce Lot',
            quantity: selectedChatBid.crop?.quantity || selectedChatBid.cropListing?.quantity || 100,
            unit: selectedChatBid.crop?.unit || selectedChatBid.cropListing?.unit || 'Quintals',
            price: Number(selectedChatBid.amount || selectedChatBid.bidPrice || 2000),
            basePrice: Number(selectedChatBid.crop?.basePrice || 2000),
            lotId: selectedChatBid.crop?._id ? `LOT-${selectedChatBid.crop._id.slice(-6)}` : 'LOT'
          }}
        />
      )}
    </div>
  )
}

export default FarmerBids
