import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import toast from 'react-hot-toast'
import storageService from '@/services/storageService'
import { 
  Snowflake, 
  MapPin, 
  Phone, 
  Navigation, 
  Search, 
  Filter, 
  ShieldCheck, 
  Sun, 
  Clock, 
  Thermometer, 
  Layers, 
  Building2, 
  Compass, 
  ArrowRight,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Calendar,
  PackageCheck
} from 'lucide-react'

// All 31 Karnataka Districts supported
const KARNATAKA_DISTRICTS = [
  'All Districts',
  'Bagalkot', 'Bengaluru Urban', 'Bengaluru Rural', 'Belagavi', 'Ballari', 
  'Bidar', 'Vijayapura', 'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 
  'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 
  'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 
  'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 
  'Yadgir', 'Vijayanagara'
]

// Custom Leaflet Pin Icon Creator
const createCustomPinIcon = (isGov, isSelected) => {
  const bg = isGov ? '#059669' : '#3b82f6'
  const border = isSelected ? '#ffffff' : 'rgba(255,255,255,0.85)'
  const scale = isSelected ? 'scale(1.25)' : 'scale(1)'
  const ring = isSelected ? 'box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.5);' : 'box-shadow: 0 4px 12px rgba(0,0,0,0.3);'

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        transform: ${scale};
        transition: all 0.2s ease-in-out;
        background-color: ${bg};
        border: 2px solid ${border};
        ${ring}
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform-origin: bottom left;
        transform: rotate(-45deg) ${scale};
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <line x1="12" y1="2" x2="12" y2="22"></line>
            <path d="m20 16-4-4 4-4"></path>
            <path d="m4 8 4 4-4 4"></path>
            <path d="m16 4-4 4-4-4"></path>
            <path d="m8 20 4-4 4 4"></path>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
}

const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div style="
        position: relative;
        width: 22px;
        height: 22px;
      ">
        <div style="
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.4);
          animation: pulse 1.5s infinite;
        "></div>
        <div style="
          position: absolute;
          top: 3px;
          left: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ef4444;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  })
}

