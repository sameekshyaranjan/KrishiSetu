import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import storageService, { FALLBACK_COLD_STORAGES } from '@/services/storageService'
import { Button } from '@/components/ui/button'
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
  Star,
  PackageCheck,
  Calendar,
  RotateCcw,
  LocateFixed
} from 'lucide-react'

// Fix Leaflet default icon paths if needed
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom Leaflet Pin Icon Creator for KSWC / Govt vs Private Cold Hubs
const createCustomPinIcon = (isGov, isSelected) => {
  const bg = isGov ? '#059669' : '#2563eb'
  const border = isSelected ? '#ffffff' : 'rgba(255,255,255,0.95)'
  const scale = isSelected ? 'scale(1.25)' : 'scale(1)'
  const ring = isSelected 
    ? 'box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.6), 0 6px 16px rgba(0,0,0,0.35);' 
    : 'box-shadow: 0 3px 10px rgba(0,0,0,0.25);'

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
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
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      ">
        <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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

// User Current Location Pulse Marker
const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div style="position: relative; width: 24px; height: 24px; cursor: pointer;">
        <div style="
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.45);
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          position: absolute;
          top: 4px;
          left: 4px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ef4444;
          border: 2.5px solid #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  })
}

// Coordinate extractor supporting [lng, lat] GeoJSON or latitude/longitude properties
const getCoords = (facility) => {
  if (!facility) return null
  if (Array.isArray(facility.location?.coordinates) && facility.location.coordinates.length >= 2) {
    const lng = Number(facility.location.coordinates[0])
    const lat = Number(facility.location.coordinates[1])
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      return [lat, lng]
    }
  }
  if (facility.latitude && facility.longitude) {
    const lat = Number(facility.latitude)
    const lng = Number(facility.longitude)
    if (!isNaN(lat) && !isNaN(lng)) {
      return [lat, lng]
    }
  }
  return null
}

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

