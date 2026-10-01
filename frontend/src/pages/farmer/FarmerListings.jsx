import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import cropService from '@/services/cropService'
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
  FormSection,
  ResultsMeta,
  ListingCardSkeleton
} from '@/components/common/ListingKit'
import {
  FALLBACK_IMAGE,
  handleImageError,
  formatINR,
  formatINRCompact,
  formatDate,
  unitLabel,
  categoryLabel
} from '@/utils/listingFormat'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import soldOutImg from '@/soldout.png'
import {
  Sprout,
  Plus,
  MapPin,
  ShieldCheck,
  X,
  UploadCloud,
  Gavel,
  FileText,
  Printer,
  RefreshCw,
  Trash2,
  Camera,
  AlertTriangle,
  SearchX,
  Receipt
} from 'lucide-react'

// Simple crop types only (no hardcoded varieties)
const CROP_TYPES = [
  { name: 'Tomato', category: 'vegetables', defaultPrice: 2200, defaultImg: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop' },
  { name: 'Onion', category: 'vegetables', defaultPrice: 2550, defaultImg: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop' },
  { name: 'Potato', category: 'vegetables', defaultPrice: 1850, defaultImg: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop' },
  { name: 'Ragi (Finger Millet)', category: 'grains', defaultPrice: 3500, defaultImg: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop' },
  { name: 'Maize (Corn)', category: 'grains', defaultPrice: 2100, defaultImg: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop' },
  { name: 'Paddy / Rice', category: 'grains', defaultPrice: 2850, defaultImg: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop' },
  { name: 'Chilli', category: 'spices', defaultPrice: 14500, defaultImg: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop' },
  { name: 'Cotton', category: 'spices', defaultPrice: 7250, defaultImg: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600&auto=format&fit=crop' },
  { name: 'Turmeric', category: 'spices', defaultPrice: 8400, defaultImg: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop' },
  { name: 'Ginger', category: 'spices', defaultPrice: 6500, defaultImg: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop' },
  { name: 'Groundnut (Peanut)', category: 'grains', defaultPrice: 5800, defaultImg: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&auto=format&fit=crop' },
  { name: 'Sugarcane', category: 'spices', defaultPrice: 3200, defaultImg: 'https://images.unsplash.com/photo-1589135233689-d56d25c68b6b?w=600&auto=format&fit=crop' },
  { name: 'Wheat', category: 'grains', defaultPrice: 3200, defaultImg: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop' },
  { name: 'Copra / Coconut (Dry)', category: 'spices', defaultPrice: 13800, defaultImg: 'https://images.unsplash.com/photo-1589135233689-d56d25c68b6b?w=600&auto=format&fit=crop' },
  { name: 'Garlic', category: 'spices', defaultPrice: 12000, defaultImg: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop' },
  { name: 'Other Crops', category: 'vegetables', defaultPrice: 2000, defaultImg: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop' }
]

import { KARNATAKA_DISTRICTS } from '@/constants/locations'

// ---------------------------------------------------------------------------
// Listing status & sorting (page-specific)
// ---------------------------------------------------------------------------

const isListingSold = (status) => {
  const s = (status || '').toLowerCase()
  return s === 'sold' || s === 'sold_out' || s === 'sold out'
}

const isHiddenStatus = (status) => status === 'withdrawn' || status === 'removed'

const STATUS_META = {
  available: { label: 'Live', dot: 'bg-emerald-500' },
  sold: { label: 'Sold', dot: 'bg-slate-500' },
  expired: { label: 'Expired', dot: 'bg-amber-500' },
  delisted: { label: 'Delisted', dot: 'bg-slate-400' }
}
const getStatusMeta = (status) => {
  if (isListingSold(status)) return STATUS_META.sold
  return STATUS_META[(status || '').toLowerCase()] || { label: status || 'Unknown', dot: 'bg-slate-400' }
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'offers', label: 'Most offers' },
  { value: 'price_desc', label: 'Reserve: high to low' },
  { value: 'price_asc', label: 'Reserve: low to high' }
]

const SORTERS = {
  newest: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  oldest: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
  offers: (a, b) => (b.bidsCount || 0) - (a.bidsCount || 0),
  price_desc: (a, b) => (b.basePrice || 0) - (a.basePrice || 0),
  price_asc: (a, b) => (a.basePrice || 0) - (b.basePrice || 0)
}

// ---------------------------------------------------------------------------
// Listing card
// ---------------------------------------------------------------------------

const ListingCard = ({ crop, fallbackDistrict, onOpenPass, onWithdraw }) => {
  const isSold = isListingSold(crop.status)
  const isLive = crop.status === 'available'
  const status = getStatusMeta(crop.status)
  const unit = unitLabel(crop.unit)
  const primaryImage = crop.images?.[0] || FALLBACK_IMAGE
  const totalPhotos = crop.images?.length || 0
  const bidsCount = crop.bidsCount || 0
  const reserve = Number(crop.basePrice) || 0
  // currentHighestBid is null from the API when a lot has no active bids
  const bestOffer = bidsCount > 0 ? Number(crop.currentHighestBid) || 0 : 0
  const hasOffer = bestOffer > 0
  const premiumPct = hasOffer && reserve > 0 ? Math.round(((bestOffer - reserve) / reserve) * 100) : null
  const lotValue = (Number(crop.quantity) || 0) * (hasOffer ? bestOffer : reserve)
  const listedOn = formatDate(crop.createdAt)
  const district = crop.district || fallbackDistrict

  return (
    <article className={lotCardClass(isSold)}>
      {/* Image */}
      <div className={lotImageWrapClass}>
        <img
          src={primaryImage}
          alt={crop.name}
          loading="lazy"
          onError={handleImageError}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out motion-reduce:transition-none',
            isSold ? 'opacity-60 grayscale' : 'group-hover:scale-[1.03]'
          )}
        />

        <PhotoPill dot={status.dot}>{status.label}</PhotoPill>

        {totalPhotos > 1 && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white tabular-nums">
            <Camera className="h-3 w-3" />
            {totalPhotos}
          </span>
        )}

        {isSold && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <img
              src={soldOutImg}
              alt=""
              aria-hidden="true"
              className="w-[36%] max-w-[150px] select-none object-contain drop-shadow-md"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col p-4">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-primary/80">
            {categoryLabel(crop.category)}
            {crop.cropType && crop.cropType !== crop.name && (
              <span className="text-muted-foreground"> · {crop.cropType}</span>
            )}
          </p>
          <h3 className="mt-1 truncate text-base font-semibold leading-snug text-foreground" title={crop.name}>
            {crop.name}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{district}</span>
            {listedOn && (
              <>
                <span aria-hidden="true" className="px-0.5">·</span>
                <span className="shrink-0">Listed {listedOn}</span>
              </>
            )}
          </p>

          {crop.description && (
            <p className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
              {crop.description}
            </p>
          )}

          <div className="mt-auto pt-4">
            <FactRow>
              <Fact
                label="Quantity"
                value={(Number(crop.quantity) || 0).toLocaleString('en-IN')}
                sub={Number(crop.quantity) === 1 ? unit.singular : unit.plural}
              />
              <Fact label="Reserve" value={formatINR(reserve)} sub={`per ${unit.singular}`} />
              <Fact
                label="Best offer"
                value={hasOffer ? formatINR(bestOffer) : '—'}
                valueClassName={hasOffer ? (premiumPct >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400') : 'text-muted-foreground'}
                sub={bidsCount > 0 ? `${bidsCount} ${bidsCount === 1 ? 'offer' : 'offers'}` : 'No offers yet'}
              />
            </FactRow>

            <div className="mt-2.5 flex items-center justify-between gap-2 px-0.5 text-xs">
              <span className="text-muted-foreground">
                Lot value {hasOffer ? 'at best offer' : 'at reserve'}
              </span>
              <span className="flex items-center gap-1.5">
                {premiumPct !== null && premiumPct !== 0 && (
                  <span
                    className={cn(
                      'rounded px-1.5 py-px text-[11px] font-semibold tabular-nums',
                      premiumPct > 0
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                    )}
                    title={premiumPct > 0 ? 'Above your reserve price' : 'Below your reserve price'}
                  >
                    {premiumPct > 0 ? '+' : '−'}{Math.abs(premiumPct)}%
                  </span>
                )}
                <span className="font-semibold tabular-nums text-foreground">{formatINRCompact(lotValue)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-border px-4 py-3">
          {isSold ? (
            <Button asChild variant="outline" className="h-9 flex-1 rounded-lg text-[13px] shadow-none">
              <Link to="/farmer/orders">
                <Receipt /> View order
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              variant={isLive && bidsCount > 0 ? 'default' : 'outline'}
              className={cn('h-9 flex-1 rounded-lg text-[13px]', !(isLive && bidsCount > 0) && 'shadow-none')}
            >
              <Link to="/farmer/bids">
                <Gavel /> Review offers
                {bidsCount > 0 && (
                  <span className="rounded bg-primary-foreground/20 px-1.5 text-[11px] font-semibold tabular-nums">
                    {bidsCount}
                  </span>
                )}
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenPass(crop)}
            className="h-9 flex-1 rounded-lg text-[13px] shadow-none"
          >
            <FileText /> Lot pass
          </Button>
          <Button
            variant="ghost"
            onClick={() => onWithdraw(crop)}
            className="h-9 w-9 shrink-0 rounded-lg p-0 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600"
            title="Withdraw lot"
            aria-label={`Withdraw ${crop.name}`}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
    </article>
  )
}


// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export const FarmerListings = () => {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'available' | 'sold'
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedLotForPass, setSelectedLotForPass] = useState(null)
  const [lotToWithdraw, setLotToWithdraw] = useState(null)
  const [withdrawing, setWithdrawing] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Multiple Photos state: real File objects for Cloudinary multipart upload + preview URLs for UI
  const [photoFiles, setPhotoFiles] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const fileInputRef = useRef(null)

  // Single Clean Crop Lot Form State
  const [formData, setFormData] = useState({
    cropType: 'Tomato',
    title: 'Fresh Farm Tomato',
    category: 'vegetables',
    quantity: 50,
    unit: 'quintal',
    basePrice: 2200,
    district: user?.district || 'Hassan',
    description: ''
  })

  const loadListings = async () => {
    setLoading(true)
    try {
      const data = await cropService.getMyListings()
      setListings(data || [])
    } catch (err) {
      console.error('[FarmerListings] Failed to load listings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadListings()
  }, [])

  // Crop Type Dropdown Change
  const handleCropTypeChange = (cropTypeName) => {
    const matched = CROP_TYPES.find((c) => c.name === cropTypeName)
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        cropType: matched.name,
        title: `Fresh Farm ${matched.name}`,
        category: matched.category,
        basePrice: matched.defaultPrice
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        cropType: cropTypeName,
        title: `Fresh Farm ${cropTypeName}`
      }))
    }
  }

  // Multiple Photos Upload Handler
  const handleMultipleFilesChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (photoFiles.length + files.length > 5) {
      toast.error('You can upload a maximum of 5 crop photos')
      return
    }

    const validFiles = []
    const newPreviews = []

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`)
        continue
      }
      validFiles.push(file)
      newPreviews.push(URL.createObjectURL(file))
    }

    setPhotoFiles((prev) => [...prev, ...validFiles])
    setPhotoPreviews((prev) => [...prev, ...newPreviews])
    if (validFiles.length > 0) {
      toast.success(`Added ${validFiles.length} photo(s)!`)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemovePhoto = (indexToRemove) => {
    setPhotoFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove))
    setPhotoPreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  // Create Listing Submit Handler
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const defaultImg = CROP_TYPES.find((c) => c.name === formData.cropType)?.defaultImg
        || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop'

      const formPayload = new FormData()
      formPayload.append('name', formData.title || `${formData.cropType} Lot`)
      formPayload.append('cropType', formData.cropType)
      formPayload.append('category', formData.category || 'vegetables')
      formPayload.append('quantity', Number(formData.quantity) || 50)
      formPayload.append('unit', formData.unit || 'quintal')
      formPayload.append('basePrice', Number(formData.basePrice) || 2000)
      formPayload.append('district', formData.district || user?.district || 'Hassan')
      formPayload.append('description', formData.description || `Freshly harvested ${formData.cropType} lot from farm gate.`)

      if (photoFiles.length > 0) {
        photoFiles.forEach((file) => {
          formPayload.append('images', file)
        })
      } else {
        formPayload.append('images', defaultImg)
      }

      const createdCrop = await cropService.createListing(formPayload)

      const newListing = {
        _id: createdCrop?._id || `crop-${Date.now()}`,
        name: createdCrop?.name || formData.title || `${formData.cropType} Lot`,
        category: createdCrop?.category || formData.category || 'vegetables',
        quantity: createdCrop?.quantity || Number(formData.quantity) || 50,
        unit: createdCrop?.unit || formData.unit || 'quintal',
        basePrice: createdCrop?.basePrice || Number(formData.basePrice) || 2000,
        district: createdCrop?.district || formData.district || 'Hassan',
        description: createdCrop?.description || formData.description,
        images: createdCrop?.images && createdCrop.images.length > 0
          ? createdCrop.images
          : (photoPreviews.length > 0 ? photoPreviews : [defaultImg]),
        bidsCount: 0,
        currentHighestBid: Number(formData.basePrice) || 2000,
        status: 'available',
        createdAt: new Date().toISOString()
      }

      setListings((prev) => [newListing, ...prev])
      toast.success(`"${newListing.name}" published to Karnataka APMC marketplace! 🌾`)

      // Reset form modal
      setIsCreateModalOpen(false)
      setPhotoFiles([])
      setPhotoPreviews([])
      setFormData({
        cropType: 'Tomato',
        title: 'Fresh Farm Tomato',
        category: 'vegetables',
        quantity: 50,
        unit: 'quintal',
        basePrice: 2200,
        district: user?.district || 'Hassan',
        description: ''
      })
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to publish crop listing. Please try again.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Confirmation happens in the withdraw dialog before this runs
  const handleDeleteListing = async (cropId, cropName) => {
    setWithdrawing(true)
    try {
      await cropService.deleteListing(cropId)
      setListings((prev) => prev.filter((c) => c._id !== cropId))
      toast.success(`Crop lot "${cropName}" withdrawn.`)
      setLotToWithdraw(null)
    } catch (err) {
      toast.error('Failed to withdraw listing.')
    } finally {
      setWithdrawing(false)
    }
  }

  // Lots the farmer can see (withdrawn/removed lots are never shown)
  const visibleListings = useMemo(
    () => listings.filter((item) => !isHiddenStatus(item.status)),
    [listings]
  )

  const categories = useMemo(
    () => Array.from(new Set(visibleListings.map((l) => l.category).filter(Boolean))).sort(),
    [visibleListings]
  )

  const filteredListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return visibleListings
      .filter((item) => {
        const matchesSearch = !q || [item.name, item.cropType, item.district, item.category]
          .some((field) => (field || '').toLowerCase().includes(q))
        const matchesStatus = statusFilter === 'all'
          || (statusFilter === 'sold' ? isListingSold(item.status) : item.status === statusFilter)
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
        return matchesSearch && matchesStatus && matchesCategory
      })
      .sort(SORTERS[sortBy] || SORTERS.newest)
  }, [visibleListings, searchQuery, statusFilter, categoryFilter, sortBy])

  // Presentational summary figures (derived from existing listings state only)
  const liveListings = visibleListings.filter((l) => l.status === 'available')
  const availableCount = liveListings.length
  const soldCount = visibleListings.filter((l) => isListingSold(l.status)).length
  const openOffers = liveListings.reduce((sum, l) => sum + (l.bidsCount || 0), 0)
  const lotsWithOffers = liveListings.filter((l) => (l.bidsCount || 0) > 0).length
  const awaitingOffers = availableCount - lotsWithOffers
  const liveValue = liveListings.reduce((sum, l) => {
    const best = (l.bidsCount || 0) > 0 ? Number(l.currentHighestBid) || 0 : 0
    return sum + (Number(l.quantity) || 0) * Math.max(best, Number(l.basePrice) || 0)
  }, 0)

  const STATUS_TABS = [
    { key: 'all', label: 'All', count: visibleListings.length },
    { key: 'available', label: 'Live', count: availableCount },
    { key: 'sold', label: 'Sold', count: soldCount }
  ]

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all' || categoryFilter !== 'all'
  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setCategoryFilter('all')
  }

  const isInitialLoad = loading && listings.length === 0
  const hasAnyLots = visibleListings.length > 0
  const formUnit = unitLabel(formData.unit)
  const passUnit = unitLabel(selectedLotForPass?.unit)
  const closeCreateModal = () => {
    if (!submitting) setIsCreateModalOpen(false)
  }

  return (
    <div className="space-y-6">

      {/* ================= Header ================= */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
            My Harvest Lots
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Publish lots to the APMC marketplace, track trader offers, and issue gate passes.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            onClick={loadListings}
            disabled={loading}
            className="h-10 w-10 rounded-lg bg-card p-0 shadow-none"
            title="Refresh lots"
            aria-label="Refresh lots"
          >
            <RefreshCw className={cn(loading && 'animate-spin')} />
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-10 flex-1 rounded-lg px-4 font-semibold shadow-sm sm:flex-none"
          >
            <Plus /> Post new lot
          </Button>
        </div>
      </header>

      {/* ================= Summary ================= */}
      {hasAnyLots && (
        <SummaryStrip
          label="Lot summary"
          items={[
            {
              label: 'Open offers',
              value: openOffers,
              hint: lotsWithOffers > 0 ? `across ${lotsWithOffers} live ${lotsWithOffers === 1 ? 'lot' : 'lots'}` : 'none on live lots yet'
            },
            {
              label: 'Awaiting first offer',
              value: awaitingOffers,
              hint: `of ${availableCount} live ${availableCount === 1 ? 'lot' : 'lots'}`
            },
            {
              label: 'Live lot value',
              value: formatINRCompact(liveValue),
              hint: 'at best offer or reserve'
            }
          ]}
        />
      )}

      {/* ================= Toolbar ================= */}
      {hasAnyLots && (
        <section className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <SegmentedTabs
            label="Filter by status"
            tabs={STATUS_TABS}
            value={statusFilter}
            onChange={setStatusFilter}
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search lots"
              aria-label="Search lots"
              className="sm:flex-1 xl:w-64 xl:flex-none"
            />
            <div className="grid grid-cols-2 gap-2 sm:flex">
              {categories.length > 1 && (
                <SelectField
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  aria-label="Filter by category"
                  className="sm:w-44"
                  selectClassName="bg-card"
                >
                  <option value="all">All categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{categoryLabel(c)}</option>
                  ))}
                </SelectField>
              )}
              <SelectField
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort lots"
                className={cn('sm:w-48', categories.length <= 1 && 'col-span-2')}
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
      {hasAnyLots && hasActiveFilters && filteredListings.length > 0 && (
        <ResultsMeta shown={filteredListings.length} total={visibleListings.length} onClear={clearFilters} />
      )}

      {/* ================= Grid ================= */}
      {isInitialLoad ? (
        <div className={LISTING_GRID} aria-busy="true">
          {[...Array(3)].map((_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      ) : filteredListings.length > 0 ? (
        <section className={LISTING_GRID}>
          {filteredListings.map((crop) => (
            <ListingCard
              key={crop._id}
              crop={crop}
              fallbackDistrict={user?.district || 'Hassan'}
              onOpenPass={setSelectedLotForPass}
              onWithdraw={setLotToWithdraw}
            />
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
            Try a different search term, or clear the filters to see all {visibleListings.length} lots.
          </p>
          <Button variant="outline" onClick={clearFilters} className="mt-4 h-9 rounded-lg shadow-none">
            Clear filters
          </Button>
        </div>
      ) : (
        /* No lots yet */
        <div className="rounded-xl border border-border bg-card px-6 py-12 text-center sm:py-16">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sprout className="h-6 w-6" />
          </span>
          <h2 className="text-lg font-semibold text-foreground">List your first harvest lot</h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
            Add photos, quantity and a reserve price. Verified APMC traders can send offers as soon as your lot is live.
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)} className="mt-6 h-10 rounded-lg px-5 font-semibold shadow-sm">
            <Plus /> Post new lot
          </Button>
          <ol className="mx-auto mt-10 grid max-w-2xl gap-4 border-t border-border pt-8 text-left sm:grid-cols-3">
            {[
              { title: 'Publish your lot', body: 'Photos, quantity and reserve price.' },
              { title: 'Compare offers', body: 'Accept, decline or counter trader bids.' },
              { title: 'Get paid securely', body: 'Payment is held in escrow until delivery.' }
            ].map(({ title, body }, i) => (
              <li key={title} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-[11px] font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ================= Create Listing Modal ================= */}
      <Dialog
        open={isCreateModalOpen}
        onClose={closeCreateModal}
        labelledBy="create-lot-title"
        className="max-h-[94vh] sm:max-h-[90vh] sm:max-w-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <h2 id="create-lot-title" className="text-lg font-semibold tracking-tight text-foreground">
              Post a new harvest lot
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Your lot goes live on the APMC marketplace as soon as you publish.
            </p>
          </div>
          <button
            type="button"
            onClick={closeCreateModal}
            aria-label="Close"
            className="-mr-1.5 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleCreateSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-7 overflow-y-auto px-5 py-6 sm:px-7">

            {/* Photos */}
            <FormSection
              title="Photos"
              description={`Clear photos get more offers. The first photo is the cover. ${photoPreviews.length}/5 · max 5MB each.`}
            >
              <input
                type="file"
                multiple
                ref={fileInputRef}
                accept="image/*"
                onChange={handleMultipleFilesChange}
                className="hidden"
              />

              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                {photoPreviews.map((photo, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                    <img src={photo} alt={`Crop photo ${index + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-rose-600"
                      title="Remove photo"
                      aria-label={`Remove photo ${index + 1}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-gray-900">
                        Cover
                      </span>
                    )}
                  </div>
                ))}

                {photoPreviews.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-input bg-muted/40 p-2 text-center transition-colors hover:border-primary/50 hover:bg-primary/5',
                      photoPreviews.length === 0 ? 'col-span-full h-32' : 'aspect-square'
                    )}
                  >
                    <UploadCloud className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">
                      {photoPreviews.length === 0 ? 'Add crop photos' : 'Add photos'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">PNG, JPG, WEBP</span>
                  </button>
                )}
              </div>
            </FormSection>

            {/* Crop details */}
            <FormSection title="Crop details">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <FormLabel htmlFor="lot-crop-type" required>Crop type</FormLabel>
                  <SelectField
                    id="lot-crop-type"
                    value={formData.cropType}
                    onChange={(e) => handleCropTypeChange(e.target.value)}
                  >
                    {CROP_TYPES.map((crop) => (
                      <option key={crop.name} value={crop.name}>
                        {crop.name}
                      </option>
                    ))}
                  </SelectField>
                </div>

                <div className="space-y-1.5">
                  <FormLabel htmlFor="lot-title" required>Listing title</FormLabel>
                  <input
                    id="lot-title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Hybrid Bangalore Tomato Grade-A"
                    className={fieldClass()}
                  />
                </div>

                <div className="space-y-1.5">
                  <FormLabel htmlFor="lot-category" required>Category</FormLabel>
                  <SelectField
                    id="lot-category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="vegetables">Vegetables (ತರಕಾರಿಗಳು)</option>
                    <option value="grains">Grains & Cereals (ಧಾನ್ಯಗಳು)</option>
                    <option value="spices">Spices & Cash Crops (ಮಸಾಲೆ ಬೆಳೆಗಳು)</option>
                    <option value="fruits">Fruits (ಹಣ್ಣುಗಳು)</option>
                    <option value="pulses">Pulses & Legumes (ಕಾಳುಗಳು)</option>
                  </SelectField>
                </div>

                <div className="space-y-1.5">
                  <FormLabel htmlFor="lot-district" required>District / APMC yard</FormLabel>
                  <SelectField
                    id="lot-district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  >
                    {KARNATAKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d} APMC Market Yard</option>
                    ))}
                  </SelectField>
                </div>
              </div>

              <div className="space-y-1.5">
                <FormLabel htmlFor="lot-description" hint="Optional">Description & harvest notes</FormLabel>
                <textarea
                  id="lot-description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Variety, grading, harvest date, moisture content, packaging or pickup instructions…"
                  className={cn(fieldClass(), 'h-auto resize-y py-2.5 leading-relaxed')}
                />
              </div>
            </FormSection>

            {/* Quantity & pricing */}
            <FormSection title="Quantity & pricing">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <FormLabel htmlFor="lot-quantity" required>Quantity</FormLabel>
                  <input
                    id="lot-quantity"
                    type="number"
                    required
                    min={1}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className={cn(fieldClass(), 'tabular-nums')}
                  />
                </div>

                <div className="space-y-1.5">
                  <FormLabel htmlFor="lot-unit">Unit</FormLabel>
                  <SelectField
                    id="lot-unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="quintal">Quintals (100 kg)</option>
                    <option value="ton">Metric Tons (1000 kg)</option>
                    <option value="crate">Crates (25 kg)</option>
                    <option value="bag">Gunny Bags (50 kg)</option>
                  </SelectField>
                </div>

                <div className="col-span-2 space-y-1.5 sm:col-span-1">
                  <FormLabel htmlFor="lot-price" required hint={`per ${formUnit.singular}`}>Reserve price</FormLabel>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                    <input
                      id="lot-price"
                      type="number"
                      required
                      min={100}
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      className={cn(fieldClass(), 'pl-7 tabular-nums')}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/50 px-4 py-3">
                <div>
                  <p className="text-xs text-muted-foreground">Estimated lot value at reserve</p>
                  <p className="text-lg font-bold tabular-nums text-foreground">
                    {formatINR(Number(formData.quantity) * Number(formData.basePrice))}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> 0% platform commission
                </span>
              </div>
            </FormSection>
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-border bg-card px-5 py-4 sm:px-7">
            <Button
              type="button"
              variant="outline"
              onClick={closeCreateModal}
              disabled={submitting}
              className="h-10 rounded-lg px-5 shadow-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-10 rounded-lg px-6 font-semibold shadow-sm"
            >
              {submitting && <RefreshCw className="animate-spin" />}
              {submitting ? 'Publishing…' : 'Publish lot'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ================= APMC Lot Pass Modal ================= */}
      <Dialog
        open={!!selectedLotForPass}
        onClose={() => setSelectedLotForPass(null)}
        labelledBy="lot-pass-title"
        className="sm:max-w-md"
      >
        {selectedLotForPass && (
          <>
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 id="lot-pass-title" className="text-[15px] font-semibold text-foreground">
                    APMC electronic lot pass
                  </h2>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">
                    Pass #{selectedLotForPass._id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLotForPass(null)}
                aria-label="Close"
                className="-mr-1.5 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <dl className="px-6 py-3 text-sm">
              {[
                { label: 'Producer', value: user?.name || 'Ramesh Gowda' },
                { label: 'Produce', value: selectedLotForPass.name },
                { label: 'Category', value: categoryLabel(selectedLotForPass.category) },
                {
                  label: 'Lot quantity',
                  value: `${(Number(selectedLotForPass.quantity) || 0).toLocaleString('en-IN')} ${Number(selectedLotForPass.quantity) === 1 ? passUnit.singular : passUnit.plural}`
                },
                { label: 'Declared reserve', value: `${formatINR(selectedLotForPass.basePrice)} / ${passUnit.short}` },
                { label: 'Origin', value: `${selectedLotForPass.district || user?.district || 'Hassan'}, Karnataka` },
                { label: 'Listed on', value: formatDate(selectedLotForPass.createdAt) || '—' },
                { label: 'Status', value: getStatusMeta(selectedLotForPass.status).label }
              ].map(({ label, value }, idx) => (
                <div
                  key={label}
                  className={cn('flex items-baseline justify-between gap-4 py-2.5', idx > 0 && 'border-t border-dashed border-border')}
                >
                  <dt className="shrink-0 text-muted-foreground">{label}</dt>
                  <dd className="min-w-0 text-right font-medium text-foreground">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="flex gap-2.5 border-t border-border bg-muted/30 px-6 py-4">
              <Button
                variant="outline"
                onClick={() => setSelectedLotForPass(null)}
                className="h-10 flex-1 rounded-lg shadow-none"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  window.print()
                  toast.success('Lot pass dispatched to printer!')
                }}
                className="h-10 flex-[2] rounded-lg font-semibold shadow-sm"
              >
                <Printer /> Print gate pass
              </Button>
            </div>
          </>
        )}
      </Dialog>

      {/* ================= Withdraw Confirmation ================= */}
      <Dialog
        open={!!lotToWithdraw}
        onClose={() => !withdrawing && setLotToWithdraw(null)}
        labelledBy="withdraw-title"
        className="sm:max-w-md"
      >
        {lotToWithdraw && (
          <>
            <div className="flex gap-4 px-6 pb-2 pt-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 id="withdraw-title" className="text-base font-semibold text-foreground">
                  Withdraw this lot?
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground">“{lotToWithdraw.name}”</span> will be removed from the marketplace.
                  {(lotToWithdraw.bidsCount || 0) > 0
                    ? ` Its ${lotToWithdraw.bidsCount} active ${lotToWithdraw.bidsCount === 1 ? 'offer' : 'offers'} will be cancelled and any escrow held for it will be refunded to the buyer.`
                    : ' Traders will no longer be able to send offers on it.'}
                </p>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2.5 px-6 pb-6 pt-4 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setLotToWithdraw(null)}
                disabled={withdrawing}
                className="h-10 rounded-lg px-5 shadow-none"
              >
                Keep lot
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteListing(lotToWithdraw._id, lotToWithdraw.name)}
                disabled={withdrawing}
                className="h-10 rounded-lg bg-rose-600 px-5 font-semibold text-white hover:bg-rose-700"
              >
                {withdrawing ? 'Withdrawing…' : 'Withdraw lot'}
              </Button>
            </div>
          </>
        )}
      </Dialog>
    </div>
  )
}

export default FarmerListings
