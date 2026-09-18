import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Snowflake,
  MapPin,
  Phone,
  ArrowRight,
  CheckCircle2,
  Thermometer,
  Clock,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import ScrollPop from '@/components/common/ScrollPop'

// Demo facilities — fields grounded exactly in backend/models/ColdStorage.js schema:
// name, address, district, capacity(MT), costPerDay(INR), contactNumber,
// isGovernmentOwned, chamberType, temperatureRange, commoditiesSupported,
// availableCapacity, isSolarPowered, operatingHours, rating
const DEMO_FACILITIES = [
  {
    id: 'f1',
    name: 'Kolar Agri Cold Chain Centre',
    address: 'Industrial Estate, Kolar – 563101',
    district: 'Kolar',
    capacity: 5000,
    availableCapacity: 1800,
    costPerDay: 4,
    contactNumber: '+91 98440 12345',
    isGovernmentOwned: true,
    chamberType: 'Multi-Commodity',
    temperatureRange: '2°C to 8°C',
    commoditiesSupported: ['Tomatoes', 'Onions', 'Potatoes', 'Grapes'],
    isSolarPowered: true,
    operatingHours: '24/7 Operations',
    rating: 4.7,
  },
  {
    id: 'f2',
    name: 'Hassan Horticulture Storage Hub',
    address: 'APMC Yard Complex, Hassan – 573201',
    district: 'Hassan',
    capacity: 3200,
    availableCapacity: 950,
    costPerDay: 3.5,
    contactNumber: '+91 97423 88901',
    isGovernmentOwned: false,
    chamberType: 'Controlled Atmosphere',
    temperatureRange: '0°C to 4°C',
    commoditiesSupported: ['Apples', 'Cabbage', 'Cauliflower', 'Green Peas'],
    isSolarPowered: false,
    operatingHours: '6:00 AM – 10:00 PM',
    rating: 4.4,
  },
  {
    id: 'f3',
    name: 'Belagavi Potato & Onion Cold Store',
    address: 'NH-748 Bypass, Belagavi – 590001',
    district: 'Belagavi',
    capacity: 8000,
    availableCapacity: 3400,
    costPerDay: 3,
    contactNumber: '+91 83490 55123',
    isGovernmentOwned: false,
    chamberType: 'Bulk Commodity',
    temperatureRange: '4°C to 12°C',
    commoditiesSupported: ['Potatoes', 'Onions', 'Dry Chilli', 'Groundnuts'],
    isSolarPowered: true,
    operatingHours: '24/7 Operations',
    rating: 4.6,
  },
  {
    id: 'f4',
    name: 'Mandya Jaggery & Sugarcane Store',
    address: 'Sugar Factory Road, Mandya – 571401',
    district: 'Mandya',
    capacity: 2400,
    availableCapacity: 800,
    costPerDay: 5,
    contactNumber: '+91 90150 44201',
    isGovernmentOwned: true,
    chamberType: 'Humidity Controlled',
    temperatureRange: '10°C to 18°C',
    commoditiesSupported: ['Jaggery', 'Sugarcane', 'Turmeric', 'Ginger'],
    isSolarPowered: false,
    operatingHours: '7:00 AM – 9:00 PM',
    rating: 4.3,
  },
]

// Districts from backend/models/ColdStorage.js karnatakaDistricts
const DISTRICTS = ['All Districts', 'Kolar', 'Hassan', 'Belagavi', 'Mandya', 'Mysuru', 'Davanagere', 'Tumakuru']

