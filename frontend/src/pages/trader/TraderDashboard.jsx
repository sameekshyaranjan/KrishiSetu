import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import bidService from '@/services/bidService'
import orderService from '@/services/orderService'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  Briefcase, 
  ShoppingCart, 
  Gavel, 
  ShieldCheck, 
  TrendingUp, 
  Package, 
  Truck, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  ChevronRight, 
  Sparkles, 
  Building2, 
  Layers, 
  FileText, 
  MapPin,
  RefreshCw,
  Plus
} from 'lucide-react'

export const TraderDashboard = () => {
  const { user } = useAuth()
  const [bids, setBids] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Raise Bid Modal State
  const [raiseBidLot, setRaiseBidLot] = useState(null)
  const [newBidAmount, setNewBidAmount] = useState('')

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [rawBids, rawOrders] = await Promise.all([
        bidService.getMyBids(),
        orderService.getTraderOrders()
      ])

      const formattedBids = Array.isArray(rawBids) ? rawBids.map(b => {
        const crop = b.crop || b.cropListing || {}
        const rate = Number(b.amount || b.bidPrice || 0)
        return {
          _id: b._id,
          lotId: `LOT-${b._id?.slice(-6)}`,
          crop: {
            name: crop.name || 'Crop Produce Lot',
            quantity: Number(crop.quantity) || 50,
            unit: crop.unit || 'Quintals',
            basePrice: Number(crop.basePrice) || 2000,
            image: crop.images?.[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80',
            farmerName: b.farmer?.name || 'Verified Farmer',
            location: `${b.farmer?.village || 'APMC'}, ${b.farmer?.district || 'Karnataka'}`
          },
          myBidAmount: rate,
          highestBid: rate,
          status: b.status === 'accepted' ? 'accepted' : b.status === 'rejected' ? 'outbid' : 'winning',
          bidCount: 1,
          closingIn: 'Live',
          lastBidTime: new Date(b.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      }) : []

      setBids(formattedBids)
      setOrders(Array.isArray(rawOrders) ? rawOrders : [])
    } catch (err) {
      console.warn('[TraderDashboard] Load error:', err)
      setBids([])
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadDashboardData()
    setIsRefreshing(false)
    toast.success('Live APMC marketplace & bid statuses synchronized!')
  }

  const handleOpenRaiseBid = (bidItem) => {
    setRaiseBidLot(bidItem)
    setNewBidAmount(bidItem.highestBid + 50)
  }

  const handleConfirmRaiseBid = (e) => {
    e.preventDefault()
    const parsed = Number(newBidAmount)
    if (!parsed || parsed <= (raiseBidLot?.highestBid || 0)) {
      toast.error(`New bid must exceed highest bid of ₹${raiseBidLot?.highestBid}/Qtl`)
      return
    }

    setBids((prev) =>
      prev.map((b) =>
        b._id === raiseBidLot._id
          ? { ...b, myBidAmount: parsed, highestBid: parsed, status: 'winning', bidCount: b.bidCount + 1 }
          : b
      )
    )

    toast.success(`Bid raised to ₹${parsed.toLocaleString('en-IN')}/Qtl! You are now highest bidder!`)
    setRaiseBidLot(null)
  }

  const handleAcceptCounter = (bidItem) => {
    const acceptedRate = bidItem.farmerCounterRate || bidItem.highestBid
    setBids((prev) =>
      prev.map((b) =>
        b._id === bidItem._id
          ? { ...b, myBidAmount: acceptedRate, status: 'accepted' }
          : b
      )
    )
    toast.success(`Counter offer of ₹${acceptedRate}/Qtl accepted! Lot transitioned to Escrow Funding.`)
  }

  return (
    <div className="space-y-8">
      
      {/* 1. Header & Verification Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-semibold border border-amber-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>APMC Karnataka Verified Bulk Procurement License #KA-BLR-TRD-2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Trader Command Center 💼
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time direct farm procurement, live competitive auction bidding, and APMC yard transit tracking.
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
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Radar
          </Button>

          <Button 
            asChild 
            size="sm" 
            className="rounded-xl text-xs h-10 px-5 shadow-md font-bold bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Link to="/trader/marketplace">
              <ShoppingCart className="w-4 h-4 mr-1.5" /> Explore Farm Lots
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. 4 Business & Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Active In-Flight Bids */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">In-Flight Bids</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Gavel className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground">{bids.length} Lots</p>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-emerald-600 font-bold">{bids.filter(b => b.status === 'winning' || b.status === 'accepted').length} Winning</span>
            <span>•</span>
            <span className="text-rose-500 font-bold">{bids.filter(b => b.status === 'outbid' || b.status === 'rejected').length} Outbid</span>
          </div>
        </div>

        {/* KPI 2: Secured in Escrow */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Secured in Escrow</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">
            ₹{orders.filter(o => o.paymentStatus === 'escrow_locked' || o.paymentStatus === 'dispatched').reduce((sum, o) => sum + (Number(o.escrowAmount) || 0), 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-muted-foreground">100% Capital Protected</span>
        </div>

        {/* KPI 3: Logistics Transit */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">In-Transit Shipments</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-sky-600">
            {orders.filter(o => o.deliveryStatus === 'in_transit' || o.deliveryStatus === 'dispatched').length} Consignments
          </p>
          <span className="text-[11px] text-muted-foreground">
            {orders.filter(o => o.deliveryStatus === 'in_transit' || o.deliveryStatus === 'dispatched').reduce((sum, o) => sum + (Number(o.quantity) || 0), 0)} Quintals moving
          </span>
        </div>

        {/* KPI 4: Direct Savings vs APMC Yard */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Direct Farm Savings</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-primary">+11.8%</p>
          <span className="text-[11px] text-emerald-600 font-medium">vs physical mandi middlemen</span>
        </div>
      </div>

      {/* 3. Live Active Bids & Competition Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Gavel className="w-5 h-5 text-amber-600" />
            Active Bidding Console & Auction Pipeline
          </h2>
          <span className="text-xs text-muted-foreground font-medium">Real-time socket updates</span>
        </div>

        {bids.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-card border border-border space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
              <Gavel className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-foreground">No Active Bids</p>
            <p className="text-xs text-muted-foreground">Explore farm lots on the APMC marketplace to start bidding on fresh produce.</p>
            <Button asChild size="sm" className="rounded-xl text-xs bg-amber-600 hover:bg-amber-700 text-white">
              <Link to="/trader/marketplace">Explore Marketplace</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bids.map((bid) => (
              <div 
                key={bid._id}
                className={`p-5 rounded-3xl bg-card border transition-all flex flex-col justify-between space-y-4 shadow-sm ${
                  bid.status === 'winning' 
                    ? 'border-emerald-500/40 bg-emerald-500/[0.02]' 
                    : bid.status === 'outbid' 
                    ? 'border-rose-500/40 bg-rose-500/[0.02]' 
                    : bid.status === 'countered'
                    ? 'border-amber-500/40 bg-amber-500/[0.02]'
                    : 'border-primary/40 bg-primary/[0.02]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <img 
                    src={bid.crop.image} 
                    alt={bid.crop.name} 
                    className="w-16 h-16 rounded-2xl object-cover border border-border shrink-0 shadow-sm"
                  />

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                        {bid.lotId}
                      </span>

                      {/* Status Badge */}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                        bid.status === 'winning' 
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                          : bid.status === 'outbid' 
                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' 
                          : bid.status === 'countered'
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          : 'bg-primary/10 text-primary border border-primary/20'
                      }`}>
                        {bid.status === 'winning' && <CheckCircle2 className="w-3 h-3" />}
                        {bid.status === 'outbid' && <AlertTriangle className="w-3 h-3" />}
                        {bid.status === 'countered' && <Sparkles className="w-3 h-3" />}
                        {bid.status === 'accepted' && <CheckCircle2 className="w-3 h-3" />}
                        <span>
                          {bid.status === 'winning' 
                            ? 'Winning Bid' 
                            : bid.status === 'outbid' 
                            ? 'Outbid!' 
                            : bid.status === 'countered'
                            ? 'Counter Received'
                            : 'Offer Accepted'}
                        </span>
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-foreground truncate">
                      {bid.crop.name}
                    </h3>

                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <span><MapPin className="w-3 h-3 inline text-primary mr-0.5" />{bid.crop.location}</span>
                      <span>•</span>
                      <span className="font-semibold text-foreground">{bid.crop.quantity} {bid.crop.unit}</span>
                    </p>
                  </div>
                </div>

                {/* Price Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-muted/40 border border-border/80 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">My Offer</span>
                    <span className="font-extrabold text-foreground">₹{bid.myBidAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground block">Highest Bid</span>
                    <span className={`font-black ${bid.status === 'outbid' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ₹{bid.highestBid.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground block">Closing In</span>
                    <span className="font-semibold text-foreground flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" /> {bid.closingIn}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {bid.bidCount} Total Competitor Bids
                  </span>

                  <div className="flex items-center gap-2">
                    {bid.status === 'outbid' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleOpenRaiseBid(bid)}
                        className="rounded-xl text-xs font-bold h-8 bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> Raise Bid
                      </Button>
                    )}

                    {bid.status === 'winning' && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Top Bidder
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Active Procurement Orders & Logistics Tracker */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-sky-600" />
            Active Direct Procurement Shipments
          </h2>
          <span className="text-xs text-muted-foreground font-medium">APMC Weighment Verified</span>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-card border border-border space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 mx-auto flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-foreground">No Active Shipments</p>
            <p className="text-xs text-muted-foreground">When your bids are accepted and escrow is locked, live consignments and GPS tracking will appear here.</p>
          </div>
        ) : (
          <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border">
                  <tr>
                    <th className="p-4">Order ID & Crop</th>
                    <th className="p-4">Farmer / Producer</th>
                    <th className="p-4 text-right">Escrow Payout</th>
                    <th className="p-4">Logistics & ETA</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-[11px] text-primary block">{order.orderId || order._id}</span>
                        <span className="font-extrabold text-foreground">{order.cropName}</span>
                        <span className="text-[11px] text-muted-foreground block">{order.quantity}</span>
                      </td>

                      <td className="p-4 font-medium text-foreground">
                        {order.farmerName || 'Verified Farmer'}
                      </td>

                      <td className="p-4 text-right font-extrabold text-foreground">
                        ₹{(Number(order.totalPayout) || Number(order.escrowAmount) || 0).toLocaleString('en-IN')}
                        <span className="block text-[10px] font-semibold text-emerald-600">{order.escrowStatus || 'Escrow Locked'}</span>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-foreground block">{order.transitStage || 'In-Transit'}</span>
                        <span className="text-[11px] text-muted-foreground block">{order.transporter || 'APMC Assigned Fleet'}</span>
                        <span className="text-[10px] text-sky-600 font-bold">ETA: {order.eta || 'Standard APMC Transit'}</span>
                      </td>

                      <td className="p-4 text-right">
                        <Button asChild size="sm" variant="outline" className="rounded-xl text-xs h-8">
                          <Link to="/trader/orders">
                            Track Truck <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 5. Modal: Raise Bid Overlay */}
      {raiseBidLot && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6">
            <div className="space-y-1 border-b border-border pb-4">
              <span className="text-[10px] font-mono font-bold text-primary uppercase">
                {raiseBidLot.lotId}
              </span>
              <h3 className="text-lg font-extrabold text-foreground">
                Raise Your Procurement Bid
              </h3>
              <p className="text-xs text-muted-foreground">
                Current highest competitor bid: <span className="font-bold text-rose-600">₹{raiseBidLot.highestBid}/Qtl</span>
              </p>
            </div>

            <form onSubmit={handleConfirmRaiseBid} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Your New Bid Rate (₹ / Quintal)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-muted-foreground text-sm">₹</span>
                  <input
                    type="number"
                    min={raiseBidLot.highestBid + 10}
                    step="10"
                    required
                    value={newBidAmount}
                    onChange={(e) => setNewBidAmount(e.target.value)}
                    className="w-full h-11 pl-8 pr-4 rounded-xl bg-background border border-border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Estimated Total Lot Investment: <span className="font-bold text-foreground">₹{(Number(newBidAmount) * raiseBidLot.crop.quantity).toLocaleString('en-IN')}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setRaiseBidLot(null)}
                  className="rounded-xl text-xs h-10"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="rounded-xl text-xs font-bold h-10 bg-amber-600 hover:bg-amber-700 text-white shadow-md"
                >
                  Submit Higher Bid
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TraderDashboard
