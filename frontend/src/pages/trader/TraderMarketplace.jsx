import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import cropService from '@/services/cropService'
import bidService from '@/services/bidService'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { fieldClass, LISTING_GRID, lotCardClass, lotImageWrapClass } from '@/components/common/listingStyles'
import {
  SelectField,
  SearchInput,
  SegmentedTabs,
  SummaryStrip,
  Fact,
  FactRow,
  PhotoPill,
  FormLabel,
  ResultsMeta,
  ListingCardSkeleton
} from '@/components/common/ListingKit'
import {
  FALLBACK_IMAGE,
  handleImageError,
  formatINR,
  formatINRCompact,
  formatDate,
  formatQuantity,
  unitLabel,
  categoryLabel
} from '@/utils/listingFormat'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  ShoppingCart,
  MapPin,
  Gavel,
  ArrowUpRight,
  ArrowRight,
  RefreshCw,
  Wallet,
  X,
  Camera,
  Loader2,
  SearchX,
  ShieldCheck
} from 'lucide-react'

import { KARNATAKA_DISTRICTS } from '@/constants/locations'

const CATEGORY_TABS = [
  { id: 'all', label: 'All' },
  { id: 'vegetables', label: 'Vegetables' },
  { id: 'grains', label: 'Grains' },
  { id: 'spices', label: 'Spices' }
]

const DISTRICT_OPTIONS = ['All Districts', ...KARNATAKA_DISTRICTS]

// The API already returns lots newest-first, so 'newest' keeps that order
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'priceLow', label: 'Reserve: low to high' },
  { value: 'priceHigh', label: 'Reserve: high to low' },
  { value: 'highestVolume', label: 'Largest quantity' },
  { value: 'fewestBids', label: 'Fewest bids' }
]

const SORTERS = {
  newest: () => 0,
  priceLow: (a, b) => (a.reservePrice || 0) - (b.reservePrice || 0),
  priceHigh: (a, b) => (b.reservePrice || 0) - (a.reservePrice || 0),
  highestVolume: (a, b) => (b.quantity || 0) - (a.quantity || 0),
  fewestBids: (a, b) => (a.bidsCount || 0) - (b.bidsCount || 0)
}

const BID_INCREMENTS = [50, 100, 500]

// Where the trader stands on a lot, derived from the API's myBid + currentHighestBid
const getBidPosition = (lot) => {
  if (!lot.myBid) return null
  if (lot.myBid.status === 'countered') return 'countered'
  return Number(lot.myBid.amount) >= (Number(lot.currentHighestBid) || 0) ? 'leading' : 'outbid'
}

