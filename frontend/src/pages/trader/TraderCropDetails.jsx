import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
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
  MessageSquare
} from 'lucide-react'

const DEMO_LOTS_DATABASE = {
  'LOT-KA-HSN-101': {
    _id: 'LOT-KA-HSN-101',
    cropName: 'Grade-A Fresh Hybrid Tomato',
    variety: 'Shiva Hybrid (Firm Red Skin)',
    category: 'Vegetables',
    grade: 'Grade-A Premium',
    quantity: 120,
    unit: 'Quintals',
    reservePrice: 1800,
    currentHighestBid: 2150,
    apmcBenchmark: 2380,
    instantBuyoutPrice: 2300,
    harvestDate: '26 Aug 2026',
    images: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80',
      'https://images.unsplash.com/photo-1546470427-e26264be0b11?w=800&q=80',
      'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=800&q=80'
    ],
    qualityAssay: {
      moisture: '12.4% (Standard < 14%)',
      purity: '98.8% Foreign Matter Free',
      diameter: '55mm - 65mm Uniform Caliber',
      packaging: '25kg Standard Plastic Crates',
      coldStorageTolerant: 'Yes (Up to 14 Days at 10°C)'
    },
    farmer: {
      name: 'Ramesh Gowda',
      village: 'Belur Village',
      taluk: 'Belur',
      district: 'Hassan',
      state: 'Karnataka',
      rating: 4.9,
      totalTrades: 28,
      distanceToMandi: '14 km to Hassan APMC Yard'
    },
    closingIn: '03h 42m 18s',
    bidsHistory: [
      { id: 'b1', bidder: 'Karnataka Agro Traders (You)', amount: 2150, time: '12 mins ago', isHighest: true },
      { id: 'b2', bidder: 'Mysuru Wholesale Spices', amount: 2100, time: '28 mins ago', isHighest: false },
      { id: 'b3', bidder: 'Hassan Retailers Co-op', amount: 2000, time: '1 hour ago', isHighest: false },
      { id: 'b4', bidder: 'Malnad Fresh Logistics', amount: 1900, time: '2 hours ago', isHighest: false }
    ]
  },
  'LOT-KA-MND-102': {
    _id: 'LOT-KA-MND-102',
    cropName: 'Bellary Premium Red Onion',
    variety: 'Bellary Red (Thick Pungent Bulb)',
    category: 'Vegetables',
    grade: 'Export Grade-A',
    quantity: 250,
    unit: 'Quintals',
    reservePrice: 2200,
    currentHighestBid: 2550,
    apmcBenchmark: 2750,
    instantBuyoutPrice: 2680,
    harvestDate: '24 Aug 2026',
    images: [
      'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80',
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80'
    ],
    qualityAssay: {
      moisture: '10.2% (Well Cured)',
      purity: '99.2% Single-Center Bulbs',
      diameter: '50mm - 70mm Medium-Large',
      packaging: '50kg Ventilated Jute Gunny Bags',
      coldStorageTolerant: 'Yes (Ambient Dry Shed 30 Days)'
    },
    farmer: {
      name: 'Basavaraj Patil',
      village: 'Malavalli',
      taluk: 'Malavalli',
      district: 'Mandya',
      state: 'Karnataka',
      rating: 4.8,
      totalTrades: 42,
      distanceToMandi: '8 km to Mandya APMC Yard'
    },
    closingIn: '06h 15m 40s',
    bidsHistory: [
      { id: 'b1', bidder: 'Coastal Agro Processing Corp', amount: 2550, time: '18 mins ago', isHighest: true },
      { id: 'b2', bidder: 'Karnataka Agro Traders', amount: 2480, time: '45 mins ago', isHighest: false }
    ]
  }
}

