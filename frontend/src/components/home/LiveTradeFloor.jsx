import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Building2,
  MapPin,
  BadgeCheck,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import ScrollPop from '@/components/common/ScrollPop'

// Demo lot — UI simulation grounded in actual KrishiSetu bid model fields:
// crop.name, crop.category, crop.quantity, crop.unit, crop.basePrice (reserve)
// bid.amount, bid.status (pending/countered/accepted/rejected), bid.counterAmount
// TraderBids: cropName, variety, grade, quantity, unit, reservePrice,
//   myBidAmount, highestBid, farmerCounterRate, rawStatus, farmerId, lotId
const LOT = {
  lotId: 'LOT-KA-KLR-882',
  cropName: 'Hybrid Tomatoes',
  variety: 'Arka Rakshak',
  grade: 'Grade A',
  quantity: 40,
  unit: 'Quintals',
  origin: 'Hosakote, Kolar District',
  harvestedAt: 'Today, 05:30 AM',
  reservePrice: 2100,
  modalBenchmark: 2200, // Agmarknet live modal
  bidsOpen: true,
}

// Demo bids — reflecting real FarmerBids.jsx statuses: pending, countered, accepted
// Trader identity shown as per actual TraderBids role/license fields
const BIDS = [
  {
    id: 'b1',
    traderName: 'Bengaluru Fresh Retails',
    license: 'APMC #KA-BLR-491',
    city: 'Bengaluru',
    amount: 2240,
    status: 'pending',     // farmer has not responded yet
    isTop: true,
    aboveModal: true,
  },
  {
    id: 'b2',
    traderName: 'Mandya Agro Exports',
    license: 'APMC #KA-MND-183',
    city: 'Mandya',
    amount: 2210,
    status: 'pending',
    isTop: false,
    aboveModal: true,
  },
  {
    id: 'b3',
    traderName: 'Hassan Wholesale Hub',
    license: 'APMC #KA-HSN-055',
    city: 'Hassan',
    amount: 2160,
    status: 'rejected',    // farmer declined
    isTop: false,
    aboveModal: false,
  },
]