const BID_POSITION_META = {
  leading: { pill: "You're leading", dot: 'bg-emerald-500', chip: 'Leading', chipClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
  outbid: { pill: 'Outbid', dot: 'bg-rose-500', chip: 'Outbid', chipClass: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' },
  countered: { pill: 'Farmer countered', dot: 'bg-amber-500', chip: 'Countered', chipClass: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' }
}

const traderPrimaryClass = 'bg-amber-600 text-white shadow-sm hover:bg-amber-700'

// ---------------------------------------------------------------------------
// Lot card
// ---------------------------------------------------------------------------

const MarketLotCard = ({ lot, onBid }) => {
  const unit = unitLabel(lot.unit)
  const totalPhotos = lot.images?.length || 0
  const bidsCount = lot.bidsCount || 0
  const highest = bidsCount > 0 ? Number(lot.currentHighestBid) || 0 : 0
  const position = getBidPosition(lot)
  const positionMeta = position ? BID_POSITION_META[position] : null
  const lotValue = (Number(lot.quantity) || 0) * Math.max(highest, Number(lot.reservePrice) || 0)
  const listedOn = formatDate(lot.listedAt)
  const needsAction = !lot.myBid || position === 'outbid'

  return (
    <article className={lotCardClass(false)}>
      {/* Image */}
      <div className={lotImageWrapClass}>
        <img
          src={lot.image || FALLBACK_IMAGE}
          alt={lot.cropName}
          loading="lazy"
          onError={handleImageError}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
        />
        {positionMeta ? (
          <PhotoPill dot={positionMeta.dot}>{positionMeta.pill}</PhotoPill>
        ) : (
          <PhotoPill dot="bg-emerald-500">Open for bids</PhotoPill>
        )}
        {totalPhotos > 1 && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white tabular-nums">
            <Camera className="h-3 w-3" />
            {totalPhotos}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col p-4">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-500">
            {categoryLabel(lot.category)}
            {lot.cropType && lot.cropType !== lot.cropName && (
              <span className="text-muted-foreground"> · {lot.cropType}</span>
            )}
          </p>
          <h3 className="mt-1 truncate text-base font-semibold leading-snug text-foreground" title={lot.cropName}>
            {lot.cropName}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{lot.farmer.district}</span>
            {listedOn && (
              <>
                <span aria-hidden="true" className="px-0.5">·</span>
                <span className="shrink-0">Listed {listedOn}</span>
              </>
            )}
          </p>
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
              {(lot.farmer.name || '?')[0].toUpperCase()}
            </span>
            <span className="truncate">
              Sold by <span className="font-medium text-foreground">{lot.farmer.name}</span>
            </span>
          </p>

          {lot.description && (
            <p className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
              {lot.description}
            </p>
          )}

          <div className="mt-auto pt-4">
            <FactRow>
              <Fact
                label="Quantity"
                value={(Number(lot.quantity) || 0).toLocaleString('en-IN')}
                sub={Number(lot.quantity) === 1 ? unit.singular : unit.plural}
              />
              <Fact label="Reserve" value={formatINR(lot.reservePrice)} sub={`per ${unit.singular}`} />
              <Fact
                label="Highest bid"
                value={highest > 0 ? formatINR(highest) : '—'}
                valueClassName={highest > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'}
                sub={bidsCount > 0 ? `${bidsCount} ${bidsCount === 1 ? 'bid' : 'bids'}` : 'No bids yet'}
              />
            </FactRow>

            <div className="mt-2.5 flex items-center justify-between gap-2 px-0.5 text-xs">
              {lot.myBid ? (
                <>
                  <span className="text-muted-foreground">Your bid</span>
                  <span className="flex items-center gap-1.5">
                    <span className={cn('rounded px-1.5 py-px text-[11px] font-semibold', positionMeta.chipClass)}>
                      {positionMeta.chip}
                    </span>
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatINR(lot.myBid.amount)}
                      <span className="font-normal text-muted-foreground"> / {unit.short}</span>
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground">
                    Lot value at {highest > 0 ? 'highest bid' : 'reserve'}
                  </span>
                  <span className="font-semibold tabular-nums text-foreground">{formatINRCompact(lotValue)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-border px-4 py-3">
          <Button
            onClick={() => onBid(lot)}
            variant={needsAction ? 'default' : 'outline'}
            className={cn('h-9 flex-1 rounded-lg text-[13px]', needsAction ? traderPrimaryClass : 'shadow-none')}
          >
            {lot.myBid ? <ArrowUpRight /> : <Gavel />}
            {!lot.myBid ? 'Place bid' : position === 'outbid' ? 'Raise bid' : 'Increase bid'}
          </Button>
          <Button asChild variant="outline" className="h-9 flex-1 rounded-lg text-[13px] shadow-none">
            <Link to={`/trader/crops/${lot._id}`}>
              View details <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export const TraderMarketplace = () => {
  const { user } = useAuth()
  const [lots, setLots] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts')
  const [sortBy, setSortBy] = useState('newest') // 'newest' | 'priceLow' | 'priceHigh' | 'highestVolume' | 'fewestBids'
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  // Modals State
  const [selectedLotForBid, setSelectedLotForBid] = useState(null)
  const [bidAmount, setBidAmount] = useState('')
  const [isSubmittingBid, setIsSubmittingBid] = useState(false)

  const loadMarketplaceLots = async () => {
    setLoading(true)
    try {
      const data = await cropService.getAllListings()
      if (Array.isArray(data) && data.length > 0) {
        // Transform incoming listings to rich marketplace format
        const formatted = data.map((c, idx) => ({
          _id: c._id || `LOT-${idx + 101}`,
          cropName: c.name || c.cropType || 'Farm Fresh Commodity',
          cropType: c.cropType,
          description: c.description,
          variety: c.description || c.variety || c.cropType || 'Graded Produce',
          category: c.category || 'vegetables',
          grade: c.grade || 'Grade-A Premium',
          quantity: c.quantity || 100,
          unit: c.unit || 'Quintals',
          reservePrice: c.basePrice || 2000,
          currentHighestBid: c.currentHighestBid || null,
          bidsCount: c.bidsCount || 0,
          myBid: c.myBid || null,
          apmcBenchmark: Math.round((c.basePrice || 2000) * 1.12),
          image: c.images?.[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80',
          images: c.images || [],
          farmer: {
            name: c.farmer?.name || 'Verified Farmer',
            village: c.farmer?.village || 'APMC Yard',
            district: c.district || c.farmer?.district || 'Karnataka',
            rating: 4.9,
            totalTrades: 1,
            verified: true
          },
          closingIn: c.closingIn || 'Live Bidding',
          listedAt: c.createdAt,
          harvestDate: new Date(c.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        }))

        setLots(formatted)
      } else {
        setLots([])
      }
    } catch (err) {
      console.warn('Marketplace load error:', err.message)
      setLots([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMarketplaceLots()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadMarketplaceLots()
    setIsRefreshing(false)
    toast.success('Marketplace lot feeds refreshed with live APMC arrivals! ⚡')
  }

  const handleOpenBidModal = (lot) => {
    setSelectedLotForBid(lot)
    if (lot.myBid) {
      setBidAmount(String(lot.myBid.amount + 50))
    } else {
      const nextMin = lot.currentHighestBid ? (lot.currentHighestBid + 50) : lot.reservePrice
      setBidAmount(String(nextMin))
    }
  }

  const handleSubmitBid = async (e) => {
    e.preventDefault()
    const parsed = Number(bidAmount)
    if (!parsed) {
      toast.error('Please enter a valid numeric bid amount.')
      return
    }

    if (selectedLotForBid?.myBid) {
      if (parsed <= Number(selectedLotForBid.myBid.amount)) {
        toast.error(`Your new bid must be higher than your previous bid of ₹${selectedLotForBid.myBid.amount.toLocaleString('en-IN')}/Qtl`)
        return
      }
    } else {
      if (parsed < (selectedLotForBid?.reservePrice || 0)) {
        toast.error(`Bid must be at least the reserve floor price of ₹${selectedLotForBid?.reservePrice || 0}/Qtl`)
        return
      }
    }

    setIsSubmittingBid(true)
    try {
      await bidService.placeBid({
        cropId: selectedLotForBid._id,
        amount: parsed,
        message: selectedLotForBid.myBid
          ? `Increased spot bid to ₹${parsed}/Qtl from ${user?.name || 'Verified Trader'}`
          : `Spot marketplace bid of ₹${parsed}/Qtl from ${user?.name || 'Verified Trader'}`
      })

      toast.success(
        selectedLotForBid.myBid
          ? `Bid increased successfully to ₹${parsed.toLocaleString('en-IN')}/Qtl! 📈`
          : `Bid of ₹${parsed.toLocaleString('en-IN')}/Qtl placed successfully on Lot #${selectedLotForBid._id}! 🔨`
      )
      setSelectedLotForBid(null)
      await loadMarketplaceLots()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to place bid. Please try again.'
      toast.error(msg)
    } finally {
      setIsSubmittingBid(false)
    }
  }

  // Filtered & Sorted Lots
  const filteredLots = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return lots
      .filter((lot) => {
        const matchesCategory = selectedCategory === 'all' || lot.category === selectedCategory
        const matchesDistrict = selectedDistrict === 'All Districts' || lot.farmer.district === selectedDistrict
        const matchesSearch = !q || [lot.cropName, lot.variety, lot.farmer.name, lot.farmer.district, lot._id]
          .some((field) => (field || '').toLowerCase().includes(q))

        return matchesCategory && matchesDistrict && matchesSearch
      })
      .sort(SORTERS[sortBy] || SORTERS.newest)
  }, [lots, selectedCategory, selectedDistrict, searchQuery, sortBy])

  // Presentational summary figures (derived from loaded lots only)
  const myBidLots = lots.filter((l) => l.myBid)
  const leadingCount = myBidLots.filter((l) => getBidPosition(l) === 'leading').length
  const outbidCount = myBidLots.filter((l) => getBidPosition(l) === 'outbid').length
  const counteredCount = myBidLots.filter((l) => getBidPosition(l) === 'countered').length
  const uncontestedCount = lots.filter((l) => !(l.bidsCount > 0)).length
  const districtCount = new Set(lots.map((l) => l.farmer.district)).size

  const categoryTabs = CATEGORY_TABS.map((tab) => ({
    key: tab.id,
    label: tab.label,
    count: tab.id === 'all' ? lots.length : lots.filter((l) => l.category === tab.id).length
  }))

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'all' || selectedDistrict !== 'All Districts'
  const clearFilters = () => {
    setSelectedCategory('all')
    setSelectedDistrict('All Districts')
    setSearchQuery('')
  }

  const isInitialLoad = loading && lots.length === 0
  const hasAnyLots = lots.length > 0

  // Bid dialog derived values
  const bidLot = selectedLotForBid
  const bidUnit = unitLabel(bidLot?.unit)
  const bidMin = bidLot
    ? (bidLot.myBid ? bidLot.myBid.amount + 1 : (bidLot.currentHighestBid ? bidLot.currentHighestBid + 10 : bidLot.reservePrice))
    : 0
  const closeBidModal = () => {
    if (!isSubmittingBid) setSelectedLotForBid(null)
  }

  return (
    <div className="space-y-6">

      {/* ================= Header ================= */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
            Crop Marketplace
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Browse farm-gate lots from across Karnataka and place bids backed by escrow protection.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-10 w-10 rounded-lg bg-card p-0 shadow-none"
            title="Refresh lots"
            aria-label="Refresh lots"
          >
            <RefreshCw className={cn((isRefreshing || loading) && 'animate-spin')} />
          </Button>
          <Button asChild variant="outline" className="h-10 flex-1 rounded-lg bg-card px-4 shadow-none sm:flex-none">
            <Link to="/trader/escrow">
              <Wallet /> Escrow wallet
            </Link>
          </Button>
        </div>
      </header>

      {/* ================= Summary ================= */}
      {hasAnyLots && (
        <SummaryStrip
          label="Marketplace summary"
          items={[
            {
              label: 'Lots available',
              value: lots.length,
              hint: `from ${districtCount} ${districtCount === 1 ? 'district' : 'districts'}`
            },
            {
              label: 'Your active bids',
              value: myBidLots.length,
              hint: myBidLots.length > 0
                ? [
                    `${leadingCount} leading`,
                    outbidCount > 0 && `${outbidCount} outbid`,
                    counteredCount > 0 && `${counteredCount} countered`
                  ].filter(Boolean).join(' · ')
                : 'no bids placed yet'
            },
            {
              label: 'No bids yet',
              value: uncontestedCount,
              hint: 'open at reserve price'
            }
          ]}
        />
      )}

      {/* ================= Toolbar ================= */}
      {hasAnyLots && (
        <section className="space-y-3">
          <SegmentedTabs
            label="Filter by category"
            tabs={categoryTabs}
            value={selectedCategory}
            onChange={setSelectedCategory}
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput
              accent="trader"
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search crop, farmer, district or lot ID"
              aria-label="Search lots"
              className="sm:flex-1"
            />
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <SelectField
                accent="trader"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                aria-label="Filter by district"
                className="sm:w-48"
                selectClassName="bg-card"
              >
                {DISTRICT_OPTIONS.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </SelectField>
              <SelectField
                accent="trader"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort lots"
                className="sm:w-48"
                selectClassName="bg-card"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </SelectField>
            </div>
          </div>
        </section>
      )}

      {/* ================= Results meta ================= */}
      {hasAnyLots && hasActiveFilters && filteredLots.length > 0 && (
        <ResultsMeta shown={filteredLots.length} total={lots.length} onClear={clearFilters} />
      )}

      {/* ================= Grid ================= */}
      {isInitialLoad ? (
        <div className={LISTING_GRID} aria-busy="true">
          {[...Array(3)].map((_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      ) : filteredLots.length > 0 ? (
        <section className={LISTING_GRID}>
          {filteredLots.map((lot) => (
            <MarketLotCard key={lot._id} lot={lot} onBid={handleOpenBidModal} />
          ))}
        </section>
      ) : hasAnyLots ? (
        /* Filtered to nothing */
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SearchX className="h-5 w-5" />
          </span>
          <p className="text-sm font-semibold text-foreground">No lots match these filters</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Try another district or search term, or clear the filters to see all {lots.length} lots.
          </p>
          <Button variant="outline" onClick={clearFilters} className="mt-4 h-9 rounded-lg shadow-none">
            Clear filters
          </Button>
        </div>
      ) : (
        /* Market is empty */
        <div className="rounded-xl border border-border bg-card px-6 py-12 text-center sm:py-16">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
            <ShoppingCart className="h-6 w-6" />
          </span>
          <h2 className="text-lg font-semibold text-foreground">No lots on the market right now</h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
            Farmers post new harvest lots throughout the day. Check back soon, or refresh to see the latest arrivals.
          </p>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="mt-6 h-10 rounded-lg px-5 shadow-none"
          >
            <RefreshCw className={cn(isRefreshing && 'animate-spin')} /> Refresh marketplace
          </Button>
        </div>
      )}

      {/* ================= Bid Placement / Increase Dialog ================= */}
      <Dialog open={!!bidLot} onClose={closeBidModal} labelledBy="bid-dialog-title" className="max-h-[94vh] sm:max-w-lg">
        {bidLot && (
          <form onSubmit={handleSubmitBid} className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <h2 id="bid-dialog-title" className="text-lg font-semibold tracking-tight text-foreground">
                  {bidLot.myBid ? 'Increase your bid' : 'Place a bid'}
                </h2>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {bidLot.cropName} · {formatQuantity(bidLot.quantity, bidLot.unit)} · {bidLot.farmer.district}
                </p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">Lot #{bidLot._id}</p>
              </div>
              <button
                type="button"
                onClick={closeBidModal}
                aria-label="Close"
                className="-mr-1.5 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
              {/* Market position */}
              <dl className="rounded-lg border border-border text-sm">
                {[
                  { label: 'Reserve price', value: `${formatINR(bidLot.reservePrice)} / ${bidUnit.short}` },
                  {
                    label: 'Highest bid',
                    value: bidLot.currentHighestBid
                      ? `${formatINR(bidLot.currentHighestBid)} / ${bidUnit.short}`
                      : 'No bids yet',
                    muted: !bidLot.currentHighestBid
                  },
                  bidLot.myBid && {
                    label: 'Your current bid',
                    value: `${formatINR(bidLot.myBid.amount)} / ${bidUnit.short}`,
                    chip: BID_POSITION_META[getBidPosition(bidLot)]
                  }
                ].filter(Boolean).map(({ label, value, muted, chip }, idx) => (
                  <div key={label} className={cn('flex items-center justify-between gap-4 px-4 py-2.5', idx > 0 && 'border-t border-border')}>
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="flex items-center gap-2">
                      {chip && (
                        <span className={cn('rounded px-1.5 py-px text-[11px] font-semibold', chip.chipClass)}>{chip.chip}</span>
                      )}
                      <span className={cn('font-semibold tabular-nums', muted ? 'font-normal text-muted-foreground' : 'text-foreground')}>
                        {value}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Bid amount */}
              <div className="space-y-1.5">
                <FormLabel htmlFor="bid-amount" required hint={`₹ per ${bidUnit.singular}`}>
                  {bidLot.myBid ? 'New bid' : 'Your bid'}
                </FormLabel>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                  <input
                    id="bid-amount"
                    type="number"
                    required
                    min={bidMin}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Enter bid amount"
                    autoFocus
                    className={cn(fieldClass('trader'), 'h-11 pl-7 text-base font-semibold tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none')}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <p className="text-xs text-muted-foreground">
                    {bidLot.myBid
                      ? `Must be higher than your current bid of ${formatINR(bidLot.myBid.amount)}.`
                      : `Minimum ${formatINR(bidLot.reservePrice)} (reserve price).`}
                  </p>
                  <div className="flex gap-1.5">
                    {BID_INCREMENTS.map((step) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => setBidAmount(String((Number(bidAmount) || bidMin) + step))}
                        className="rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium tabular-nums text-foreground transition-colors hover:border-amber-500/50 hover:bg-amber-500/5"
                      >
                        +₹{step}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contract value */}
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-xs text-muted-foreground">Total contract value</p>
                  <p className="text-lg font-bold tabular-nums text-foreground">
                    {formatINR((Number(bidAmount) || 0) * bidLot.quantity)}
                  </p>
                </div>
                <p className="mt-0.5 text-right text-xs tabular-nums text-muted-foreground">
                  {formatQuantity(bidLot.quantity, bidLot.unit)} × {formatINR(Number(bidAmount) || 0)}
                </p>
                <p className="mt-2 flex items-start gap-1.5 border-t border-border pt-2 text-[11px] leading-relaxed text-muted-foreground">
                  <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  Includes 1.50% APMC market cess and direct DBT payout escrow guarantee.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-border bg-card px-5 py-4 sm:px-6">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmittingBid}
                onClick={closeBidModal}
                className="h-10 rounded-lg px-5 shadow-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingBid}
                className={cn('h-10 rounded-lg px-6 font-semibold', traderPrimaryClass)}
              >
                {isSubmittingBid && <Loader2 className="animate-spin" />}
                {isSubmittingBid ? 'Submitting…' : bidLot.myBid ? 'Update bid' : 'Place bid'}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  )
}

export default TraderMarketplace
