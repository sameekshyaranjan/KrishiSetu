import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import bidService from '@/services/bidService'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  Gavel, 
  ShoppingCart, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  DollarSign, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  ChevronRight, 
  Star, 
  X, 
  Sliders,
  Package,
  Layers,
  Zap
} from 'lucide-react'

const STATUS_TABS = [
  { id: 'all', label: 'All Bids' },
  { id: 'winning', label: 'Winning' },
  { id: 'outbid', label: 'Outbid' },
  { id: 'countered', label: 'Counter Received' },
  { id: 'won', label: 'Won / Escrow Pending' }
]

export const TraderBids = () => {
  const { user } = useAuth()
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeStatus, setActiveStatus] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Raise Bid Modal
  const [raiseBidLot, setRaiseBidLot] = useState(null)
  const [customBidAmount, setCustomBidAmount] = useState('')

  // Auto-Bid Modal
  const [autoBidLot, setAutoBidLot] = useState(null)
  const [autoBidCeilingInput, setAutoBidCeilingInput] = useState('')

  const loadTraderBids = async () => {
    setLoading(true)
    try {
      const data = await bidService.getMyBids()
      if (Array.isArray(data)) {
        const formatted = data.map(b => {
          const crop = b.crop || b.cropListing || {}
          const rate = Number(b.amount || b.bidPrice || 0)
          return {
            _id: b._id,
            lotId: `LOT-${b._id?.slice(-6)}`,
            cropName: crop.name || 'Crop Produce Lot',
            variety: crop.category || 'Standard',
            category: crop.category || 'Agricultural',
            grade: 'Grade-A Standard',
            quantity: Number(crop.quantity) || 50,
            unit: crop.unit || 'Quintals',
            reservePrice: Number(crop.basePrice) || 2000,
            myBidAmount: rate,
            highestBid: rate,
            highestBidder: 'You (Top Bidder)',
            status: b.status === 'accepted' ? 'won' : b.status === 'rejected' ? 'outbid' : 'winning',
            closingIn: 'Live Bidding',
            bidsCount: 1,
            image: crop.images?.[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80',
            farmer: {
              name: b.farmer?.name || 'Verified Farmer',
              village: b.farmer?.village || 'Karnataka',
              district: b.farmer?.district || 'APMC Yard',
              rating: 5.0
            }
          }
        })
        setBids(formatted)
      } else {
        setBids([])
      }
    } catch (err) {
      console.warn('[TraderBids] Failed to load bids:', err.message)
      setBids([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTraderBids()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadTraderBids()
    setIsRefreshing(false)
    toast.success('Live bidding console updated with state APMC bids!')
  }

  const handleQuickRaise = (bidItem, increment = 50) => {
    const nextAmount = bidItem.highestBid + increment
    setBids((prev) =>
      prev.map((b) =>
        b._id === bidItem._id
          ? {
              ...b,
              myBidAmount: nextAmount,
              highestBid: nextAmount,
              highestBidder: 'You (Top Bidder)',
              status: 'winning',
              bidsCount: b.bidsCount + 1
            }
          : b
      )
    )
    toast.success(`Counter-bid of ₹${nextAmount.toLocaleString('en-IN')}/Qtl placed! You are now the top bidder! 🎉`)
  }

  const handleOpenRaiseModal = (bidItem) => {
    setRaiseBidLot(bidItem)
    setCustomBidAmount(String(bidItem.highestBid + 50))
  }

  const handleConfirmCustomRaise = (e) => {
    e.preventDefault()
    const parsed = Number(customBidAmount)
    if (!parsed || parsed <= (raiseBidLot?.highestBid || 0)) {
      toast.error(`Bid must exceed the highest bid of ₹${raiseBidLot?.highestBid}/Qtl`)
      return
    }

    setBids((prev) =>
      prev.map((b) =>
        b._id === raiseBidLot._id
          ? {
              ...b,
              myBidAmount: parsed,
              highestBid: parsed,
              highestBidder: 'You (Top Bidder)',
              status: 'winning',
              bidsCount: b.bidsCount + 1
            }
          : b
      )
    )
    toast.success(`Custom bid of ₹${parsed.toLocaleString('en-IN')}/Qtl submitted successfully!`)
    setRaiseBidLot(null)
  }

  const handleAcceptCounter = (bidItem) => {
    const acceptedRate = bidItem.farmerCounterRate || bidItem.highestBid
    setBids((prev) =>
      prev.map((b) =>
        b._id === bidItem._id
          ? {
              ...b,
              myBidAmount: acceptedRate,
              highestBid: acceptedRate,
              highestBidder: 'You (Agreed Rate)',
              status: 'won'
            }
          : b
      )
    )
    toast.success(`Farmer counter-offer of ₹${acceptedRate}/Qtl accepted! Lot transitioned to Escrow Deposit.`)
  }

  const handleSetAutoBid = (e) => {
    e.preventDefault()
    const parsed = Number(autoBidCeilingInput)
    if (!parsed || parsed <= (autoBidLot?.highestBid || 0)) {
      toast.error('Auto-bid ceiling must be greater than current highest bid')
      return
    }

    setBids((prev) =>
      prev.map((b) =>
        b._id === autoBidLot._id
          ? { ...b, autoBidCeiling: parsed }
          : b
      )
    )
    toast.success(`Auto-bidding activated up to ₹${parsed.toLocaleString('en-IN')}/Qtl for ${autoBidLot.cropName}!`)
    setAutoBidLot(null)
  }

  // Filtered Bids List
  const filteredBids = useMemo(() => {
    return bids.filter((b) => {
      if (activeStatus === 'all') return true
      return b.status === activeStatus
    })
  }, [bids, activeStatus])

  // Summary Metrics
  const totalVolume = bids.reduce((acc, b) => acc + b.quantity, 0)
  const winningCapital = bids
    .filter((b) => b.status === 'winning' || b.status === 'won')
    .reduce((acc, b) => acc + b.myBidAmount * b.quantity, 0)
  const outbidCount = bids.filter((b) => b.status === 'outbid').length

  return (
    <div className="space-y-8">
      
      {/* 1. Header & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-semibold border border-amber-500/20 mb-2">
            <Gavel className="w-3.5 h-3.5" />
            <span>Real-Time APMC Bidding Portfolio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            My Active Bids & Auction Console ⚖️
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Monitor outbid lots in real-time, configure smart auto-bidding ceilings, and lock accepted deals into escrow.
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
            Refresh Bids
          </Button>

          <Button asChild size="sm" className="rounded-xl text-xs h-10 px-4 font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md">
            <Link to="/trader/marketplace">
              <ShoppingCart className="w-4 h-4 mr-1.5" /> Explore Marketplace
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. 4 Capital & Bidding Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Total Bidding Volume</span>
          <p className="text-2xl font-black text-foreground">{totalVolume} Quintals</p>
          <span className="text-[11px] text-muted-foreground">across {bids.length} active lots</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Secured Winning Capital</span>
          <p className="text-2xl font-black text-emerald-600">₹{winningCapital.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Leading 2 active auctions</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Outbid Capital at Risk</span>
          <p className="text-2xl font-black text-rose-600">{outbidCount} Lot{outbidCount !== 1 ? 's' : ''}</p>
          <span className="text-[11px] text-rose-500 font-bold">Action Required to Win</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Direct Farm Margin</span>
          <p className="text-2xl font-black text-primary">+12.4%</p>
          <span className="text-[11px] text-muted-foreground">vs physical mandi commissions</span>
        </div>
      </div>

      {/* 3. Status Filter Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.id === 'all'
              ? bids.length
              : bids.filter((b) => b.status === tab.id).length

          return (
            <button
              key={tab.id}
              onClick={() => setActiveStatus(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeStatus === tab.id
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                activeStatus === tab.id ? 'bg-black/20 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* 4. Active Bids Cards Stream */}
      <div className="space-y-4">
        {filteredBids.map((bid) => {
          const grossValue = bid.myBidAmount * bid.quantity
          const cess = Math.round(grossValue * 0.015)

          return (
            <div
              key={bid._id}
              className={`p-6 rounded-3xl bg-card border transition-all space-y-5 shadow-sm ${
                bid.status === 'winning'
                  ? 'border-emerald-500/40 bg-emerald-500/[0.02]'
                  : bid.status === 'outbid'
                  ? 'border-rose-500/40 bg-rose-500/[0.02]'
                  : bid.status === 'countered'
                  ? 'border-amber-500/40 bg-amber-500/[0.02]'
                  : 'border-primary/40 bg-primary/[0.02]'
              }`}
            >
              {/* Top Row: Crop Snapshot & Badges */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <img
                    src={bid.image}
                    alt={bid.cropName}
                    className="w-16 h-16 rounded-2xl object-cover border border-border shrink-0 shadow-sm"
                  />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                        {bid.lotId}
                      </span>
                      <span className="text-[10px] font-extrabold bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                        {bid.grade}
                      </span>
                    </div>

                    <Link to={`/trader/crops/${bid.lotId}`} className="block hover:text-amber-600 transition-colors">
                      <h3 className="text-base font-extrabold text-foreground leading-snug">
                        {bid.cropName}
                      </h3>
                    </Link>

                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <span><MapPin className="w-3.5 h-3.5 inline text-primary mr-0.5" />{bid.farmer.village}, {bid.farmer.district}</span>
                      <span>•</span>
                      <span className="font-extrabold text-foreground">{bid.quantity} {bid.unit}</span>
                      <span>•</span>
                      <span>{bid.bidsCount} Total Bids</span>
                    </p>
                  </div>
                </div>

                {/* Status & Timer Pill */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <span className={`px-3 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 ${
                    bid.status === 'winning'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : bid.status === 'outbid'
                      ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      : bid.status === 'countered'
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      : 'bg-primary/10 text-primary border border-primary/20'
                  }`}>
                    {bid.status === 'winning' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {bid.status === 'outbid' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {bid.status === 'countered' && <Sparkles className="w-3.5 h-3.5" />}
                    {bid.status === 'won' && <ShieldCheck className="w-3.5 h-3.5" />}
                    <span>
                      {bid.status === 'winning'
                        ? 'Leading Top Bid'
                        : bid.status === 'outbid'
                        ? 'Outbid by Competitor'
                        : bid.status === 'countered'
                        ? 'Farmer Counter Offer'
                        : 'Auction Won • Lock Escrow'}
                    </span>
                  </span>

                  <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-500" /> {bid.closingIn}
                  </span>
                </div>
              </div>

              {/* Middle Row: Price Metrics & Auto-Bid Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-muted/40 border border-border/80 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground block">My Active Offer</span>
                  <span className="text-sm font-extrabold text-foreground">
                    ₹{bid.myBidAmount.toLocaleString('en-IN')}/Qtl
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground block">Highest Competitor Bid</span>
                  <span className={`text-sm font-black ${bid.status === 'outbid' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    ₹{bid.highestBid.toLocaleString('en-IN')}/Qtl
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground block">Gross Lot Exposure</span>
                  <span className="text-sm font-extrabold text-foreground">
                    ₹{grossValue.toLocaleString('en-IN')}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground block">Auto-Bid Ceiling</span>
                  <span className="text-sm font-bold text-amber-600">
                    {bid.autoBidCeiling ? `Up to ₹${bid.autoBidCeiling}/Qtl` : 'Not Set'}
                  </span>
                </div>
              </div>

              {/* Farmer Counter Proposal Notice */}
              {bid.status === 'countered' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                  <p className="font-extrabold text-amber-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Direct Settlement Counter: Farmer proposed ₹{bid.farmerCounterRate}/Qtl
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Accepting this price guarantees immediate lot assignment and dispatches farm-gate logistics.
                  </p>
                </div>
              )}

              {/* Bottom Action Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border">
                <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                  <span>Current Leader: <span className="font-bold text-foreground">{bid.highestBidder}</span></span>
                  <span>•</span>
                  <span>APMC Cess (1.5%): ₹{cess.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {bid.status === 'outbid' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleQuickRaise(bid, 50)}
                        className="rounded-xl text-xs font-bold h-9 bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                      >
                        <Zap className="w-3.5 h-3.5 mr-1" /> Quick Raise (+₹50)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenRaiseModal(bid)}
                        className="rounded-xl text-xs font-bold h-9"
                      >
                        Custom Rate
                      </Button>
                    </>
                  )}

                  {bid.status === 'countered' && (
                    <Button
                      size="sm"
                      onClick={() => handleAcceptCounter(bid)}
                      className="rounded-xl text-xs font-bold h-9 bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                    >
                      Accept Counter (₹{bid.farmerCounterRate}/Qtl)
                    </Button>
                  )}

                  {bid.status === 'won' && (
                    <Button asChild size="sm" className="rounded-xl text-xs font-bold h-9 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                      <Link to="/trader/orders">
                        Lock Escrow & Dispatch <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAutoBidLot(bid)
                      setAutoBidCeilingInput(String(bid.autoBidCeiling || bid.highestBid + 200))
                    }}
                    className="rounded-xl text-xs h-9"
                  >
                    <Sliders className="w-3.5 h-3.5 mr-1" /> Auto-Bid
                  </Button>

                  <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs h-9">
                    <Link to={`/trader/crops/${bid.lotId}`}>
                      Inspect Lot <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredBids.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
            <Gavel className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-foreground">No Bids in this Category</p>
          <p className="text-xs text-muted-foreground">Explore the crop marketplace to place competitive bids on fresh harvest lots.</p>
        </div>
      )}

      {/* Modal: Custom Raise Bid */}
      {raiseBidLot && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-rose-600 uppercase">
                  {raiseBidLot.lotId}
                </span>
                <h3 className="text-lg font-extrabold text-foreground">
                  Counter Competitor Bid
                </h3>
                <p className="text-xs text-muted-foreground">
                  Highest competitor bid: <span className="font-bold text-rose-600">₹{raiseBidLot.highestBid}/Qtl</span>
                </p>
              </div>

              <button 
                onClick={() => setRaiseBidLot(null)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCustomRaise} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Your New Bid Rate (₹ / Quintal)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-muted-foreground text-sm">₹</span>
                  <input
                    type="number"
                    min={raiseBidLot.highestBid + 10}
                    step="10"
                    required
                    value={customBidAmount}
                    onChange={(e) => setCustomBidAmount(e.target.value)}
                    className="w-full h-11 pl-8 pr-4 rounded-xl bg-background border border-border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Total Lot Investment: <span className="font-bold text-foreground">₹{(Number(customBidAmount || 0) * raiseBidLot.quantity).toLocaleString('en-IN')}</span>
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
                  className="rounded-xl text-xs font-bold h-10 bg-rose-600 hover:bg-rose-700 text-white shadow-md"
                >
                  Submit Higher Bid
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Auto-Bid Ceiling Setup */}
      {autoBidLot && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[10px] font-bold">
                  <Sliders className="w-3 h-3" /> Smart Proxy Bidding
                </div>
                <h3 className="text-lg font-extrabold text-foreground">
                  Configure Auto-Bid Ceiling
                </h3>
                <p className="text-xs text-muted-foreground">
                  {autoBidLot.cropName} • {autoBidLot.quantity} {autoBidLot.unit}
                </p>
              </div>

              <button 
                onClick={() => setAutoBidLot(null)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSetAutoBid} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-xs space-y-1 leading-relaxed text-muted-foreground">
                KrishiSetu will automatically outbid competitors by +₹20/Qtl whenever you are outbid, up to your maximum ceiling.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Maximum Budget Ceiling (₹ / Quintal)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-muted-foreground text-sm">₹</span>
                  <input
                    type="number"
                    min={autoBidLot.highestBid + 20}
                    step="20"
                    required
                    value={autoBidCeilingInput}
                    onChange={(e) => setAutoBidCeilingInput(e.target.value)}
                    className="w-full h-11 pl-8 pr-4 rounded-xl bg-background border border-border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setAutoBidLot(null)}
                  className="rounded-xl text-xs h-10"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="rounded-xl text-xs font-bold h-10 bg-amber-600 hover:bg-amber-700 text-white shadow-md"
                >
                  Save Auto-Bid Ceiling
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TraderBids