export const ColdStorageExplorer = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts')
  const [selectedFacility, setSelectedFacility] = useState(DEMO_FACILITIES[0])

  const filtered = selectedDistrict === 'All Districts'
    ? DEMO_FACILITIES
    : DEMO_FACILITIES.filter(f => f.district === selectedDistrict)

  // Ensure selected facility is always from the filtered set
  const activeFacility = filtered.includes(selectedFacility) ? selectedFacility : (filtered[0] || DEMO_FACILITIES[0])

  return (
    <section id="cold-storage" className="border-b border-border bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">

        {/* Header */}
        <div className="grid gap-4 border-b border-border pb-8 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              Cold storage network
            </p>
            <h2 className="mt-3 font-display text-4xl leading-none sm:text-5xl">
              Preserve quality.<br />Negotiate price later.
            </h2>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/cold-storage">
              Full network map <ArrowRight />
            </Link>
          </Button>
        </div>

        {/* District filter */}
        <div className="mt-7 flex flex-wrap gap-1.5">
          {DISTRICTS.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDistrict(d)}
              className={`rounded-sm border px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedDistrict === d
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-muted/40 text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Two-column: list + detail */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">

          {/* Facility list */}
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="rounded-sm border border-border bg-muted/30 p-8 text-center">
                <Snowflake className="size-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No demo facilities for this district.
                </p>
                <Link to="/cold-storage" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                  Search live network <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ) : (
              filtered.map((facility, idx) => {
                const isSelected = activeFacility.id === facility.id
                const pct = Math.round(
                  ((facility.capacity - facility.availableCapacity) / facility.capacity) * 100
                )
                return (
                  <ScrollPop key={facility.id} delay={idx * 75}>
                    <button
                      onClick={() => setSelectedFacility(facility)}
                      className={`w-full text-left rounded-sm border p-4 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border bg-card hover:border-primary/30 hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-full ${
                          facility.isGovernmentOwned ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Snowflake className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-foreground truncate">{facility.name}</span>
                            {facility.isGovernmentOwned && (
                              <span className="shrink-0 text-[9px] font-bold uppercase text-primary bg-primary/10 rounded px-1.5 py-0.5">
                                Govt
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                            <MapPin className="size-3" />
                            {facility.district}
                            <span className="mx-1">·</span>
                            <Thermometer className="size-3" />
                            {facility.temperatureRange}
                          </div>
                          {/* Capacity bar */}
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-muted-foreground">
                                {facility.availableCapacity.toLocaleString('en-IN')} MT available
                              </span>
                              <span className="text-[10px] font-semibold text-foreground">{pct}% full</span>
                            </div>
                            <div className="h-1 w-full rounded-full bg-border">
                              <div
                                className="h-1 rounded-full bg-primary transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-foreground">
                            ₹{facility.costPerDay}/MT
                          </p>
                          <p className="text-[9px] text-muted-foreground">per day</p>
                          <div className="mt-1 flex items-center gap-0.5 justify-end">
                            <Star className="size-3 text-trader fill-trader" />
                            <span className="text-[10px] font-semibold">{facility.rating}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </ScrollPop>
                )
              })
            )}
          </div>

          {/* Detail panel */}
          <div className="border border-border bg-card">
            {/* Header */}
            <div className="border-b border-border px-5 py-4 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {activeFacility.isGovernmentOwned && (
                    <span className="text-[9px] font-bold uppercase text-primary bg-primary/10 rounded px-2 py-0.5">
                      Government owned
                    </span>
                  )}
                  {activeFacility.isSolarPowered && (
                    <span className="text-[9px] font-bold uppercase text-amber-600 bg-amber-500/10 rounded px-2 py-0.5">
                      ⚡ Solar
                    </span>
                  )}
                </div>
                <h3 className="font-display text-xl text-foreground">{activeFacility.name}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-3" /> {activeFacility.address}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-2xl text-foreground">₹{activeFacility.costPerDay}</p>
                <p className="text-[10px] text-muted-foreground">per MT/day</p>
              </div>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-2 gap-px bg-border p-px">
              {[
                { label: 'Total capacity', value: `${activeFacility.capacity.toLocaleString('en-IN')} MT` },
                { label: 'Available now', value: `${activeFacility.availableCapacity.toLocaleString('en-IN')} MT` },
                { label: 'Temperature', value: activeFacility.temperatureRange },
                { label: 'Chamber type', value: activeFacility.chamberType },
              ].map(({ label, value }) => (
                <div key={label} className="bg-card px-4 py-3">
                  <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="mt-1 text-xs font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>

            {/* Commodities */}
            <div className="px-5 py-4 border-b border-border">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">
                Commodities supported
              </p>
              <div className="flex flex-wrap gap-1.5">
                {activeFacility.commoditiesSupported.map(c => (
                  <span
                    key={c}
                    className="rounded-sm border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold text-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact + hours */}
            <div className="px-5 py-4 border-b border-border flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Phone className="size-3.5 text-primary" />
                <span className="font-semibold text-foreground">{activeFacility.contactNumber}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-3.5 text-primary" />
                <span>{activeFacility.operatingHours}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="p-5">
              <Button variant="farmer" size="xl" className="w-full" asChild>
                <Link to="/cold-storage">
                  Book storage space <ArrowRight />
                </Link>
              </Button>
              <p className="mt-2 text-center text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                <CheckCircle2 className="size-3 text-primary" />
                All facilities verified by KrishiSetu network
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ColdStorageExplorer