export const ColdStorage = () => {
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts')
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'govt', 'private', 'solar', 'ca'
  const [selectedFacility, setSelectedFacility] = useState(null)
  
  // Geolocation states
  const [userLocation, setUserLocation] = useState(null)
  const [locatingUser, setLocatingUser] = useState(false)

  // Inquiry Modal State
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false)
  const [inquiryFacility, setInquiryFacility] = useState(null)
  const [inquiryForm, setInquiryForm] = useState({
    farmerName: '',
    phone: '',
    cropName: '',
    quantityMT: 10,
    arrivalDate: '',
    durationDays: 30
  })

  // Leaflet Map Refs
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersLayerRef = useRef(null)
  const userMarkerRef = useRef(null)

  // Fetch facilities on mount
  useEffect(() => {
    loadFacilities()
  }, [])

  const loadFacilities = async () => {
    setLoading(true)
    try {
      const data = await storageService.getAllStorages()
      setFacilities(data)
    } catch (err) {
      toast.error('Could not load cold storage network')
    } finally {
      setLoading(false)
    }
  }

  // Filter facilities based on search, district, and quick chip
  const filteredFacilities = useMemo(() => {
    return facilities.filter(f => {
      // District filter
      if (selectedDistrict !== 'All Districts' && f.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
        return false
      }

      // Chip filter
      if (activeFilter === 'govt' && !f.isGovernmentOwned) return false
      if (activeFilter === 'private' && f.isGovernmentOwned) return false
      if (activeFilter === 'solar' && !f.isSolarPowered) return false
      if (activeFilter === 'ca' && !(f.chamberType?.toLowerCase().includes('ca') || f.chamberType?.toLowerCase().includes('controlled'))) return false

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchName = f.name?.toLowerCase().includes(query)
        const matchAddress = f.address?.toLowerCase().includes(query)
        const matchDistrict = f.district?.toLowerCase().includes(query)
        const matchChamber = f.chamberType?.toLowerCase().includes(query)
        const matchCommodity = f.commoditiesSupported?.some(c => c.toLowerCase().includes(query))
        return matchName || matchAddress || matchDistrict || matchChamber || matchCommodity
      }

      return true
    })
  }, [facilities, selectedDistrict, activeFilter, searchQuery])

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapInstanceRef.current) {
      // Centered on Karnataka geographical midpoint [14.5204, 75.7224]
      const map = L.map(mapContainerRef.current, {
        center: [14.5204, 75.7224],
        zoom: 7,
        scrollWheelZoom: true,
        zoomControl: true
      })

      // Standard high-performance OpenStreetMap tiles (100% free, no watermark)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map)

      markersLayerRef.current = L.layerGroup().addTo(map)
      mapInstanceRef.current = map
    }

    return () => {
      // cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Sync Leaflet markers whenever filtered facilities or selectedFacility changes
  useEffect(() => {
    const map = mapInstanceRef.current
    const layer = markersLayerRef.current
    if (!map || !layer) return

    layer.clearLayers()

    filteredFacilities.forEach(facility => {
      const coords = facility.location?.coordinates
      if (!coords || coords.length < 2) return

      const lng = coords[0]
      const lat = coords[1]
      const isSelected = selectedFacility?._id === facility._id
      const markerIcon = createCustomPinIcon(facility.isGovernmentOwned, isSelected)

      const marker = L.marker([lat, lng], { icon: markerIcon })

      const popupContent = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 220px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; background: ${facility.isGovernmentOwned ? 'rgba(5,150,105,0.15)' : 'rgba(59,130,246,0.15)'}; color: ${facility.isGovernmentOwned ? '#059669' : '#2563eb'};">
              ${facility.isGovernmentOwned ? 'KSWC / GOVT' : 'PRIVATE OPERATOR'}
            </span>
            <span style="font-size: 11px; font-weight: 700; color: #059669;">₹${facility.costPerDay}/MT/day</span>
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #1e293b;">${facility.name}</h4>
          <p style="margin: 0 0 6px 0; color: #64748b; font-size: 11px;">${facility.address}</p>
          <div style="display: flex; gap: 6px; margin-bottom: 8px; font-size: 10px; color: #475569;">
            <span>📦 <strong>${facility.availableCapacity || Math.round(facility.capacity * 0.7)}</strong> MT Avail.</span>
            <span>🌡️ <strong>${facility.temperatureRange || '2°C to 8°C'}</strong></span>
          </div>
          <div style="display: flex; gap: 6px; margin-top: 6px;">
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="flex: 1; text-align: center; background: #059669; color: #ffffff; padding: 4px 8px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 10px; display: inline-flex; align-items: center; justify-content: center; gap: 4px;"
            >
              Google Maps
            </a>
            <a 
              href="tel:${facility.contactNumber}"
              style="background: #f1f5f9; color: #0f172a; padding: 4px 8px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 10px; border: 1px solid #cbd5e1;"
            >
              Call
            </a>
          </div>
        </div>
      `

      marker.bindPopup(popupContent, { maxWidth: 280 })
      marker.on('click', () => {
        setSelectedFacility(facility)
      })

      layer.addLayer(marker)
    })

    // If user filtered down to a specific district, pan map to first facility
    if (selectedDistrict !== 'All Districts' && filteredFacilities.length > 0) {
      const first = filteredFacilities[0].location?.coordinates
      if (first) {
        map.flyTo([first[1], first[0]], 10, { duration: 1.2 })
      }
    }
  }, [filteredFacilities, selectedFacility, selectedDistrict])

  // Pan to selected facility when user clicks card
  const handleSelectFacility = (facility) => {
    setSelectedFacility(facility)
    const coords = facility.location?.coordinates
    if (coords && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([coords[1], coords[0]], 12, { duration: 1.0 })
    }
  }

  // Handle GPS "Locate Near Me"
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setLocatingUser(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setLocatingUser(false)
        toast.success('Your location detected! Sorting facilities by distance.')

        // Drop user marker on map
        if (mapInstanceRef.current) {
          if (userMarkerRef.current) {
            userMarkerRef.current.remove()
          }

          const userPin = L.marker([latitude, longitude], {
            icon: createUserLocationIcon()
          }).addTo(mapInstanceRef.current)
          
          userPin.bindPopup('<b>📍 Your Current Location</b>').openPopup()
          userMarkerRef.current = userPin

          mapInstanceRef.current.flyTo([latitude, longitude], 10, { duration: 1.5 })
        }

        // Fetch / calculate proximity
        try {
          const nearby = await storageService.getNearbyStorages(latitude, longitude, 150)
          setFacilities(nearby)
        } catch (err) {
          console.error('Proximity sorting failed', err)
        }
      },
      (err) => {
        setLocatingUser(false)
        toast.error('Unable to retrieve location. Please permit GPS access.')
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  // Handle Inquiry Form Submission
  const handleInquirySubmit = (e) => {
    e.preventDefault()
    if (!inquiryForm.farmerName || !inquiryForm.phone) {
      toast.error('Please provide your name and contact phone number')
      return
    }

    const estimatedTotal = Math.round(
      (inquiryFacility?.costPerDay || 30) * 
      Number(inquiryForm.quantityMT) * 
      Number(inquiryForm.durationDays)
    )

    toast.success(
      `Inquiry for ${inquiryForm.quantityMT} MT submitted to ${inquiryFacility?.name}! Est. Cost: ₹${estimatedTotal.toLocaleString()}`,
      { duration: 5000 }
    )

    setInquiryModalOpen(false)
  }

  // Calculated totals
  const totalCapacityMT = useMemo(() => {
    return facilities.reduce((acc, curr) => acc + (curr.capacity || 0), 0)
  }, [facilities])

  const totalAvailableMT = useMemo(() => {
    return facilities.reduce((acc, curr) => acc + (curr.availableCapacity || Math.round(curr.capacity * 0.7)), 0)
  }, [facilities])

  const govtCount = useMemo(() => {
    return facilities.filter(f => f.isGovernmentOwned).length
  }, [facilities])

  return (
    <div className="min-h-screen bg-background pb-16">
      
      {/* Top Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-muted/50 via-background to-background pt-8 pb-10">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-3">
                <Snowflake className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Karnataka State Warehousing & Cold Chain Grid</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Cold Storage & Logistics Locator
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                Browse 40+ certified cold storage hubs, KSWC climate silos, and Controlled Atmosphere (CA) facilities across all 31 districts of Karnataka with live GPS navigation.
              </p>
            </div>

            {/* GPS Locator Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLocateMe}
                disabled={locatingUser}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                <Compass className={`w-4 h-4 ${locatingUser ? 'animate-spin' : ''}`} />
                <span>{locatingUser ? 'Detecting GPS...' : 'Find Facilities Near Me'}</span>
              </button>
            </div>
          </div>

          {/* Metric Highlights Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/60">
            <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span>Verified Facilities</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-foreground mt-1">
                {facilities.length > 0 ? facilities.length : '40+'}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">Across 31 Districts</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Layers className="w-3.5 h-3.5 text-blue-500" />
                <span>Total Capacity</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-foreground mt-1">
                {totalCapacityMT > 0 ? `${(totalCapacityMT / 1000).toFixed(0)}k MT` : '240k MT'}
              </div>
              <span className="text-[10px] text-muted-foreground">Metric Ton Storage</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Govt / KSWC Hubs</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-foreground mt-1">
                {govtCount}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">Subsidized Tariff</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <PackageCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Live Space Available</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-foreground mt-1">
                {totalAvailableMT > 0 ? `${(totalAvailableMT / 1000).toFixed(0)}k MT` : '150k MT'}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">Ready for intake</span>
            </div>
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">

        {/* Filter & Search Bar */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by facility name, commodity (Potatoes, Apples, Tomatoes), or city..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* District Dropdown */}
            <div>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-background border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {KARNATAKA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-muted-foreground font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </span>

            {[
              { id: 'all', label: 'All Facilities' },
              { id: 'govt', label: '🏛️ Govt Subsidized (KSWC)' },
              { id: 'private', label: '🏢 Private Cold Chains' },
              { id: 'solar', label: '⚡ Solar-Powered' },
              { id: 'ca', label: '❄️ CA / Deep Freeze' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  activeFilter === tab.id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {(searchQuery || selectedDistrict !== 'All Districts' || activeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedDistrict('All Districts')
                  setActiveFilter('all')
                }}
                className="text-rose-500 hover:text-rose-600 font-semibold px-2 py-1 rounded hover:bg-rose-500/10 ml-auto whitespace-nowrap"
              >
                Reset All
              </button>
            )}
          </div>
        </div>

        {/* Split Interactive View: Map on Left / Cards on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Map Column (Sticky on Desktop) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">Interactive Karnataka Grid Map</h2>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                  Govt / KSWC
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  Private Chain
                </span>
              </div>
            </div>

            {/* Leaflet Map Canvas */}
            <div className="w-full h-[450px] lg:h-[620px] rounded-2xl overflow-hidden border border-border shadow-sm relative z-0">
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>
            <p className="text-[11px] text-muted-foreground text-center">
              💡 Click any marker pin to view facility tariffs, manager contact details, and driving directions.
            </p>
          </div>

          {/* Facility Cards List Column */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Showing {filteredFacilities.length} Facilities
              </span>
              {userLocation && (
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Sorted by GPS proximity
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-44 rounded-2xl bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : filteredFacilities.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-2xl bg-card border border-dashed border-border space-y-3">
                <Snowflake className="w-10 h-10 text-muted-foreground/50 mx-auto" />
                <h3 className="text-base font-bold text-foreground">No cold storages found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  No facility matching "{searchQuery}" in {selectedDistrict}. Try clearing filters to view nearby district hubs.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedDistrict('All Districts')
                    setActiveFilter('all')
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90"
                >
                  View All Facilities
                </button>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[620px] overflow-y-auto pr-1">
                {filteredFacilities.map((facility) => {
                  const isSelected = selectedFacility?._id === facility._id
                  const availableMT = facility.availableCapacity || Math.round(facility.capacity * 0.7)
                  const availabilityPct = Math.round((availableMT / facility.capacity) * 100)
                  const coords = facility.location?.coordinates

                  return (
                    <div
                      key={facility._id}
                      onClick={() => handleSelectFacility(facility)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative ${
                        isSelected
                          ? 'bg-card border-primary ring-2 ring-primary/20 shadow-md scale-[1.01]'
                          : 'bg-card hover:bg-muted/40 border-border shadow-xs'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            facility.isGovernmentOwned 
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                              : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
                          }`}>
                            {facility.isGovernmentOwned ? '🏛️ KSWC / Govt Subsidized' : '🏢 Certified Private'}
                          </span>

                          {facility.isSolarPowered && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1">
                              <Sun className="w-2.5 h-2.5" /> Solar
                            </span>
                          )}
                        </div>

                        {facility.distanceKm !== undefined && (
                          <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            {facility.distanceKm} km away
                          </span>
                        )}
                      </div>

                      {/* Name & Address */}
                      <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug">
                        {facility.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1 leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <span>{facility.address}</span>
                      </p>

                      {/* Specs Row */}
                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/60 text-xs">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Chamber & Temp</span>
                          <span className="font-semibold text-foreground flex items-center gap-1 text-[11px] mt-0.5">
                            <Thermometer className="w-3 h-3 text-cyan-500 shrink-0" />
                            {facility.temperatureRange || '2°C to 8°C'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Tariff Rate</span>
                          <span className="font-bold text-emerald-600 text-xs mt-0.5 block">
                            ₹{facility.costPerDay} <span className="text-[10px] font-normal text-muted-foreground">/ MT / Day</span>
                          </span>
                        </div>
                      </div>

                      {/* Capacity Bar */}
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">Available Space:</span>
                          <span className="font-bold text-foreground">
                            {availableMT.toLocaleString()} / {facility.capacity?.toLocaleString()} MT ({availabilityPct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(availabilityPct, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Commodities Supported */}
                      {facility.commoditiesSupported && facility.commoditiesSupported.length > 0 && (
                        <div className="mt-2.5 flex items-center gap-1 flex-wrap">
                          {facility.commoditiesSupported.slice(0, 4).map((c) => (
                            <span key={c} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                              {c}
                            </span>
                          ))}
                          {facility.commoditiesSupported.length > 4 && (
                            <span className="text-[9px] text-muted-foreground font-medium">
                              +{facility.commoditiesSupported.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-border/60">
                        {coords && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 py-1.5 px-2 rounded-xl bg-muted/80 hover:bg-muted text-foreground text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Navigation className="w-3.5 h-3.5 text-primary" />
                            <span>Navigate</span>
                          </a>
                        )}

                        <a
                          href={`tel:${facility.contactNumber}`}
                          onClick={(e) => e.stopPropagation()}
                          className="py-1.5 px-3 rounded-xl bg-card border border-border hover:bg-muted text-foreground text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Call</span>
                        </a>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setInquiryFacility(facility)
                            setInquiryModalOpen(true)
                          }}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold inline-flex items-center justify-center gap-1 shadow-xs transition-colors"
                        >
                          <span>Request Space</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                    </div>
                  )
                })}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Booking / Space Inquiry Modal */}
      {inquiryModalOpen && inquiryFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  RESERVATION INQUIRY
                </span>
                <h3 className="text-lg font-bold text-foreground mt-1">
                  {inquiryFacility.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tariff: ₹{inquiryFacility.costPerDay}/MT/Day • {inquiryFacility.district}
                </p>
              </div>
              <button
                onClick={() => setInquiryModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1">Farmer / Entity Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Gowda"
                  value={inquiryForm.farmerName}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, farmerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/30 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Contact Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98450 12345"
                  value={inquiryForm.phone}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/30 outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Crop / Commodity</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Potatoes, Apples"
                    value={inquiryForm.cropName}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, cropName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/30 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">Quantity (MT)</label>
                  <input
                    type="number"
                    min="1"
                    max={inquiryFacility.capacity || 5000}
                    value={inquiryForm.quantityMT}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, quantityMT: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/30 outline-none text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Expected Arrival Date</label>
                  <input
                    type="date"
                    value={inquiryForm.arrivalDate}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, arrivalDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/30 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={inquiryForm.durationDays}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, durationDays: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/30 outline-none text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Dynamic Estimated Cost Box */}
              <div className="p-3 rounded-xl bg-muted/60 border border-border space-y-1 mt-2">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Estimated Total Tariff:</span>
                  <span className="font-mono text-foreground font-bold">
                    ₹{inquiryFacility.costPerDay} × {inquiryForm.quantityMT} MT × {inquiryForm.durationDays} Days
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-1 border-t border-border/60">
                  <span className="text-xs font-bold text-foreground">Estimated Total Cost:</span>
                  <span className="text-base font-black text-emerald-600 font-mono">
                    ₹{(inquiryFacility.costPerDay * Number(inquiryForm.quantityMT || 0) * Number(inquiryForm.durationDays || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setInquiryModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border font-bold text-xs text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-colors"
                >
                  Confirm & Send Request
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}

export default ColdStorage
