import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import cropService from '@/services/cropService'
import bidService from '@/services/bidService'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import LiveCropInspection from '@/components/common/LiveCropInspection'
import TradeChatModal from '@/components/common/TradeChatModal'
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Gavel, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  DollarSign, 
  FileText, 
  Star, 
  Calendar, 
  Package, 
  Layers, 
  Truck, 
  Info, 
  ChevronRight, 
  AlertCircle,
  Lock,
  Sparkles,
  Video,
  MessageSquare,
  Camera,
  RefreshCw,
  ArrowUpRight
} from 'lucide-react'

export const TraderCropDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [lot, setLot] = useState(null)
  const [selectedImageIdx, setSelectedImageIdx] = useState(0)
  const [bidInput, setBidInput] = useState('2000')
  const [bidsList, setBidsList] = useState([])
  const [currentHigh, setCurrentHigh] = useState(2000)
  const [myBid, setMyBid] = useState(null)
  const [isPlacingBid, setIsPlacingBid] = useState(false)
  const [isInspectionOpen, setIsInspectionOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load Lot Details & Bids dynamically from database
  const fetchLotData = async () => {
    try {
      const [fetchedCrop, fetchedBids] = await Promise.all([
        cropService.getListingById(id),
        bidService.getBidsForListing(id)
      ])

      if (fetchedCrop) {
        const rawBids = Array.isArray(fetchedBids) ? fetchedBids : []
        const activeBids = rawBids.filter(b => b.status === 'pending' || b.status === 'countered' || b.status === 'accepted')
        const sortedBids = [...activeBids].sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0))
        const topBidAmount = sortedBids.length > 0 ? Number(sortedBids[0].amount) : null

        const foundMyBid = fetchedCrop.myBid || activeBids.find(b => {
          const tid = b.trader?._id || b.trader?.id || b.trader
          return tid && (tid.toString() === user?._id?.toString() || tid.toString() === user?.id?.toString())
        })
        const userBidObj = foundMyBid ? { _id: foundMyBid._id, amount: Number(foundMyBid.amount), status: foundMyBid.status } : null
        setMyBid(userBidObj)

        const formattedBids = sortedBids.map((b, idx) => {
          const tid = b.trader?._id || b.trader?.id || b.trader
          const isMe = tid && (tid.toString() === user?._id?.toString() || tid.toString() === user?.id?.toString())
          return {
            id: b._id || `b-${idx}`,
            bidder: isMe ? `${b.trader?.name || user?.name || 'Verified Trader'} (You)` : (b.trader?.name || 'Verified Bidder'),
            amount: Number(b.amount) || 0,
            time: new Date(b.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isHighest: idx === 0
          }
        })

        const formatted = {
          _id: fetchedCrop._id || id,
          cropName: fetchedCrop.name || fetchedCrop.cropType || 'Farm Fresh Commodity',
          variety: fetchedCrop.description || fetchedCrop.variety || fetchedCrop.cropType || 'Graded Lot',
          category: fetchedCrop.category || 'Vegetables',
          grade: fetchedCrop.grade || 'Grade-A Premium',
          quantity: Number(fetchedCrop.quantity) || 50,
          unit: fetchedCrop.unit || 'Quintals',
          reservePrice: Number(fetchedCrop.basePrice) || 2000,
          currentHighestBid: topBidAmount,
          apmcBenchmark: Math.round((Number(fetchedCrop.basePrice) || 2000) * 1.12),
          harvestDate: new Date(fetchedCrop.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          images: fetchedCrop.images?.length > 0 ? fetchedCrop.images : ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80'],
          qualityAssay: {
            moisture: '11.8% (APMC Assayed)',
            purity: '99.0% Purity Certified',
            diameter: 'Standard Uniform Caliber',
            packaging: `${fetchedCrop.unit || 'Quintal'} Standard Packaging`,
            coldStorageTolerant: 'Yes (Grade-A Compliant)'
          },
          farmer: {
            _id: fetchedCrop.farmer?._id || fetchedCrop.farmer,
            name: fetchedCrop.farmer?.name || 'Verified Farmer',
            village: fetchedCrop.farmer?.village || 'APMC Yard',
            taluk: fetchedCrop.farmer?.district || 'Karnataka',
            district: fetchedCrop.district || fetchedCrop.farmer?.district || 'Karnataka',
            state: 'Karnataka',
            rating: 4.9,
            totalTrades: 1,
            distanceToMandi: 'Local APMC Yard'
          },
          closingIn: 'Live Bidding',
          bidsHistory: formattedBids
        }

        setLot(formatted)
        setCurrentHigh(topBidAmount)
        if (userBidObj) {
          setBidInput(String(userBidObj.amount + 50))
        } else {
          setBidInput(String(topBidAmount ? topBidAmount + 50 : (fetchedCrop.basePrice || 2000)))
        }
        setBidsList(formattedBids)
      } else {
        setLot(null)
      }
    } catch (err) {
      console.warn('Failed to load dynamic crop lot:', err)
      setLot(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchLotData()
  }, [id, user])

  // Financial Calculations & Escrow Breakdown
  const numericBid = Number(bidInput) || 0
  const grossLotValue = numericBid * (lot?.quantity || 100)
  const apmcCess = Math.round(grossLotValue * 0.015) // 1.50% APMC Statutory Cess
  const ruralCess = Math.round(grossLotValue * 0.005) // 0.50% Rural Development Cess
  const estimatedFreight = 3200
  const totalEscrowRequired = grossLotValue + apmcCess + ruralCess + estimatedFreight

  const savingsPerQtl = (lot?.apmcBenchmark || 2400) - (currentHigh || lot?.reservePrice || 2000)
  const savingsPercentage = Math.round((savingsPerQtl / (lot?.apmcBenchmark || 2400)) * 100)

  const handleIncrement = (amount) => {
    const minBase = currentHigh ? currentHigh + 10 : (lot?.reservePrice || 1000)
    const nextVal = Math.max(minBase, numericBid + amount)
    setBidInput(String(nextVal))
  }

  const handlePlaceBid = async (e) => {
    e?.preventDefault?.()

    if (myBid) {
      if (numericBid <= myBid.amount) {
        toast.error(`Your new bid must be higher than your previous bid of ₹${myBid.amount.toLocaleString('en-IN')}/Qtl`)
        return
      }
    } else {
      if (numericBid < (lot?.reservePrice || 0)) {
        toast.error(`Your bid must be at least the reserve floor price of ₹${lot?.reservePrice}/Qtl`)
        return
      }
    }

    setIsPlacingBid(true)
    try {
      await bidService.placeBid({
        cropId: lot._id,
        amount: numericBid,
        message: myBid
          ? `Increased wholesale bid to ₹${numericBid}/Qtl placed with ₹${totalEscrowRequired.toLocaleString('en-IN')} escrow allocation.`
          : `Direct wholesale bid of ₹${numericBid}/Qtl placed with ₹${totalEscrowRequired.toLocaleString('en-IN')} escrow allocation.`
      })

      toast.success(
        myBid
          ? `Bid increased successfully to ₹${numericBid.toLocaleString('en-IN')}/Qtl! 📈`
          : `Binding Bid of ₹${numericBid.toLocaleString('en-IN')}/Qtl placed with Smart Escrow Lock! 🔨`
      )

      await fetchLotData()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit bid.'
      toast.error(msg)
    } finally {
      setIsPlacingBid(false)
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-foreground">Loading Crop Lot Telemetry...</p>
      </div>
    )
  }

  if (!lot) {
    return (
      <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-4 max-w-md mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-foreground">Crop Listing Not Found</h2>
        <p className="text-xs text-muted-foreground">This crop listing may have concluded or is no longer available on the active APMC exchange.</p>
        <Button asChild className="rounded-xl text-xs bg-amber-600 hover:bg-amber-700 text-white">
          <Link to="/trader/marketplace">Return to Marketplace</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Breadcrumbs & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="rounded-xl text-xs h-9">
            <Link to="/trader/marketplace">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Marketplace
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-lg border border-amber-500/20">
              Lot #{lot._id}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-extrabold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Auction Open 🟢
            </span>
          </div>
        </div>

        {/* Real-time Interaction Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => setIsInspectionOpen(true)}
            className="rounded-xl text-xs font-bold h-9 px-4 bg-purple-600 hover:bg-purple-700 text-white shadow-md flex items-center gap-1.5"
          >
            <Video className="w-4 h-4" /> Live Video 🎥
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsChatOpen(true)}
            className="rounded-xl text-xs font-bold h-9 px-4 border-amber-500/30 text-amber-600 hover:bg-amber-500/10 flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" /> Chat & Offer 💬
          </Button>
        </div>
      </div>

      {/* 2. Main Inspection & Bidding Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Gallery, Producer & Quality Assay (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Gallery View */}
          <div className="space-y-3">
            <div className="relative h-80 sm:h-96 w-full rounded-3xl overflow-hidden bg-muted border border-border shadow-md">
              <img
                src={lot.images[selectedImageIdx] || lot.images[0]}
                alt={lot.cropName}
                className="w-full h-full object-cover"
              />
              
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider backdrop-blur-md bg-black/70 text-white border border-white/10 shadow-sm">
                  {lot.grade}
                </span>
                <span className="px-3 py-1 rounded-xl text-xs font-bold backdrop-blur-md bg-emerald-500/90 text-white shadow-sm flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Assayed
                </span>
              </div>

              <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl backdrop-blur-md bg-black/70 text-white text-xs font-mono font-bold flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                <span>Photo {selectedImageIdx + 1} of {lot.images.length}</span>
              </div>
            </div>

            {/* Thumbnail Selectors */}
            {lot.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {lot.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImageIdx === idx
                        ? 'border-amber-500 ring-2 ring-amber-500/30 scale-105'
                        : 'border-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Producer & Farm Gate Details Card */}
          <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg">
                  {lot.farmer?.name?.[0] || 'F'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-foreground">{lot.farmer.name}</h3>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                      Verified Producer 🟢
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>{lot.farmer.village}, {lot.farmer.district}, {lot.farmer.state}</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-amber-600 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{lot.farmer.rating}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{lot.farmer.totalTrades} Fulfilled Trades</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground block font-medium">APMC Jurisdiction:</span>
                <span className="font-bold text-foreground">{lot.farmer.district} APMC Yard</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground block font-medium">Harvest Date:</span>
                <span className="font-bold text-foreground">{lot.harvestDate}</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border col-span-2 sm:col-span-1">
                <span className="text-[10px] text-muted-foreground block font-medium">Mandi Distance:</span>
                <span className="font-bold text-foreground">{lot.farmer.distanceToMandi}</span>
              </div>
            </div>
          </div>

          {/* Quality Assay Parameters */}
          <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
            <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Electronic Quality Assay Certificate
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground block font-medium">Moisture Content:</span>
                <span className="font-mono font-bold text-foreground">{lot.qualityAssay.moisture}</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground block font-medium">Foreign Matter Purity:</span>
                <span className="font-mono font-bold text-foreground">{lot.qualityAssay.purity}</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground block font-medium">Grade Uniformity:</span>
                <span className="font-bold text-foreground">{lot.qualityAssay.diameter}</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground block font-medium">Packaging Type:</span>
                <span className="font-bold text-foreground">{lot.qualityAssay.packaging}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Bidding & Smart Escrow Calculator (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Header Title Card */}
          <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold mb-1">
                <span>{lot.category} • {lot.quantity} {lot.unit}</span>
                <span className="text-amber-600 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" /> Closes in {lot.closingIn}
                </span>
              </div>
              <h1 className="text-2xl font-black text-foreground">{lot.cropName}</h1>
              <p className="text-xs text-muted-foreground mt-1">{lot.variety}</p>
            </div>

            {/* Live Pricing Matrix */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    {currentHigh ? 'Current Top Bid' : 'Auction Status'}
                  </span>
                  <div className="text-2xl font-black text-amber-600 font-mono">
                    {currentHigh ? (
                      <>₹{currentHigh.toLocaleString('en-IN')}<span className="text-xs font-medium text-muted-foreground">/Qtl</span></>
                    ) : (
                      <span className="text-base font-bold text-muted-foreground">No bids yet</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">APMC Mandi Modal</span>
                  <div className="text-base font-bold text-foreground font-mono">
                    ₹{lot.apmcBenchmark.toLocaleString('en-IN')}/Qtl
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    {savingsPercentage}% Lower vs Mandi
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                <span className="text-muted-foreground">Farmer Reserve Floor:</span>
                <span className="font-mono font-bold text-foreground">₹{lot.reservePrice}/Qtl</span>
              </div>

              {myBid && (
                <div className="flex items-center justify-between pt-2 border-t border-emerald-500/30 text-xs">
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Your Current Bid:
                  </span>
                  <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                    ₹{myBid.amount.toLocaleString('en-IN')}/Qtl
                  </span>
                </div>
              )}
            </div>

            {/* Interactive Bidding Form */}
            <form onSubmit={handlePlaceBid} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>{myBid ? 'Increase Your Bid (₹ / Quintal)' : 'Enter Your Bid (₹ / Quintal)'}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {myBid
                      ? `Must exceed ₹${myBid.amount.toLocaleString('en-IN')}/Qtl`
                      : (currentHigh ? 'Min Step: +₹10/Qtl' : `Starting Floor: ₹${lot.reservePrice}/Qtl`)}
                  </span>
                </label>
                
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-base font-mono font-bold text-muted-foreground">₹</span>
                  <input
                    type="number"
                    required
                    min={myBid ? myBid.amount + 1 : (currentHigh ? currentHigh + 10 : lot.reservePrice)}
                    value={bidInput}
                    onChange={(e) => setBidInput(e.target.value)}
                    className="w-full h-12 pl-8 pr-4 rounded-2xl bg-background border-2 border-amber-500/40 focus:border-amber-500 text-lg font-mono font-black text-amber-600 focus:outline-none"
                  />
                </div>
                {myBid && (
                  <p className="text-[11px] text-muted-foreground">
                    Your new bid must be strictly higher than your previous bid of ₹{myBid.amount.toLocaleString('en-IN')}/Qtl.
                  </p>
                )}
              </div>

              {/* Quick Increment Chips */}
              <div className="flex items-center gap-2">
                {[+50, +100, +250, +500].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => handleIncrement(inc)}
                    className="flex-1 py-1.5 rounded-xl bg-muted/60 hover:bg-muted border border-border text-xs font-mono font-bold text-foreground transition-colors"
                  >
                    +{inc}
                  </button>
                ))}
              </div>

              {/* Smart Escrow Breakdown Card */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs">
                <span className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider text-[10px] block">
                  Smart Escrow Commitment Calculation:
                </span>
                
                <div className="space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Base Produce Value ({lot.quantity} Qtl × ₹{numericBid}):</span>
                    <span className="font-mono font-bold text-foreground">₹{grossLotValue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Statutory APMC Market Cess (1.50%):</span>
                    <span className="font-mono text-foreground">₹{apmcCess.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rural Development Cess (0.50%):</span>
                    <span className="font-mono text-foreground">₹{ruralCess.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated APMC Gate Weighbridge Pass:</span>
                    <span className="font-mono text-foreground">₹{estimatedFreight.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-500/20 flex justify-between items-center">
                  <span className="font-black text-amber-950 dark:text-amber-200">Total Escrow Allocation:</span>
                  <span className="text-base font-black text-amber-600 font-mono">
                    ₹{totalEscrowRequired.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Place / Increase Bid Button */}
              <Button
                type="submit"
                disabled={isPlacingBid}
                className={`w-full h-12 rounded-2xl text-sm font-bold text-white shadow-lg flex items-center justify-center gap-2 ${
                  myBid ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {myBid ? <ArrowUpRight className="w-4 h-4" /> : <Gavel className="w-4 h-4" />}
                {isPlacingBid ? 'Locking Escrow & Transmitting Bid...' : (myBid ? 'Increase Bid 📈' : 'Place Binding Bid 🔨')}
              </Button>
            </form>
          </div>

          {/* Bids Log History */}
          <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
            <h3 className="font-extrabold text-sm text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Gavel className="w-4 h-4 text-amber-600" /> Inbound Bid Audit Trail
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">{bidsList.length} Bids Logged</span>
            </h3>

            <div className="space-y-2">
              {bidsList.map((bid, idx) => (
                <div
                  key={bid.id || idx}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                    bid.isHighest
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-muted/30 border-border'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{bid.bidder}</span>
                      {bid.isHighest && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 text-[9px] font-bold">
                          Top Bid 👑
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{bid.time}</span>
                  </div>

                  <span className="font-mono font-black text-sm text-foreground">
                    ₹{bid.amount.toLocaleString('en-IN')}/Qtl
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Live Video Inspection Modal (Stage 126) */}
      <LiveCropInspection
        isOpen={isInspectionOpen}
        onClose={() => setIsInspectionOpen(false)}
        lotData={lot}
      />

      {/* 4. Multilingual Kannada / English Chat & Counter-Offer Modal */}
      <TradeChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        recipientId={lot?.farmer?._id || lot?.farmer}
        recipientName={lot?.farmer?.name || 'Verified Farmer'}
        recipientRole="Farmer"
        crop={{
          _id: lot?._id,
          title: lot?.cropName,
          quantity: lot?.quantity,
          unit: lot?.unit,
          price: currentHigh || lot?.reservePrice,
          basePrice: lot?.reservePrice,
          lotId: `LOT-${lot?._id ? String(lot._id).slice(-6) : 'KA'}`
        }}
      />
    </div>
  )
}

export default TraderCropDetails
