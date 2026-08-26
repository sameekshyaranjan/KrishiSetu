import { useState, useEffect, useMemo } from 'react'
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
  Sparkles
} from 'lucide-react'

const CROP_PRESETS = [
  { name: 'Tomato (Hybrid Bangalore Grade A)', category: 'vegetables', defaultPrice: 2200, img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop' },
  { name: 'Red Onion (Bellary Medium)', category: 'vegetables', defaultPrice: 2550, img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop' },
  { name: 'Maize (Yellow Commercial)', category: 'grains', defaultPrice: 2100, img: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop' },
  { name: 'Ragi (Finger Millet - Organic)', category: 'grains', defaultPrice: 3500, img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop' },
  { name: 'Cotton (Kapas Long Staple)', category: 'spices', defaultPrice: 7250, img: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600&auto=format&fit=crop' },
  { name: 'Paddy (Sona Masuri Grade A)', category: 'grains', defaultPrice: 2850, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop' }
]

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

  // New Listing Form State
  const [formData, setFormData] = useState({
    name: CROP_PRESETS[0].name,
    category: CROP_PRESETS[0].category,
    quantity: 50,
    unit: 'quintal',
    basePrice: CROP_PRESETS[0].defaultPrice,
    harvestStatus: 'ready_for_pickup',
    description: 'Freshly harvested crop directly from farm, cleaned and sorted by grade.',
    image: CROP_PRESETS[0].img
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

  const handlePresetSelect = (preset) => {
    setFormData({
      ...formData,
      name: preset.name,
      category: preset.category,
      basePrice: preset.defaultPrice,
      image: preset.img
    })
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const newListing = {
        _id: `crop-${Date.now()}`,
        ...formData,
        bidsCount: 0,
        currentHighestBid: formData.basePrice,
        status: 'available',
        district: user?.district || 'Kolar',
        createdAt: new Date().toISOString(),
        images: [formData.image]
      }

      setListings([newListing, ...listings])
      toast.success(`Lot for "${formData.name}" published to APMC marketplace!`)
      setIsCreateModalOpen(false)
    } catch {
      toast.error('Failed to create listing. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [listings, searchQuery, statusFilter])

  return (
    <div className="space-y-8">
      
      {/* 1. Header & Actions */}
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
            List fresh harvest lots, monitor inbound trader bids in real-time, and generate APMC gate passes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-xl text-xs font-bold shadow-md h-10 px-5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Post New Crop Lot
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadListings} 
            disabled={loading}
            className="rounded-xl text-xs shadow-sm h-10"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Filter Tabs & Search Bar */}
      <div className="p-4 rounded-3xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by crop name or variety..."
              className="w-full h-10 pl-10 pr-3 rounded-2xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center bg-muted/60 p-1 rounded-2xl border border-border text-xs font-semibold shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Lots ({listings.length})
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'available' ? 'bg-card text-emerald-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Active Bidding ({listings.filter(l => l.status === 'available').length})
            </button>
            <button
              onClick={() => setStatusFilter('sold')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'sold' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sold / In Escrow ({listings.filter(l => l.status === 'sold').length})
            </button>
          </div>
        </div>
      </div>

      {/* 3. Crop Lots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((crop) => {
          const isSold = crop.status === 'sold'

          return (
            <div 
              key={crop._id}
              className="rounded-3xl bg-card border border-border hover:border-primary/50 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative h-48 w-full bg-muted overflow-hidden">
                  <img 
                    src={crop.images?.[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop'} 
                    alt={crop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-background/90 backdrop-blur text-[10px] font-bold uppercase tracking-wider text-foreground shadow-sm border border-border">
                      {crop.category || 'Agricultural'}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur shadow-sm ${
                      isSold 
                        ? 'bg-rose-500/90 text-white' 
                        : 'bg-emerald-500/90 text-white'
                    }`}>
                      {isSold ? 'Sold / In Escrow' : 'Open for Bids'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-background/90 backdrop-blur text-xs font-semibold border border-border">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary" /> {crop.district || user?.district || 'Karnataka'}
                    </span>
                    <span className="text-foreground font-bold">
                      {crop.quantity} {crop.unit || 'Quintals'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-extrabold text-lg text-foreground tracking-tight leading-snug">
                      {crop.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {crop.description || 'Verified farm-direct produce ready for APMC logistics pickup.'}
                    </p>
                  </div>

                  {/* Price Comparison Card */}
                  <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">My Reserve Price:</span>
                      <span className="font-bold text-foreground">
                        ₹{crop.basePrice?.toLocaleString('en-IN')}/Qtl
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/60">
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> Highest Inbound Bid:
                      </span>
                      <span className="font-black text-sm text-primary">
                        ₹{(crop.currentHighestBid || crop.basePrice).toLocaleString('en-IN')}/Qtl
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Gavel className="w-3.5 h-3.5 text-amber-500" /> {crop.bidsCount || 0} Inbound Offers
                    </span>
                    <span>Ready for dispatch</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-5 pt-0 border-t border-border/60 flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setSelectedLotForPass(crop)}
                  className="w-1/2 rounded-xl text-xs font-semibold h-9"
                >
                  <FileText className="w-3.5 h-3.5 mr-1" /> Lot Pass
                </Button>
                <Button asChild size="sm" className="w-1/2 rounded-xl text-xs font-semibold h-9 shadow-sm">
                  <Link to="/farmer/dashboard">
                    Review Bids
                  </Link>
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
          <p className="text-xs text-muted-foreground">Post your first crop lot to begin receiving bids from APMC traders.</p>
          <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-1.5" /> Post New Crop Lot
          </Button>
        </div>
      )}

      {/* 4. Interactive "Post New Crop Lot" Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5" /> Direct APMC Marketplace Listing
              </div>
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                Post New Harvest Lot
              </h2>
              <p className="text-xs text-muted-foreground">
                List your produce directly to verified APMC traders across Karnataka with 0% brokerage.
              </p>
            </div>

            {/* Quick Crop Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Quick Select Common Karnataka Crops:
              </label>
              <div className="flex flex-wrap gap-2">
                {CROP_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      formData.name === p.name 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted border border-border'
                    }`}
                  >
                    {p.name.split(' ')[0]} (₹{p.defaultPrice}/Qtl)
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-1">
              
              {/* Crop Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Crop Name & Variety</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Grid: Category & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="vegetables">Vegetables</option>
                    <option value="grains">Food Grains / Cereals</option>
                    <option value="pulses">Pulses & Dal</option>
                    <option value="fruits">Fruits & Horticulture</option>
                    <option value="spices">Spices & Commercial Crops</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Total Quantity (Quintals)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              {/* Grid: Base Price & Harvest Readiness */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Reserve Base Price (₹ / Quintal)
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <span className="text-[10px] text-muted-foreground block">
                    Traders cannot bid below this floor price.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Harvest Readiness</label>
                  <select
                    value={formData.harvestStatus}
                    onChange={(e) => setFormData({ ...formData, harvestStatus: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="ready_for_pickup">Harvested & Ready for Pickup</option>
                    <option value="harvesting_in_3_days">Harvesting in 3 Days</option>
                    <option value="standing_crop">Standing Crop (1-2 Weeks)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Lot Quality & Storage Notes</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl text-xs font-bold shadow-md px-6 bg-primary text-primary-foreground"
                >
                  {submitting ? 'Publishing...' : 'Publish Lot to Market'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Digital APMC Lot Gate Pass Modal */}
      {selectedLotForPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            <button
              onClick={() => setSelectedLotForPass(null)}
              className="absolute right-5 top-5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Pass Header */}
            <div className="text-center space-y-1 border-b border-border pb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-foreground pt-1">
                APMC Market Gate Pass
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Government eNAM & APMC Verified Transit Slip
              </p>
            </div>

            {/* Pass Content */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lot ID:</span>
                <span className="font-mono font-bold text-foreground">{selectedLotForPass._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Crop Name:</span>
                <span className="font-bold text-foreground">{selectedLotForPass.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-bold text-foreground">{selectedLotForPass.quantity} Quintals</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Farmer Owner:</span>
                <span className="font-bold text-foreground">{user?.name || 'Lori Osinski-Rodriguez'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Origin District:</span>
                <span className="font-bold text-foreground">{selectedLotForPass.district || user?.district || 'Karnataka'}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-border/60">
                <span className="text-muted-foreground">Floor Reserve:</span>
                <span className="font-extrabold text-primary">₹{selectedLotForPass.basePrice?.toLocaleString('en-IN')}/Qtl</span>
              </div>
            </div>

            <Button
              onClick={() => {
                toast.success('Digital APMC Gate Pass printed/downloaded!')
                setSelectedLotForPass(null)
              }}
              className="w-full rounded-2xl font-bold text-xs h-10 shadow-md"
            >
              <Download className="w-4 h-4 mr-2" /> Download Official Gate Pass
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FarmerListings