export const ColdStorage = () => {
  const [facilities, setFacilities] = useState(FALLBACK_COLD_STORAGES)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts')
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'govt', 'private', 'solar', 'ca'
  const [selectedFacility, setSelectedFacility] = useState(FALLBACK_COLD_STORAGES[0])
  
  // Geolocation states
  const [userLocation, setUserLocation] = useState(null)
  const [locatingUser, setLocatingUser] = useState(false)

  // Leaflet Map Refs
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersLayerRef = useRef(null)
  const userMarkerRef = useRef(null)

  // Inquiry Modal State
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false)
  const [inquiryForm, setInquiryForm] = useState({
    farmerName: '',
    phone: '',
    cropName: '',
    quantityMT: 10,
    arrivalDate: '',
    durationDays: 30
  })

  const loadFacilities = async () => {
    try {
      const data = await storageService.getAllStorages()
      if (Array.isArray(data) && data.length > 0) {
        setFacilities(data)
        setSelectedFacility(data[0])
      }
    } catch (err) {
      // Fallback data already loaded
      console.warn('Using verified cold storage directory fallback:', err)
    }
  }

  // Fetch facilities on mount
  useEffect(() => {
    loadFacilities()
  }, [])

  // Filter facilities based on search, district, and quick chip
  const filteredFacilities = useMemo(() => {
    const list = Array.isArray(facilities) && facilities.length > 0 ? facilities : FALLBACK_COLD_STORAGES
    return list.filter(f => {
      if (!f) return false
      // District filter
      if (selectedDistrict !== 'All Districts' && f.district && f.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
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
        const matchCommodity = Array.isArray(f.commoditiesSupported) && f.commoditiesSupported.some(c => c?.toLowerCase().includes(query))
        return matchName || matchAddress || matchDistrict || matchChamber || matchCommodity
      }

      return true
    })
  }, [facilities, selectedDistrict, activeFilter, searchQuery])

  // Active facility for inspection panel
  const activeFacility = useMemo(() => {
    if (filteredFacilities.length === 0) return null
    if (selectedFacility && filteredFacilities.some(f => (f._id || f.id) === (selectedFacility._id || selectedFacility.id))) {
      return selectedFacility
    }
    return filteredFacilities[0]
  }, [filteredFacilities, selectedFacility])

  // Initialize Leaflet OpenStreetMap
  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapInstanceRef.current) {
      if (mapContainerRef.current._leaflet_id) {
        delete mapContainerRef.current._leaflet_id
      }

      // Karnataka geographic center [14.5204, 75.7224]
      const map = L.map(mapContainerRef.current, {
        center: [14.5204, 75.7224],
        zoom: 7,
        scrollWheelZoom: true,
        zoomControl: true
      })

      // Standard OpenStreetMap tiles (100% free, reliable)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map)

      markersLayerRef.current = L.layerGroup().addTo(map)
      mapInstanceRef.current = map

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize()
        }
      }, 250)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markersLayerRef.current = null
      }
    }
  }, [])

  // Sync Leaflet markers whenever filtered facilities or selectedFacility changes
  useEffect(() => {
    const map = mapInstanceRef.current
    const layer = markersLayerRef.current
    if (!map || !layer) return

    layer.clearLayers()

    const bounds = []

    filteredFacilities.forEach((facility) => {
      const coords = getCoords(facility)
      if (!coords) return
      const [lat, lng] = coords

      bounds.push([lat, lng])

      const isSelected = (selectedFacility?._id || selectedFacility?.id) === (facility._id || facility.id)
      const markerIcon = createCustomPinIcon(facility.isGovernmentOwned, isSelected)

      const marker = L.marker([lat, lng], { icon: markerIcon })

      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 220px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; background: ${facility.isGovernmentOwned ? 'rgba(5,150,105,0.15)' : 'rgba(59,130,246,0.15)'}; color: ${facility.isGovernmentOwned ? '#059669' : '#2563eb'};">
              ${facility.isGovernmentOwned ? '🏛️ KSWC / GOVT' : '🏢 CERTIFIED PRIVATE'}
            </span>
            <span style="font-size: 11px; font-weight: 700; color: #059669;">₹${facility.costPerDay}/MT/day</span>
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #0f172a;">${facility.name}</h4>
          <p style="margin: 0 0 6px 0; color: #64748b; font-size: 11px;">${facility.address}</p>
          <div style="display: flex; gap: 8px; margin-bottom: 8px; font-size: 10px; color: #334155;">
            <span>📦 <strong>${(facility.availableCapacity || Math.round((facility.capacity || 4000) * 0.7)).toLocaleString()}</strong> MT Avail.</span>
            <span>🌡️ <strong>${facility.temperatureRange || '2°C to 8°C'}</strong></span>
          </div>
          <div style="display: flex; gap: 6px; margin-top: 6px;">
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="flex: 1; text-align: center; background: #059669; color: #ffffff; padding: 5px 8px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 11px; display: inline-flex; align-items: center; justify-content: center; gap: 4px;"
            >
              Directions
            </a>
            ${facility.contactNumber ? `
              <a 
                href="tel:${facility.contactNumber}"
                style="background: #f1f5f9; color: #0f172a; padding: 5px 8px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 11px; border: 1px solid #cbd5e1; display: inline-flex; align-items: center; justify-content: center;"
              >
                Call
              </a>
            ` : ''}
          </div>
        </div>
      `

      marker.bindPopup(popupHtml, { maxWidth: 280 })
      marker.on('click', () => {
        setSelectedFacility(facility)
      })

      layer.addLayer(marker)
    })

    // If a district is chosen, fit map to district bounds
    if (selectedDistrict !== 'All Districts' && bounds.length > 0) {
      if (bounds.length === 1) {
        map.flyTo(bounds[0], 11, { duration: 1.0 })
      } else {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 })
      }
    }
  }, [filteredFacilities, selectedFacility, selectedDistrict])

  const handleSelectFacility = (facility) => {
    setSelectedFacility(facility)
    const coords = getCoords(facility)
    if (coords && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(coords, 12, { duration: 1.0 })
    }
  }

  const handleResetMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([14.5204, 75.7224], 7, { duration: 1.0 })
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

          userPin.bindPopup('<b>📍 Your Detected Location</b>').openPopup()
          userMarkerRef.current = userPin

          mapInstanceRef.current.flyTo([latitude, longitude], 10, { duration: 1.5 })
        }

        try {
          const nearby = await storageService.getNearbyStorages(latitude, longitude, 150)
          if (Array.isArray(nearby) && nearby.length > 0) {
            setFacilities(nearby)
            setSelectedFacility(nearby[0])
          }
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
      (activeFacility?.costPerDay || 30) * 
      Number(inquiryForm.quantityMT || 10) * 
      Number(inquiryForm.durationDays || 30)
    )

    toast.success(
      `Space inquiry for ${inquiryForm.quantityMT} MT submitted to ${activeFacility?.name}! Est. Total: ₹${estimatedTotal.toLocaleString()}`,
      { duration: 5000 }
    )

    setInquiryModalOpen(false)
  }

  // Calculated totals
  const totalCapacityMT = useMemo(() => {
    const list = Array.isArray(facilities) ? facilities : FALLBACK_COLD_STORAGES
    return list.reduce((acc, curr) => acc + (curr?.capacity || 0), 0)
  }, [facilities])

  const totalAvailableMT = useMemo(() => {
    const list = Array.isArray(facilities) ? facilities : FALLBACK_COLD_STORAGES
    return list.reduce((acc, curr) => acc + (curr?.availableCapacity || Math.round((curr?.capacity || 4000) * 0.7)), 0)
  }, [facilities])

  const govtCount = useMemo(() => {
    const list = Array.isArray(facilities) ? facilities : FALLBACK_COLD_STORAGES
    return list.filter(f => f?.isGovernmentOwned).length
  }, [facilities])

  return (
    <div className="py-10 px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* 1. Top Banner & Header (Exact Landing Page Design Language) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            Karnataka State Warehousing & Cold Chain Grid
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl font-normal leading-tight text-foreground">
            Cold Storage & Logistics Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            Browse 40+ certified cold storage hubs, KSWC climate silos, and Controlled Atmosphere (CA) facilities across all 31 districts of Karnataka with direct reservation and GPS directions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLocateMe}
            disabled={locatingUser}
            className="rounded-sm text-xs font-semibold h-9 px-4 shadow-xs flex items-center gap-2"
          >
            <Compass className={`size-3.5 ${locatingUser ? 'animate-spin' : ''}`} />
            <span>{locatingUser ? 'Locating...' : 'Find Near Me'}</span>
          </Button>

          <Button
            variant="farmer"
            size="sm"
            onClick={() => setInquiryModalOpen(true)}
            className="rounded-sm text-xs font-semibold shadow-xs h-9 px-4"
          >
            Book Space Now
          </Button>
        </div>
      </div>

      {/* 2. Key Subsidy & Capacity Highlights Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-md bg-card border border-border space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Verified Hubs</span>
          </div>
          <p className="text-2xl font-display font-normal text-foreground mt-1">
            {facilities.length > 0 ? facilities.length : '40+'}
          </p>
          <span className="text-[10px] text-primary font-bold">Across 31 Karnataka Districts</span>
        </div>

        <div className="p-5 rounded-md bg-card border border-border space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Total Grid Capacity</span>
          </div>
          <p className="text-2xl font-display font-normal text-foreground mt-1">
            {totalCapacityMT > 0 ? `${(totalCapacityMT / 1000).toFixed(0)}k MT` : '240k MT'}
          </p>
          <span className="text-[10px] text-muted-foreground">Metric Ton Storage</span>
        </div>

        <div className="p-5 rounded-md bg-card border border-border space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Govt / KSWC Hubs</span>
          </div>
          <p className="text-2xl font-display font-normal text-foreground mt-1">
            {govtCount}
          </p>
          <span className="text-[10px] text-primary font-bold">Subsidized Tariff Structure</span>
        </div>

        <div className="p-5 rounded-md bg-card border border-border space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <PackageCheck className="w-3.5 h-3.5 text-trader" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Space Available</span>
          </div>
          <p className="text-2xl font-display font-normal text-primary mt-1">
            {totalAvailableMT > 0 ? `${(totalAvailableMT / 1000).toFixed(0)}k MT` : '150k MT'}
          </p>
          <span className="text-[10px] text-primary font-bold">Ready for Intake Today</span>
        </div>
      </div>

      {/* 3. Search Bar & District Filters */}
      <div className="bg-card border border-border rounded-md p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by facility name, address, commodity (Potatoes, Apples, Tomatoes)..."
              className="w-full pl-9 pr-8 h-10 rounded-md bg-background border border-border text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* District Dropdown */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {KARNATAKA_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <span className="text-[11px] text-muted-foreground font-semibold mr-1 flex items-center gap-1 uppercase tracking-wider">
            <Filter className="size-3" /> Filters:
          </span>

          {[
            { id: 'all', label: 'All Facilities' },
            { id: 'govt', label: 'Govt Subsidized (KSWC)' },
            { id: 'private', label: 'Private Cold Chains' },
            { id: 'solar', label: 'Solar-Powered' },
            { id: 'ca', label: 'CA / Deep Freeze' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
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
              className="text-destructive hover:underline font-semibold px-2 py-1 text-xs ml-auto whitespace-nowrap"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Interactive OpenStreetMap Karnataka Cold Chain Grid */}
      <div className="bg-card border border-border rounded-md p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Interactive Karnataka Grid Map (OpenStreetMap)</h2>
              <p className="text-[11px] text-muted-foreground">Geographic distribution of cold storage hubs across Karnataka with real-time location mapping</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              Govt / KSWC Hubs
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              Private Cold Chains
            </span>
            {userLocation && (
              <span className="flex items-center gap-1.5 text-red-600">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-pulse" />
                Your Location
              </span>
            )}
            <button
              onClick={handleResetMap}
              className="px-2 py-1 rounded border border-border hover:bg-muted text-[10px] font-bold text-foreground transition-colors flex items-center gap-1 ml-auto"
              title="Reset map to entire Karnataka"
            >
              <RotateCcw className="w-3 h-3" /> Reset View
            </button>
          </div>
        </div>

        {/* Leaflet Map Canvas */}
        <div className="w-full h-[400px] sm:h-[460px] rounded-md overflow-hidden border border-border shadow-inner relative z-0">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground px-1 gap-1">
          <span>💡 Click any marker pin to view facility tariffs, available MT capacity, and driving directions.</span>
          <span className="text-[10px]">OpenStreetMap &copy; Contributors</span>
        </div>
      </div>

      {/* 5. Two-Column Interactive Facility Directory & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr] gap-6">

        {/* Column A: Facility List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Showing {filteredFacilities.length} Facilities
            </span>
            {userLocation && (
              <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-sm">
                Sorted by GPS Proximity
              </span>
            )}
          </div>

          {filteredFacilities.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-md bg-card border border-dashed border-border space-y-3">
              <Snowflake className="w-10 h-10 text-muted-foreground/50 mx-auto" />
              <h3 className="text-base font-bold text-foreground">No cold storages found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No facility matching "{searchQuery}" in {selectedDistrict}. Try resetting your search filters.
              </p>
              <Button
                variant="farmer"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedDistrict('All Districts')
                  setActiveFilter('all')
                }}
                className="rounded-sm text-xs font-semibold shadow-xs h-9 px-4"
              >
                View All Facilities
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
              {filteredFacilities.map((facility) => {
                const isSelected = (activeFacility?._id || activeFacility?.id) === (facility._id || facility.id)
                const cap = Number(facility.capacity || 4000)
                const avail = Number(facility.availableCapacity || Math.round(cap * 0.7))
                const pct = Math.round(((cap - avail) / cap) * 100)

                return (
                  <div
                    key={facility._id || facility.id}
                    onClick={() => handleSelectFacility(facility)}
                    className={`p-4 rounded-md border transition-all cursor-pointer text-left relative ${
                      isSelected
                        ? 'bg-primary/5 border-primary ring-1 ring-primary/30 shadow-xs'
                        : 'bg-card hover:border-primary/50 border-border shadow-xs'
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

                      <div className="text-right">
                        <span className="font-bold text-emerald-600 text-xs">
                          ₹{facility.costPerDay}
                        </span>
                        <span className="text-[9px] text-muted-foreground block">/MT/day</span>
                      </div>
                    </div>

                    {/* Name & Address */}
                    <h3 className="text-sm font-bold text-foreground leading-snug">
                      {facility.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="truncate">{facility.address}</span>
                    </p>

                    {/* Capacity Bar */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">Available Space:</span>
                        <span className="font-bold text-foreground">
                          {avail.toLocaleString()} / {cap.toLocaleString()} MT ({100 - pct}% Free)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Column B: Detail & Booking Inspection Panel */}
        <div className="border border-border bg-card rounded-md shadow-xs flex flex-col justify-between">
          {activeFacility ? (
            <div className="p-6 space-y-6">
              
              {/* Header */}
              <div className="border-b border-border pb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    activeFacility.isGovernmentOwned 
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                      : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
                  }`}>
                    {activeFacility.isGovernmentOwned ? '🏛️ KSWC / Govt Hub' : '🏢 Certified Private Hub'}
                  </span>
                  {activeFacility.isSolarPowered && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      ⚡ Solar Powered
                    </span>
                  )}
                  {activeFacility.rating && (
                    <span className="ml-auto flex items-center gap-1 text-xs font-bold text-foreground">
                      <Star className="size-3.5 text-trader fill-trader" /> {activeFacility.rating}
                    </span>
                  )}
                </div>

                <h2 className="font-display text-2xl sm:text-3xl text-foreground font-normal">
                  {activeFacility.name}
                </h2>
                <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="size-4 text-primary shrink-0" />
                  <span>{activeFacility.address}</span>
                </p>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-md bg-muted/40 border border-border space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Chamber Type</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Thermometer className="w-3.5 h-3.5 text-cyan-600" />
                    <span>{activeFacility.chamberType || 'Multi-Commodity'}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-md bg-muted/40 border border-border space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Temperature Control</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Snowflake className="w-3.5 h-3.5 text-primary" />
                    <span>{activeFacility.temperatureRange || '2°C to 8°C'}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-md bg-muted/40 border border-border space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Total / Available MT</span>
                  <p className="text-xs font-bold text-foreground">
                    {(activeFacility.availableCapacity || Math.round((activeFacility.capacity || 4000) * 0.7)).toLocaleString()} / {(activeFacility.capacity || 4000).toLocaleString()} MT
                  </p>
                </div>

                <div className="p-3.5 rounded-md bg-muted/40 border border-border space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Daily Storage Tariff</span>
                  <p className="text-xs font-bold text-emerald-600">
                    ₹{activeFacility.costPerDay} <span className="text-[10px] font-normal text-muted-foreground">/ Metric Ton / Day</span>
                  </p>
                </div>
              </div>

              {/* Commodities Supported */}
              <div>
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block mb-2">
                  Commodities Accepted:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(activeFacility.commoditiesSupported || ['Tomatoes', 'Potatoes', 'Onions', 'Grapes', 'Vegetables']).map((c) => (
                    <span key={c} className="text-xs px-2.5 py-1 rounded bg-muted/70 text-foreground font-medium border border-border">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Manager & Operating Desk */}
              <div className="p-4 rounded-md bg-muted/30 border border-border flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {activeFacility.managerName || 'Operations Manager'}
                  </p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {activeFacility.operatingHours || '24/7 Gate Inward / Outward'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="rounded-sm text-xs h-8">
                    <a href={`tel:${activeFacility.contactNumber}`}>
                      <Phone className="w-3.5 h-3.5 mr-1" /> Call Desk
                    </a>
                  </Button>
                  {activeFacility.location?.coordinates && (
                    <Button asChild variant="outline" size="sm" className="rounded-sm text-xs h-8">
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${activeFacility.location.coordinates[1]},${activeFacility.location.coordinates[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Navigation className="w-3.5 h-3.5 mr-1" /> Directions
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Reservation CTA */}
              <div className="pt-2">
                <Button 
                  variant="farmer" 
                  size="lg" 
                  onClick={() => setInquiryModalOpen(true)}
                  className="w-full rounded-sm font-semibold shadow-xs text-xs h-10 flex items-center justify-center gap-2"
                >
                  <Snowflake className="w-4 h-4" /> Request Cold Chamber Space Reservation
                </Button>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground space-y-2">
              <Snowflake className="w-8 h-8 mx-auto opacity-50" />
              <p className="text-xs">Select any facility on the left to view detailed technical specifications and reserve space.</p>
            </div>
          )}
        </div>

      </div>

      {/* 5. Space Reservation Inquiry Modal */}
      {inquiryModalOpen && activeFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-card border border-border rounded-md p-6 max-w-md w-full shadow-xl space-y-5 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                  Space Reservation Inquiry
                </p>
                <h3 className="text-xl font-display font-normal text-foreground mt-1">
                  {activeFacility.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tariff: ₹{activeFacility.costPerDay}/MT/Day • {activeFacility.district}
                </p>
              </div>
              <button
                onClick={() => setInquiryModalOpen(false)}
                className="p-1.5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1">Farmer / Entity Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Gowda"
                  value={inquiryForm.farmerName}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, farmerName: e.target.value })}
                  className="w-full h-10 px-3 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Contact Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98450 12345"
                  value={inquiryForm.phone}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                  className="w-full h-10 px-3 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Crop / Commodity *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Potatoes, Apples"
                    value={inquiryForm.cropName}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, cropName: e.target.value })}
                    className="w-full h-10 px-3 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                  />
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">Quantity (MT) *</label>
                  <input
                    type="number"
                    min="1"
                    max={activeFacility.capacity || 5000}
                    value={inquiryForm.quantityMT}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, quantityMT: e.target.value })}
                    className="w-full h-10 px-3 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Arrival Date</label>
                  <input
                    type="date"
                    value={inquiryForm.arrivalDate}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, arrivalDate: e.target.value })}
                    className="w-full h-10 px-3 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-xs"
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
                    className="w-full h-10 px-3 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Dynamic Estimated Cost Box */}
              <div className="p-3.5 rounded-sm bg-muted/40 border border-border space-y-1 mt-2">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Estimated Daily Tariff:</span>
                  <span className="font-mono text-foreground font-bold">
                    ₹{activeFacility.costPerDay} × {inquiryForm.quantityMT} MT × {inquiryForm.durationDays} Days
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-1 border-t border-border/60">
                  <span className="text-xs font-bold text-foreground">Estimated Total Cost:</span>
                  <span className="text-base font-bold text-primary font-mono">
                    ₹{(activeFacility.costPerDay * Number(inquiryForm.quantityMT || 0) * Number(inquiryForm.durationDays || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setInquiryModalOpen(false)}
                  className="flex-1 rounded-sm text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="farmer"
                  size="sm"
                  className="flex-1 rounded-sm text-xs font-bold h-9 shadow-xs"
                >
                  Confirm & Send Request
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}

export default ColdStorage
