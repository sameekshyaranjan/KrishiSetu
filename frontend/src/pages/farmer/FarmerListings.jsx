import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import cropService from '@/services/cropService'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  Sprout, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  X, 
  UploadCloud, 
  Gavel, 
  FileText, 
  Download, 
  CheckCircle2, 
  RefreshCw,
  Package,
  Layers,
  Sparkles,
  Trash2,
  Camera,
  Image as ImageIcon
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

export const FarmerListings = () => {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'available' | 'sold'
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedLotForPass, setSelectedLotForPass] = useState(null)
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

  const handleDeleteListing = async (cropId, cropName) => {
    if (!window.confirm(`Are you sure you want to withdraw "${cropName}" from the marketplace?`)) return

    try {
      await cropService.deleteListing(cropId)
      setListings((prev) => prev.filter((c) => c._id !== cropId))
      toast.success(`Crop lot "${cropName}" withdrawn.`)
    } catch (err) {
      toast.error('Failed to withdraw listing.')
    }
  }

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' 
        ? item.status !== 'withdrawn' && item.status !== 'removed'
        : item.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [listings, searchQuery, statusFilter])

  return (
    <div className="space-y-8">
      
      {/* 1. Header & Primary Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-2">
            <Package className="w-3.5 h-3.5" />
            <span>Farm Gate Harvest Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            My Harvest Inventory & Crop Lots
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Create crop listings with multiple photo uploads, monitor live buyer bids, and generate APMC passes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-xl text-xs font-bold shadow-md h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Post New Crop Lot
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadListings} 
            disabled={loading}
            className="rounded-xl text-xs shadow-sm h-11 px-4"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              statusFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            All Lots ({listings.length})
          </button>
          <button
            onClick={() => setStatusFilter('available')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'available'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Live in Auction ({listings.filter(l => l.status === 'available').length})
          </button>
          <button
            onClick={() => setStatusFilter('sold')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'sold'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-muted-foreground" />
            Sold & Dispatched ({listings.filter(l => l.status === 'sold').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your crop lots..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
          />
        </div>
      </div>

      {/* 3. Crop Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((crop) => {
          const isSold = crop.status === 'sold'
          const primaryImage = crop.images?.[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop'
          const totalPhotos = crop.images?.length || 1

          return (
            <div 
              key={crop._id} 
              className="group rounded-3xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Crop Image & Badges */}
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <img 
                    src={primaryImage} 
                    alt={crop.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md bg-background/90 text-foreground border border-border shadow-sm">
                      {crop.category}
                    </span>
                    {crop.cropType && (
                      <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold backdrop-blur-md bg-black/60 text-white">
                        {crop.cropType}
                      </span>
                    )}
                  </div>
                  
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {totalPhotos > 1 && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold backdrop-blur-md bg-black/70 text-white flex items-center gap-1">
                        <Camera className="w-3 h-3" /> {totalPhotos} photos
                      </span>
                    )}
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold tracking-wide backdrop-blur-md border shadow-sm ${
                      isSold 
                        ? 'bg-muted/90 text-muted-foreground border-border'
                        : 'bg-emerald-500/90 text-white border-emerald-400'
                    }`}>
                      {isSold ? 'Sold' : 'Live 🟢'}
                    </span>
                  </div>

                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold backdrop-blur-md bg-black/70 text-white">
                    {crop.quantity} {crop.unit || 'Quintals'}
                  </span>
                </div>

                {/* Details Section */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {crop.name}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>{crop.district || user?.district || 'Hassan'}, Karnataka</span>
                    </p>
                  </div>

                  {crop.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {crop.description}
                    </p>
                  )}

                  {/* Price Matrix */}
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-medium">Your Reserve:</span>
                      <span className="font-mono font-bold text-foreground">
                        ₹{crop.basePrice?.toLocaleString('en-IN')}/Qtl
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-600 font-semibold block flex items-center justify-end gap-0.5">
                        <TrendingUp className="w-3.5 h-3.5" /> Highest Inbound:
                      </span>
                      <span className="font-black text-sm text-primary">
                        ₹{(crop.currentHighestBid || crop.basePrice)?.toLocaleString('en-IN')}/Qtl
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Gavel className="w-3.5 h-3.5 text-amber-500" /> {crop.bidsCount || 0} Inbound Offers
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">Verified Farm Gate</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-5 pt-0 border-t border-border/60 flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setSelectedLotForPass(crop)}
                  className="flex-1 rounded-xl text-xs font-semibold h-9"
                >
                  <FileText className="w-3.5 h-3.5 mr-1" /> Lot Pass
                </Button>
                <Button asChild size="sm" className="flex-1 rounded-xl text-xs font-semibold h-9 shadow-sm">
                  <Link to="/farmer/bids">
                    Review Bids
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteListing(crop._id, crop.name)}
                  className="rounded-xl text-xs h-9 px-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10"
                  title="Withdraw Lot"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredListings.length === 0 && !loading && (
        <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
          <p className="text-base font-bold text-foreground">No harvest lots found matching your filter</p>
          <p className="text-xs text-muted-foreground">Post your first crop lot to begin receiving bids from APMC wholesale traders.</p>
          <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-1.5" /> Post New Crop Lot
          </Button>
        </div>
      )}

      {/* 4. Single Unified Form Modal with Crop Type Dropdown + Multi-Photo Upload */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Post Harvest Crop Lot</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
                Create New Crop Listing
              </h2>
              <p className="text-xs text-muted-foreground">
                Select your crop type, upload photos, and provide your title, quantity, and reserve pricing.
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5 text-xs">
              
              {/* SECTION 1: Multiple Photos Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-primary" /> 1. Upload Photos ({photoPreviews.length}/5)
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    Upload up to 5 harvest photos (Cloudinary CDN optimized)
                  </span>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleMultipleFilesChange}
                  className="hidden"
                />

                {/* Photos Preview Grid + Upload Trigger */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {photoPreviews.map((photo, index) => (
                    <div key={index} className="relative h-24 rounded-2xl overflow-hidden border border-border group bg-muted">
                      <img src={photo} alt={`Crop photo ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 shadow-md transition-opacity"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white font-mono">
                        #{index + 1}
                      </span>
                    </div>
                  ))}

                  {/* Add Photo Button (if less than 5) */}
                  {photoPreviews.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-24 rounded-2xl border-2 border-dashed border-border hover:border-primary bg-muted/20 hover:bg-muted/40 transition-all flex flex-col items-center justify-center gap-1 text-center p-2 cursor-pointer group"
                    >
                      <UploadCloud className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-[10px] font-bold text-foreground group-hover:text-primary">
                        + Add Photos
                      </span>
                      <span className="text-[8px] text-muted-foreground">PNG, JPG, WEBP</span>
                    </button>
                  )}
                </div>
              </div>

              {/* SECTION 2: Crop Type & Title */}
              <div className="space-y-4 pt-2 border-t border-border">
                <label className="font-bold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-primary" /> 2. Crop Commodity & Title
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Clean Crop Type Dropdown (Tomato, Onion, etc.) */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground">Crop Type *</label>
                    <select
                      value={formData.cropType}
                      onChange={(e) => handleCropTypeChange(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                    >
                      {CROP_TYPES.map((crop) => (
                        <option key={crop.name} value={crop.name}>
                          {crop.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Custom Lot Title Input */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground">Listing Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Hybrid Bangalore Tomato Grade-A (80 Quintals)"
                      className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground">Commodity Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                    >
                      <option value="vegetables">Vegetables (ತರಕಾರಿಗಳು)</option>
                      <option value="grains">Grains & Cereals (ಧಾನ್ಯಗಳು)</option>
                      <option value="spices">Spices & Cash Crops (ಮಸಾಲೆ ಬೆಳೆಗಳು)</option>
                      <option value="fruits">Fruits (ಹಣ್ಣುಗಳು)</option>
                      <option value="pulses">Pulses & Legumes (ಕಾಳುಗಳು)</option>
                    </select>
                  </div>

                  {/* District / Market Yard */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground">District / APMC Yard *</label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                    >
                      {KARNATAKA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d} APMC Market Yard</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Quantity, Unit & Pricing */}
              <div className="space-y-4 pt-2 border-t border-border">
                <label className="font-bold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-primary" /> 3. Quantity & Pricing
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground">Total Quantity *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground">Unit</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                    >
                      <option value="quintal">Quintals (100 kg)</option>
                      <option value="ton">Metric Tons (1000 kg)</option>
                      <option value="crate">Crates (25 kg)</option>
                      <option value="bag">Gunny Bags (50 kg)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground">Reserve Price (₹/Unit) *</label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono font-bold text-primary"
                    />
                  </div>
                </div>

                {/* Gross Lot Valuation Card */}
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-semibold block">Estimated Gross Value:</span>
                    <span className="text-base font-black text-primary font-mono">
                      ₹{(Number(formData.quantity) * Number(formData.basePrice)).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                    0% Platform Commission
                  </span>
                </div>

                {/* Description & Additional Details */}
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Detailed Description & Harvest Notes</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mention variety, grading, harvest date, moisture content, packaging, or pickup instructions..."
                    className="w-full p-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed"
                  />
                </div>
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl text-xs h-11 px-5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl text-xs font-bold h-11 px-7 bg-primary text-primary-foreground shadow-md"
                >
                  {submitting ? 'Publishing Lot...' : 'Publish Crop Lot 🚀'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Printable APMC Lot Pass Modal */}
      {selectedLotForPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">
                    APMC Electronic Lot Pass
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Pass #{selectedLotForPass._id}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLotForPass(null)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Producer:</span>
                <span className="font-bold text-foreground">{user?.name || 'Ramesh Gowda'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Produce:</span>
                <span className="font-bold text-foreground">{selectedLotForPass.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lot Quantity:</span>
                <span className="font-mono font-bold text-foreground">{selectedLotForPass.quantity} {selectedLotForPass.unit || 'Qtl'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Declared Reserve:</span>
                <span className="font-mono font-bold text-primary">₹{selectedLotForPass.basePrice}/Qtl</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <Button 
                onClick={() => {
                  window.print()
                  toast.success('Lot pass dispatched to printer!')
                }}
                className="w-full rounded-xl text-xs font-bold h-10 bg-primary text-primary-foreground shadow-md"
              >
                <Download className="w-4 h-4 mr-1.5" /> Print Gate Certificate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FarmerListings