const STATUS_META = {
  pending: { label: 'Awaiting response', color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400' },
  countered: { label: 'Counter sent', color: 'text-sky-600', bg: 'bg-sky-500/10 border-sky-500/20', dot: 'bg-sky-400' },
  accepted: { label: 'Accepted', color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
  rejected: { label: 'Declined', color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20', dot: 'bg-rose-400' },
}

export const LiveTradeFloor = () => {
  const [bids, setBids] = useState(BIDS)
  const [selectedBid, setSelectedBid] = useState(BIDS[0])
  const [mode, setMode] = useState('accept') // 'accept' | 'counter'
  const [counterValue, setCounterValue] = useState(2260)
  const [notice, setNotice] = useState(null)
  const [view, setView] = useState('farmer') // 'farmer' | 'trader'

  const topBid = bids.filter(b => b.status !== 'rejected').sort((a, b) => b.amount - a.amount)[0]

  const handleAction = () => {
    if (mode === 'accept') {
      setBids(prev => prev.map(b =>
        b.id === selectedBid.id ? { ...b, status: 'accepted' } : b.status === 'pending' ? { ...b, status: 'rejected' } : b
      ))
      setNotice({ type: 'success', text: `Bid accepted · ₹${selectedBid.amount.toLocaleString('en-IN')}/Qtl locked into escrow` })
    } else {
      setBids(prev => prev.map(b =>
        b.id === selectedBid.id ? { ...b, status: 'countered', counterAmount: counterValue } : b
      ))
      setNotice({ type: 'info', text: `Counter-offer of ₹${counterValue.toLocaleString('en-IN')}/Qtl sent to ${selectedBid.traderName}` })
    }
    setTimeout(() => setNotice(null), 3500)
  }

  const reset = () => {
    setBids(BIDS)
    setSelectedBid(BIDS[0])
    setMode('accept')
    setNotice(null)
  }

  return (
    <section id="trade-floor" className="border-y border-border bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">

        {/* Section header */}
        <div className="grid gap-4 border-b border-border pb-8 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              Live Trade Floor · Interactive Demo
            </p>
            <h2 className="mt-3 font-display text-4xl leading-none sm:text-5xl">
              Bidding that works<br />for both sides.
            </h2>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <p className="text-sm leading-7 text-muted-foreground max-w-sm lg:text-right">
              Farmers accept or counter bids while seeing every offer against the live Agmarknet modal. Traders bid knowing the reservation floor.
            </p>
            {/* View toggle */}
            <div className="flex items-center gap-1 rounded-sm border border-border bg-muted/40 p-1 w-fit">
              <button
                onClick={() => setView('farmer')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                  view === 'farmer' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Farmer view
              </button>
              <button
                onClick={() => setView('trader')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                  view === 'trader' ? 'bg-trader text-trader-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Trader view
              </button>
            </div>
          </div>
        </div>

        {/* Main console */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">

          {/* LEFT — lot info + bid list */}
          <div className="space-y-4">
            {/* Lot header */}
            <div className="border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                      Bidding live · Demo lot
                    </span>
                  </div>
                  <h3 className="font-display text-2xl">{LOT.cropName}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {LOT.variety} · {LOT.grade} · {LOT.quantity} {LOT.unit}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase text-primary">
                  Verified lot
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
                {[
                  ['Origin', LOT.origin],
                  ['Harvested', LOT.harvestedAt],
                  ['Reserve floor', `₹${LOT.reservePrice.toLocaleString('en-IN')}/Qtl`],
                  ['Agmarknet modal', `₹${LOT.modalBenchmark.toLocaleString('en-IN')}/Qtl`],
                ].map(([label, value]) => (
                  <div key={label} className="bg-card px-3 py-3">
                    <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p>
                    <p className="mt-1 text-xs font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bid list — matches FarmerBids.jsx bid card layout */}
            <div className="border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-xs font-bold">
                  {bids.filter(b => b.status !== 'rejected').length} active bids
                </span>
                <button onClick={reset} className="text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
                  Reset demo ↺
                </button>
              </div>

              <div className="divide-y divide-border">
                {bids.map((bid, idx) => {
                  const meta = STATUS_META[bid.status]
                  const isSelected = selectedBid?.id === bid.id
                  const pctAboveFloor = Math.round(((bid.amount - LOT.reservePrice) / LOT.reservePrice) * 100)

                  return (
                    <ScrollPop key={bid.id} delay={idx * 80}>
                      <button
                        onClick={() => bid.status !== 'rejected' && setSelectedBid(bid)}
                        className={`w-full text-left px-5 py-4 transition-colors ${
                          isSelected ? 'bg-primary/5' : bid.status === 'rejected' ? 'opacity-45' : 'hover:bg-muted/40'
                        } ${bid.status !== 'rejected' ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              {bid.isTop && (
                                <span className="text-[9px] font-bold uppercase text-primary bg-primary/10 rounded px-1.5 py-0.5">
                                  Top bid
                                </span>
                              )}
                              <span className="text-sm font-bold text-foreground truncate">{bid.traderName}</span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                              <Building2 className="size-3" />
                              <span className="font-mono">{bid.license}</span>
                              <MapPin className="size-3 ml-1" />
                              <span>{bid.city}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`font-display text-xl ${bid.isTop ? 'text-primary' : 'text-foreground'}`}>
                              ₹{bid.amount.toLocaleString('en-IN')}
                            </p>
                            <p className="text-[10px] text-muted-foreground">/Qtl</p>
                          </div>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-bold ${meta.bg} ${meta.color}`}>
                            <span className={`size-1.5 rounded-full ${meta.dot}`} />
                            {bid.status === 'countered' && bid.counterAmount
                              ? `Counter: ₹${bid.counterAmount.toLocaleString('en-IN')}`
                              : meta.label}
                          </span>
                          {bid.aboveModal && bid.status !== 'rejected' && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                              <TrendingUp className="size-3" />
                              +{pctAboveFloor}% above floor
                            </span>
                          )}
                        </div>
                      </button>
                    </ScrollPop>
                  )
                })}
              </div>
            </div>
          </div>

          {/* RIGHT — action panel (Farmer view) / bid panel (Trader view) */}
          <div className="space-y-4">
            {view === 'farmer' ? (
              <>
                {/* Price comparison */}
                <div className="border border-border bg-card p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
                    Price comparison
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: 'Your reserve floor', value: LOT.reservePrice, color: 'text-muted-foreground' },
                      { label: 'Agmarknet modal', value: LOT.modalBenchmark, color: 'text-foreground' },
                      { label: 'Selected bid', value: selectedBid?.amount || 0, color: 'text-primary font-bold' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <span className={`font-display text-lg ${color}`}>
                          ₹{value.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                  {selectedBid && (
                    <div className="mt-3 border-t border-border pt-3 flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">Gross trade value</span>
                      <span className="text-sm font-bold text-foreground">
                        ₹{(selectedBid.amount * LOT.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Accept / Counter toggle — matches FarmerBids.jsx logic */}
                <div className="border border-border bg-card p-5">
                  <div className="flex items-center gap-1 rounded-sm border border-border bg-muted/40 p-1 mb-5">
                    <button
                      onClick={() => setMode('accept')}
                      className={`flex-1 py-2 text-xs font-semibold rounded-sm transition-colors ${
                        mode === 'accept' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Accept bid
                    </button>
                    <button
                      onClick={() => setMode('counter')}
                      className={`flex-1 py-2 text-xs font-semibold rounded-sm transition-colors ${
                        mode === 'counter' ? 'bg-trader text-trader-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Send counter
                    </button>
                  </div>

                  {mode === 'accept' ? (
                    <div className="border-l-2 border-primary pl-4 mb-5">
                      <p className="text-sm font-semibold">
                        Accept ₹{selectedBid?.amount.toLocaleString('en-IN')}/Qtl
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Funds will be locked into escrow before truck dispatch.
                      </p>
                    </div>
                  ) : (
                    <div className="mb-5">
                      <label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">
                        Your counter / Quintal
                      </label>
                      <div className="mt-2 flex items-center border-b-2 border-primary pb-2">
                        <span className="font-display text-3xl text-foreground">₹</span>
                        <input
                          type="number"
                          value={counterValue}
                          min={selectedBid?.amount ? selectedBid.amount + 10 : 2250}
                          step={10}
                          onChange={(e) => setCounterValue(Number(e.target.value))}
                          className="min-w-0 flex-1 bg-transparent px-2 font-display text-3xl outline-none"
                        />
                      </div>
                      <div className="mt-2 flex gap-2">
                        {[2260, 2280, 2300].map((v) => (
                          <button
                            key={v}
                            onClick={() => setCounterValue(v)}
                            className={`rounded-sm border px-2.5 py-1 text-xs font-semibold transition-colors ${
                              counterValue === v
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border hover:border-primary/40'
                            }`}
                          >
                            ₹{v}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant={mode === 'accept' ? 'farmer' : 'trader'}
                    size="xl"
                    className="w-full"
                    onClick={handleAction}
                    disabled={!selectedBid || selectedBid.status !== 'pending'}
                  >
                    {mode === 'accept' ? 'Accept & lock escrow' : 'Send counter-offer'}
                    <ArrowRight />
                  </Button>

                  <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                    <ShieldCheck className="size-3.5" />
                    No funds move before both parties confirm
                  </p>
                </div>
              </>
            ) : (
              /* TRADER VIEW — mirrors TraderBids.jsx bid card */
              <div className="border border-border bg-card">
                <div className="border-b border-border px-5 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-trader">
                    Trader procurement view
                  </p>
                  <h4 className="mt-1 font-display text-2xl">{LOT.cropName}</h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {LOT.quantity} {LOT.unit} · {LOT.grade} · {LOT.origin}
                  </p>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-sm border border-border bg-muted/30 p-3">
                      <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Reserve floor</p>
                      <p className="mt-1 font-display text-xl">₹{LOT.reservePrice.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="rounded-sm border border-border bg-muted/30 p-3">
                      <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Current top bid</p>
                      <p className="mt-1 font-display text-xl text-trader">₹{(topBid?.amount || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  {/* Price chart mock */}
                  <div>
                    <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Bid progression
                    </p>
                    <svg viewBox="0 0 300 60" className="w-full h-14 text-trader" role="img" aria-label="Bid price trend">
                      <path d="M0 50 C20 48 35 40 60 42 S100 46 130 34 S175 36 200 24 S250 26 300 10"
                        fill="none" stroke="currentColor" strokeWidth="2.5" />
                      <path d="M0 56 H300" stroke="currentColor" strokeOpacity=".12" />
                      <circle cx="300" cy="10" r="4" fill="currentColor" />
                    </svg>
                    <div className="flex justify-between text-[9px] text-muted-foreground uppercase tracking-wide">
                      <span>Opening ₹2,120</span>
                      <span>3 bidders active</span>
                    </div>
                  </div>

                  {/* Verified badge */}
                  <div className="flex items-center gap-2 rounded-sm border border-primary/20 bg-primary/5 px-3 py-2.5">
                    <BadgeCheck className="size-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Farmer identity verified</p>
                      <p className="text-[10px] text-muted-foreground">GST + Aadhaar + land records linked</p>
                    </div>
                  </div>

                  <Button variant="trader" size="xl" className="w-full" asChild>
                    <Link to="/register/trader">
                      Browse all open lots <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Notice */}
            {notice && (
              <div
                className={`flex items-center gap-2 rounded-sm border px-4 py-3 text-xs font-semibold ${
                  notice.type === 'success'
                    ? 'border-primary/20 bg-primary/10 text-primary'
                    : 'border-trader/20 bg-trader/10 text-amber-700'
                }`}
                role="status"
              >
                {notice.type === 'success' ? (
                  <CheckCircle2 className="size-4 shrink-0" />
                ) : (
                  <Zap className="size-4 shrink-0" />
                )}
                {notice.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default LiveTradeFloor