export const TraderCropDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Find lot or default to first
  const lot = DEMO_LOTS_DATABASE[id] || DEMO_LOTS_DATABASE['LOT-KA-HSN-101']
  
  const [selectedImageIdx, setSelectedImageIdx] = useState(0)
  const [bidInput, setBidInput] = useState(String(lot.currentHighestBid + 50))
  const [bidsList, setBidsList] = useState(lot.bidsHistory)
  const [currentHigh, setCurrentHigh] = useState(lot.currentHighestBid)
  const [isPlacingBid, setIsPlacingBid] = useState(false)
  const [isInspectionOpen, setIsInspectionOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Calculations
  const numericBid = Number(bidInput) || 0
  const grossLotValue = numericBid * lot.quantity
  const statutoryCess = Math.round(grossLotValue * 0.015) // 1.5% APMC cess
  const estimatedFreight = 3200
  const totalEscrowRequired = grossLotValue + statutoryCess + estimatedFreight

  const savingsPerQtl = lot.apmcBenchmark - currentHigh
  const savingsPercentage = Math.round((savingsPerQtl / lot.apmcBenchmark) * 100)

  const handleIncrement = (amount) => {
    const nextVal = Math.max(currentHigh + 10, numericBid + amount)
    setBidInput(String(nextVal))
  }

  const handlePlaceBid = (e) => {
    e?.preventDefault?.()
    if (numericBid <= currentHigh) {
      toast.error(`Your bid must exceed the current highest bid of ₹${currentHigh.toLocaleString('en-IN')}/Qtl`)
      return
    }

    setIsPlacingBid(true)
    setTimeout(() => {
      setIsPlacingBid(false)
      setCurrentHigh(numericBid)
      
      const newBidEntry = {
        id: `b-${Date.now()}`,
        bidder: user?.name || 'My Trading Entity (You)',
        amount: numericBid,
        time: 'Just now',
        isHighest: true
      }

      setBidsList([newBidEntry, ...bidsList.map((b) => ({ ...b, isHighest: false }))])
      toast.success(`Bid of ₹${numericBid.toLocaleString('en-IN')}/Qtl placed! You are the top bidder! 🎉`)
    }, 600)
  }

  const handleInstantBuyout = () => {
    toast.success(`Instant Buyout Confirmed at ₹${lot.instantBuyoutPrice.toLocaleString('en-IN')}/Qtl! Escrow locked.`)
    navigate('/trader/orders')
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Breadcrumbs & Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="rounded-xl text-xs h-9">
            <Link to="/trader/marketplace">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Marketplace
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-lg border border-amber-500/20">
              {lot._id}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-extrabold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Auction Open
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => setIsInspectionOpen(true)}
            className="rounded-xl text-xs h-9 px-3.5 font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md flex items-center gap-1.5"
          >
            <Video className="w-4 h-4" />
            <span>Live Video 🎥</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsChatOpen(true)}
            className="rounded-xl text-xs h-9 px-3.5 font-bold border-purple-500/30 text-purple-600 hover:bg-purple-500/10 flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat & Offer 💬</span>
          </Button>

          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <Clock className="w-4 h-4 text-rose-500" />
            <span>Closes in: <span className="text-rose-600 font-extrabold">{lot.closingIn}</span></span>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Photos, Quality Assay & Farmer Profile (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Photo Gallery */}
          <div className="p-4 rounded-3xl bg-card border border-border space-y-3 shadow-sm">
            <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-muted">
              <img 
                src={lot.images[selectedImageIdx]} 
                alt={lot.cropName} 
                className="w-full h-full object-cover transition-all"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-background/90 backdrop-blur text-xs font-extrabold text-foreground border border-border shadow-sm">
                {lot.grade}
              </span>
              <span className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-background/95 backdrop-blur text-xs font-bold text-foreground border border-border shadow-sm">
                Harvest Date: {lot.harvestDate}
              </span>
            </div>

            {/* Thumbnail Selectors & Triggers */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {lot.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIdx === idx ? 'border-amber-500 shadow-sm' : 'border-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChatOpen(true)}
                  className="rounded-xl text-xs h-10 border-purple-500/30 text-purple-600 hover:bg-purple-500/10 font-bold"
                >
                  <MessageSquare className="w-4 h-4 mr-1.5" /> Direct Chat
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsInspectionOpen(true)}
                  className="rounded-xl text-xs h-10 border-purple-500/30 text-purple-600 hover:bg-purple-500/10 font-bold"
                >
                  <Video className="w-4 h-4 mr-1.5" /> Live Video
                </Button>
              </div>
            </div>
          </div>

          {/* APMC Certified Quality Assay Box */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                APMC Quality Assay & Physical Specs
              </h3>
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-primary/10 text-primary px-2.5 py-0.5 rounded-md">
                Verified Lot
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                <span className="text-[11px] text-muted-foreground">Moisture Content</span>
                <p className="font-extrabold text-foreground">{lot.qualityAssay.moisture}</p>
              </div>

              <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                <span className="text-[11px] text-muted-foreground">Purity & Cleanliness</span>
                <p className="font-extrabold text-foreground">{lot.qualityAssay.purity}</p>
              </div>

              <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                <span className="text-[11px] text-muted-foreground">Fruit / Bulb Caliber</span>
                <p className="font-extrabold text-foreground">{lot.qualityAssay.diameter}</p>
              </div>

              <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                <span className="text-[11px] text-muted-foreground">Packaging & Post-Harvest</span>
                <p className="font-extrabold text-foreground">{lot.qualityAssay.packaging}</p>
              </div>
            </div>
          </div>

          {/* Farmer & Farm Gate Origin Profile */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <MapPin className="w-5 h-5 text-primary" />
              Producer & Farm-Gate Logistics Origin
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-foreground">{lot.farmer.name}</h4>
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-500" /> {lot.farmer.rating}
                  </span>
                  <span className="text-[11px] text-muted-foreground">({lot.farmer.totalTrades} Successful Trades)</span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span>{lot.farmer.village}, {lot.farmer.taluk}, {lot.farmer.district}</span>
                  <span>•</span>
                  <span className="text-primary font-semibold">{lot.farmer.distanceToMandi}</span>
                </p>
              </div>

              <div className="px-3 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold flex items-center gap-1.5 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>KYC & Land Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Bidding Engine (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Bidding Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-xl space-y-6 sticky top-24">
            
            {/* Title & Quantity */}
            <div className="space-y-1 border-b border-border pb-4">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
                {lot.category} • {lot.grade}
              </span>
              <h2 className="text-xl font-extrabold text-foreground leading-snug">
                {lot.cropName}
              </h2>
              <p className="text-xs text-muted-foreground font-semibold">
                Available Lot Volume: <span className="text-foreground font-black">{lot.quantity} {lot.unit}</span>
              </p>
            </div>

            {/* Benchmark Price Box */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Current High Offer:</span>
                <span className="text-2xl font-black text-amber-600">
                  ₹{currentHigh.toLocaleString('en-IN')} <span className="text-xs font-normal text-muted-foreground">/ Qtl</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                <span className="text-muted-foreground">APMC Mandi Modal Benchmark:</span>
                <span className="font-bold text-foreground">₹{lot.apmcBenchmark.toLocaleString('en-IN')}/Qtl</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-emerald-600 font-bold">
                <span>Current Procurement Arbitrage:</span>
                <span>Save ₹{savingsPerQtl.toLocaleString('en-IN')}/Qtl ({savingsPercentage}%)</span>
              </div>
            </div>

            {/* Interactive Bid Form */}
            <form onSubmit={handlePlaceBid} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">
                  Your New Bid Rate (₹ / Quintal):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-muted-foreground font-bold">₹</span>
                  <input
                    type="number"
                    value={bidInput}
                    onChange={(e) => setBidInput(e.target.value)}
                    min={currentHigh + 1}
                    className="w-full h-12 pl-8 pr-4 rounded-2xl bg-background border-2 border-border focus:border-amber-500 focus:outline-none font-mono text-lg font-black text-foreground"
                  />
                </div>
              </div>

              {/* Quick Increments */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleIncrement(25)}
                  className="flex-1 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-xs font-bold border border-border transition-colors"
                >
                  +₹25
                </button>
                <button
                  type="button"
                  onClick={() => handleIncrement(50)}
                  className="flex-1 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-xs font-bold border border-border transition-colors"
                >
                  +₹50
                </button>
                <button
                  type="button"
                  onClick={() => handleIncrement(100)}
                  className="flex-1 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-xs font-bold border border-border transition-colors"
                >
                  +₹100
                </button>
              </div>

              {/* Escrow Estimation Breakdown Box */}
              <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Gross Lot Value ({lot.quantity} Qtl):</span>
                  <span className="font-mono text-foreground font-semibold">₹{grossLotValue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Statutory APMC Cess (1.5%):</span>
                  <span className="font-mono text-foreground font-semibold">₹{statutoryCess.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Est. Logistics & Handling:</span>
                  <span className="font-mono text-foreground font-semibold">₹{estimatedFreight.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-foreground pt-1.5 border-t border-primary/20">
                  <span>Total Escrow Deposit:</span>
                  <span className="font-mono text-primary font-black">₹{totalEscrowRequired.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Submit Bid Button */}
              <Button
                type="submit"
                disabled={isPlacingBid}
                className="w-full rounded-2xl h-12 text-sm font-extrabold shadow-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-2"
              >
                <Gavel className="w-4 h-4" />
                <span>{isPlacingBid ? 'Locking Escrow Bid...' : `Submit Bid of ₹${numericBid.toLocaleString('en-IN')}/Qtl`}</span>
              </Button>
            </form>

            {/* Instant Buyout Separator */}
            <div className="pt-2 border-t border-border space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Bypass Auction Instantly:</span>
                <span className="font-bold text-foreground">
                  ₹{lot.instantBuyoutPrice.toLocaleString('en-IN')}/Qtl
                </span>
              </div>

              <Button
                onClick={handleInstantBuyout}
                variant="outline"
                className="w-full rounded-2xl h-11 text-xs font-bold border-2 border-primary/40 hover:bg-primary/10 text-primary flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Instant Buyout Whole Lot (₹{(lot.instantBuyoutPrice * lot.quantity).toLocaleString('en-IN')})</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Live Video Inspection Modal */}
      <LiveCropInspection
        isOpen={isInspectionOpen}
        onClose={() => setIsInspectionOpen(false)}
        crop={{
          title: lot.cropName,
          farmerName: lot.farmer.name,
          location: `${lot.farmer.village}, ${lot.farmer.district}`,
          quantity: `${lot.quantity} ${lot.unit}`,
          price: lot.currentHighestBid,
          lotId: lot._id
        }}
        onProceedToBid={() => {
          handleIncrement(50)
          toast.success('Bid pre-incremented! Submit to finalize escrow lock.')
        }}
      />

      {/* 4. Real-Time Trade Negotiation Chat Modal */}
      <TradeChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        crop={{
          title: lot.cropName,
          farmerName: lot.farmer.name,
          location: `${lot.farmer.village}, ${lot.farmer.district}`,
          quantity: `${lot.quantity} ${lot.unit}`,
          price: lot.currentHighestBid,
          lotId: lot._id
        }}
        onAcceptOffer={(rate) => {
          setBidInput(String(rate))
          toast.success(`Negotiated rate ₹${rate}/Qtl applied to your bidding input!`)
        }}
      />
    </div>
  )
}

export default TraderCropDetails
