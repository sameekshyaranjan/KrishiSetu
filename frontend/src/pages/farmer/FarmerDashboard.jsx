import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import cropService from '@/services/cropService'
import orderService from '@/services/orderService'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import TradeChatModal from '@/components/common/TradeChatModal'
import { 
  Sprout, 
  Gavel, 
  TrendingUp, 
  DollarSign, 
  Lock, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Radio, 
  ShieldCheck, 
  RefreshCw,
  Landmark,
  Package,
  Sparkles,
  MessageSquare,
  AlertCircle,
  X
} from 'lucide-react'

export const FarmerDashboard = () => {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [bids, setBids] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  // Chat & Counter Offer Modals
  const [selectedChatBid, setSelectedChatBid] = useState(null)
  const [counterBidModal, setCounterBidModal] = useState(null)
  const [counterPrice, setCounterPrice] = useState(0)

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [listingsData, bidsData, ordersData] = await Promise.all([
        cropService.getMyListings(),
        cropService.getInboundBids(),
        orderService.getFarmerOrders()
      ])
      setListings(listingsData || [])
      setBids(bidsData || [])
      setOrders(ordersData || [])
    } catch (err) {
      console.error('[FarmerDashboard] Load error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handleBidResponse = async (bidId, status) => {
    setActionLoadingId(bidId)
    try {
      await cropService.respondToBid(bidId, status)
      toast.success(status === 'accepted' ? 'Bid accepted! Funds locked in Escrow.' : 'Bid declined.')
      setBids(bids.map(b => b._id === bidId ? { ...b, status } : b))
      await loadDashboardData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to respond to bid.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleSendCounter = async (e) => {
    e.preventDefault()
    const parsed = Number(counterPrice)
    if (!parsed || parsed <= 0) {
      toast.error('Please enter a valid counter rate')
      return
    }
    setActionLoadingId(counterBidModal._id)
    try {
      await cropService.counterBid(counterBidModal._id, parsed)
      toast.success(`🎉 Counter offer of ₹${parsed.toLocaleString('en-IN')}/Qtl sent to trader!`)
      setCounterBidModal(null)
      await loadDashboardData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit counter offer.')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Calculated KPI stats
  const activeListings = listings.filter(l => l.status === 'available')
  const totalQuintals = activeListings.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0)
  const pendingBids = bids.filter(b => b.status === 'pending' || b.status === 'countered')

  const completedOrders = orders.filter(o => o.paymentStatus === 'disbursed' || o.paymentStatus === 'completed')
  const realizedRevenue = completedOrders.reduce((sum, o) => sum + (Number(o.netFarmerPayout) || Number(o.escrowAmount) || 0), 0)

  const activeEscrowOrders = orders.filter(o => o.paymentStatus === 'escrow_locked' || o.paymentStatus === 'dispatched')
  const escrowProtected = activeEscrowOrders.reduce((sum, o) => sum + (Number(o.escrowAmount) || 0), 0)

  return (
    <div className="space-y-8">
      
      {/* 1. Farmer Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-card via-card to-primary/10 border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20">
            <Sprout className="w-3.5 h-3.5" />
            <span>ನಮಸ್ಕಾರ / Welcome, Farmer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {user?.name ? `${user.name}'s Farm Command Center` : 'Farmer Command Center'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span>District: <strong>{user?.district || 'Karnataka'}</strong> • Zero Brokerage Active</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="sm" className="rounded-xl text-xs font-bold shadow-md h-10 px-5">
            <Link to="/farmer/listings">
              <Plus className="w-4 h-4 mr-1.5" /> List New Harvest
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadDashboardData} 
            disabled={loading}
            className="rounded-xl text-xs shadow-sm h-10"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-3xl bg-card border border-border space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Lots</span>
            <Package className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground">
            {activeListings.length} <span className="text-xs font-semibold text-muted-foreground">Lots</span>
          </p>
          <span className="text-[11px] text-emerald-500 font-medium">
            {totalQuintals} Total Quintals listed
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Inbound Bids</span>
            <Gavel className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-500">
            {pendingBids.length} <span className="text-xs font-semibold text-muted-foreground">Pending</span>
          </p>
          <span className="text-[11px] text-muted-foreground">
            From verified APMC buyers
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Realized Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">
            ₹{realizedRevenue.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-emerald-500 font-medium">
            100% Direct DBT payouts
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Escrow Protected</span>
            <Lock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
            ₹{escrowProtected.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-muted-foreground">
            Guaranteed before pickup
          </span>
        </div>
      </div>

      {/* 3. Quick Action Shortcuts Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link 
          to="/farmer/listings"
          className="p-4 rounded-2xl bg-card border border-border hover:border-primary/50 shadow-sm transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs text-foreground">Post Harvest Listing</p>
              <p className="text-[10px] text-muted-foreground">Sell directly in 60s</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </Link>

        <Link 
          to="/mandi-prices"
          className="p-4 rounded-2xl bg-card border border-border hover:border-primary/50 shadow-sm transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs text-foreground">Karnataka Mandi Rates</p>
              <p className="text-[10px] text-muted-foreground">Agmarknet live feeds</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </Link>

        <Link 
          to="/schemes"
          className="p-4 rounded-2xl bg-card border border-border hover:border-primary/50 shadow-sm transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs text-foreground">Govt Welfare Schemes</p>
              <p className="text-[10px] text-muted-foreground">Check DBT eligibility</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* 4. Two-Column Workspace: Inbound Bids & Active Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Live Inbound Trader Bids */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600">
                <Gavel className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-extrabold text-foreground tracking-tight">
                Live Inbound Trader Offers ({pendingBids.length})
              </h2>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">Real-time auction</span>
          </div>

          <div className="space-y-3">
            {bids.map((bid) => {
              const isPending = bid.status === 'pending'
              const isAccepted = bid.status === 'accepted'
              const isRejected = bid.status === 'rejected'
              const isCountered = bid.status === 'countered'
              const qty = Number(bid.crop?.quantity || 1)
              const currentRate = Number(bid.status === 'countered' && bid.counterAmount ? bid.counterAmount : bid.amount)
              const totalVal = currentRate * qty

              return (
                <div 
                  key={bid._id}
                  className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-4 hover:border-border/80 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Offer for: {bid.crop?.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {qty} {bid.crop?.unit || 'Quintals'}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base text-foreground mt-0.5">
                        {bid.trader?.companyName || bid.trader?.name}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary" />
                        <span>{bid.trader?.district || 'Karnataka'} • Lic: {bid.trader?.licenseNumber || 'APMC-VERIFIED'}</span>
                      </p>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="text-xl font-black text-primary">
                        ₹{currentRate.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">/ Quintal</span>
                      <span className="text-xs font-bold text-emerald-600 block">
                        Total: ₹{totalVal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {bid.message && (
                    <p className="p-3 rounded-2xl bg-muted/40 text-xs text-muted-foreground border border-border/60 italic">
                      &ldquo;{bid.message}&rdquo;
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                    <span className="text-[10px] text-muted-foreground">
                      Base: ₹{bid.crop?.basePrice?.toLocaleString('en-IN')}/Qtl
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Chat Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedChatBid(bid)}
                        className="h-8 rounded-xl text-xs font-semibold"
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1" /> Chat
                      </Button>

                      {isPending && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCounterBidModal(bid)
                              setCounterPrice(bid.amount ? bid.amount + 50 : 2000)
                            }}
                            className="h-8 rounded-xl text-xs font-bold border-amber-500/40 text-amber-700 hover:bg-amber-500/10"
                          >
                            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" /> Counter Offer
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionLoadingId === bid._id}
                            onClick={() => handleBidResponse(bid._id, 'rejected')}
                            className="h-8 rounded-xl text-xs text-rose-500 hover:text-rose-600 border-rose-500/20"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                          </Button>

                          <Button
                            size="sm"
                            disabled={actionLoadingId === bid._id}
                            onClick={() => handleBidResponse(bid._id, 'accepted')}
                            className="h-8 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accept (₹{totalVal.toLocaleString('en-IN')})
                          </Button>
                        </>
                      )}

                      {isCountered && (
                        <Button asChild size="sm" variant="outline" className="h-8 rounded-xl text-xs font-bold border-amber-500/40 text-amber-700 hover:bg-amber-500/10">
                          <Link to="/farmer/bids">
                            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" /> View Counter (₹{bid.counterAmount?.toLocaleString('en-IN')}/Qtl)
                          </Link>
                        </Button>
                      )}

                      {isAccepted && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accepted • Escrow Locked
                        </span>
                      )}

                      {isRejected && (
                        <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                          Declined
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {bids.length === 0 && !loading && (
              <div className="p-8 text-center rounded-3xl bg-card border border-border space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">No inbound offers yet.</p>
                <p className="text-[11px] text-muted-foreground">New bids from APMC traders will appear here in real time.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Crop Listings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-primary/10 text-primary">
                <Package className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-extrabold text-foreground tracking-tight">
                My Harvest Lots ({listings.length})
              </h2>
            </div>
            <Link to="/farmer/listings" className="text-xs text-primary font-semibold hover:underline">
              Manage All Lots
            </Link>
          </div>

          <div className="space-y-3">
            {listings.map((crop) => (
              <div 
                key={crop._id}
                className="p-5 rounded-3xl bg-card border border-border shadow-sm flex items-center justify-between gap-4 hover:border-border/80 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-foreground text-sm">
                      {crop.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      crop.status === 'available' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-muted text-muted-foreground border border-border'
                    }`}>
                      {crop.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Quantity: <strong>{crop.quantity} {crop.unit || 'Quintals'}</strong> • Base: ₹{crop.basePrice?.toLocaleString('en-IN')}/Qtl
                  </p>
                  <p className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Highest Bid: ₹{crop.currentHighestBid || crop.basePrice}/Qtl ({crop.bidsCount || 0} bids)
                  </p>
                </div>

                <Button asChild size="sm" variant="outline" className="rounded-xl text-xs shrink-0">
                  <Link to="/farmer/listings">
                    View Lot <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </div>
            ))}

            {listings.length === 0 && !loading && (
              <div className="p-8 text-center rounded-3xl bg-card border border-border space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">No harvest lots listed yet</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">List your harvest with 0% brokerage to receive live bids from verified APMC traders.</p>
                </div>
                <Button asChild size="sm" className="rounded-xl text-xs font-bold shadow-sm">
                  <Link to="/farmer/listings">
                    <Plus className="w-3.5 h-3.5 mr-1" /> List New Harvest
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Counter Offer Modal */}
      {counterBidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">Propose Counter Offer</h3>
                  <span className="text-[10px] text-muted-foreground">
                    {counterBidModal.crop?.name} • {counterBidModal.crop?.quantity || 1} {counterBidModal.crop?.unit || 'Quintals'}
                  </span>
                </div>
              </div>
              <button onClick={() => setCounterBidModal(null)} className="p-1 rounded-xl text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original Trader Bid:</span>
                <span className="font-bold text-foreground">₹{counterBidModal.amount?.toLocaleString('en-IN')}/Qtl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Crop Base Price:</span>
                <span className="font-bold text-foreground">₹{counterBidModal.crop?.basePrice?.toLocaleString('en-IN')}/Qtl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lot Quantity:</span>
                <span className="font-bold text-foreground">{counterBidModal.crop?.quantity || 1} {counterBidModal.crop?.unit || 'Quintals'}</span>
              </div>
            </div>

            <form onSubmit={handleSendCounter} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Your Proposed Counter Rate (₹/Quintal) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    className="w-full h-11 pl-8 pr-3 rounded-xl bg-muted border border-border font-mono font-bold text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 space-y-1 text-xs">
                <span className="text-muted-foreground block text-[11px]">Total Counter Value:</span>
                <span className="text-base font-black text-primary block">
                  ₹{(Number(counterPrice || 0) * Number(counterBidModal.crop?.quantity || 1)).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  The trader will be notified to review and lock this full amount into escrow.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setCounterBidModal(null)} className="rounded-xl text-xs h-10 px-4">
                  Cancel
                </Button>
                <Button type="submit" disabled={actionLoadingId === counterBidModal._id} className="rounded-xl text-xs font-bold h-10 px-5 bg-primary text-primary-foreground">
                  {actionLoadingId === counterBidModal._id ? 'Sending...' : 'Send Counter Proposal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trade Negotiation Chat Modal */}
      {selectedChatBid && (
        <TradeChatModal
          isOpen={Boolean(selectedChatBid)}
          onClose={() => setSelectedChatBid(null)}
          recipientId={selectedChatBid.trader?._id || selectedChatBid.trader}
          recipientName={selectedChatBid.trader?.name || selectedChatBid.trader?.companyName || 'Verified APMC Trader'}
          recipientRole="Trader"
          crop={{
            _id: selectedChatBid.crop?._id || selectedChatBid.crop,
            title: selectedChatBid.crop?.name || 'Produce Lot',
            quantity: selectedChatBid.crop?.quantity || 50,
            unit: selectedChatBid.crop?.unit || 'Quintals',
            price: Number(selectedChatBid.amount || 2000),
            basePrice: Number(selectedChatBid.crop?.basePrice || 2000),
            lotId: selectedChatBid.crop?._id ? `LOT-${selectedChatBid.crop._id.slice(-6)}` : 'LOT'
          }}
        />
      )}
    </div>
  )
}

export default FarmerDashboard
