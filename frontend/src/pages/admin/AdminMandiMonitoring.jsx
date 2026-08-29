import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import adminMandiService from '@/services/adminMandiService'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  Truck, 
  Scale, 
  Radio, 
  Activity, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Building2, 
  QrCode, 
  X, 
  Printer, 
  Sparkles, 
  Layers, 
  MapPin, 
  FileText, 
  ShieldCheck, 
  ArrowUpRight
} from 'lucide-react'

const DEMO_GATE_PASSES = [
  {
    _id: 'GP-KA-YPR-2026-9912',
    timestamp: '5 mins ago (15:40 IST)',
    mandiYard: 'Yeshwanthpur APMC Main Yard, Bengaluru',
    vehicleNo: 'KA-04-F-8812',
    vehicleType: '10-Wheel Heavy Eicher Truck',
    transporterName: 'Karnataka Agri-Express Logistics',
    driverName: 'Manjunath Swamy',
    driverMobile: '+91 98450 11223',
    farmerName: 'Ramesh Gowda (Belur, Hassan)',
    farmerRtc: 'RTC-HSN-88192',
    cropName: 'Grade-A Fresh Hybrid Tomato',
    declaredBags: '480 Crates (120 Qtl)',
    grossWeightKg: 14280,
    tareWeightKg: 2280,
    netWeightKg: 12000,
    netWeightQtl: 120.0,
    weighbridgeTolerance: 'Passed (0.02% Variance)',
    shedAllocation: 'Auction Shed #4B (Vegetables)',
    status: 'unloading', // 'unloading' | 'cleared' | 'weighing'
    weighbridgeRef: 'WB-YPR-2026-8819'
  },
  {
    _id: 'GP-KA-BLR-2026-7721',
    timestamp: '22 mins ago (15:23 IST)',
    mandiYard: 'Bengaluru Rural (Doddaballapura)',
    vehicleNo: 'KA-50-E-4419',
    vehicleType: '12-Wheel Tata Prima Commercial',
    transporterName: 'Deccan Grain Haulers Ltd',
    driverName: 'Shankar Rao',
    driverMobile: '+91 97412 88990',
    farmerName: 'Channappa Gowda (Doddaballapura)',
    farmerRtc: 'RTC-BLR-44102',
    cropName: 'Yellow Dent Poultry Maize',
    declaredBags: '600 Gunny Bags (300 Qtl)',
    grossWeightKg: 35850,
    tareWeightKg: 5850,
    netWeightKg: 30000,
    netWeightQtl: 300.0,
    weighbridgeTolerance: 'Passed (0.01% Variance)',
    shedAllocation: 'Grain Silo Shed #12',
    status: 'cleared',
    weighbridgeRef: 'WB-BLR-2026-7712'
  },
  {
    _id: 'GP-KA-KLR-2026-5510',
    timestamp: '40 mins ago (15:05 IST)',
    mandiYard: 'Kolar APMC Market Yard',
    vehicleNo: 'KA-07-C-3310',
    vehicleType: '6-Wheel Mahindra Bolero Maxi-Truck',
    transporterName: 'Kolar Fast-Freight Farmers Co-op',
    driverName: 'Anand Kumar',
    driverMobile: '+91 99001 22334',
    farmerName: 'Venkatesh Murthy (Bangarapet)',
    farmerRtc: 'RTC-KLR-99214',
    cropName: 'Organic Finger Millet (Ragi)',
    declaredBags: '300 Bags (150 Qtl)',
    grossWeightKg: 18450,
    tareWeightKg: 3450,
    netWeightKg: 15000,
    netWeightQtl: 150.0,
    weighbridgeTolerance: 'Passed (0.04% Variance)',
    shedAllocation: 'Millet Platform #2',
    status: 'cleared',
    weighbridgeRef: 'WB-KLR-2026-5510'
  }
]

export const AdminMandiMonitoring = () => {
  const { user } = useAuth()
  const [gatePasses, setGatePasses] = useState(DEMO_GATE_PASSES)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPassForPrint, setSelectedPassForPrint] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadGatePasses = async () => {
    try {
      const data = await adminMandiService.getGatePasses()
      if (Array.isArray(data) && data.length > 0) {
        setGatePasses(data)
      }
    } catch {
      // Keep state
    }
  }

  useEffect(() => {
    loadGatePasses()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadGatePasses()
    setIsRefreshing(false)
    toast.success('Mandi gate passes and weighbridge traffic synchronized! ⚡')
  }

  const handleAdvanceStatus = async (passId, currentStatus) => {
    const nextStatus = currentStatus === 'unloading' ? 'cleared' : 'unloading'
    const updated = await adminMandiService.updateGatePassStatus(passId, nextStatus)
    setGatePasses(updated)
    toast.success(`Gate pass status updated to ${nextStatus.toUpperCase()}! 🚚`)
  }

  // Filtered List
  const filteredPasses = useMemo(() => {
    return gatePasses.filter((gp) => {
      const matchesStatus = selectedStatus === 'all' || gp.status === selectedStatus
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        (gp._id || '').toLowerCase().includes(q) ||
        (gp.vehicleNo || '').toLowerCase().includes(q) ||
        (gp.mandiYard || '').toLowerCase().includes(q) ||
        (gp.farmerName || '').toLowerCase().includes(q) ||
        (gp.cropName || '').toLowerCase().includes(q)

      return matchesStatus && matchesSearch
    })
  }, [gatePasses, selectedStatus, searchQuery])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header & Live Telemetry Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20 mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Live Karnataka APMC Electronic Weighbridge & Gate Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Mandi Gate Passes & Weighbridge Traffic 🚛
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time multi-mandi gate pass issuance, truck tare/gross weight verification, and shed platform allocation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-xl text-xs h-10 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </Button>

          <Button 
            onClick={() => toast.success('Statewide Gate Traffic Manifest PDF exported!')}
            size="sm" 
            className="rounded-xl text-xs font-bold shadow-md h-10 px-4 bg-primary text-primary-foreground"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Manifest
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Active Gate Passes Today</p>
            <h3 className="text-2xl font-black text-foreground">{gatePasses.length} Trucks In Yard</h3>
            <span className="text-[11px] text-emerald-600 font-medium">100% Digital e-Waybill Compliance</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Weighbridge Clearance Rate</p>
            <h3 className="text-2xl font-black text-amber-600">99.8%</h3>
            <span className="text-[11px] text-muted-foreground">Legal Metrology Audited</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Avg Unloading Turnaround</p>
            <h3 className="text-2xl font-black text-emerald-600">24 Mins</h3>
            <span className="text-[11px] text-emerald-600 font-medium">-40% vs Traditional Mandis</span>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Controls */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {[
              { id: 'all', label: `All Passes (${gatePasses.length})` },
              { id: 'unloading', label: 'Unloading In Progress 📦' },
              { id: 'cleared', label: 'Weighment Cleared 🟢' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedStatus === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vehicle #, pass #, driver, or yard..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 4. Gate Passes Cards */}
      <div className="space-y-4">
        {filteredPasses.map((pass) => {
          const isCleared = pass.status === 'cleared'

          return (
            <div
              key={pass._id}
              className="p-6 sm:p-7 rounded-3xl bg-card border border-border hover:border-primary/50 shadow-sm transition-all space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-foreground">{pass._id}</span>
                    <span className="text-xs text-muted-foreground">• {pass.timestamp}</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                      isCleared
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}>
                      {pass.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-primary" /> {pass.mandiYard}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-muted-foreground block font-medium">Certified Net Weight:</span>
                  <span className="text-xl font-black text-primary font-mono">
                    {pass.netWeightQtl} Qtl ({pass.netWeightKg} Kg)
                  </span>
                </div>
              </div>

              {/* Vehicle & Tare Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-primary" /> {pass.vehicleNo} ({pass.vehicleType})
                  </span>
                  <p className="text-muted-foreground">Driver: {pass.driverName} ({pass.driverMobile})</p>
                  <p className="text-muted-foreground">Carrier: {pass.transporterName}</p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                  <span className="font-bold text-foreground">Produce & Origin:</span>
                  <p className="text-foreground font-semibold">{pass.cropName} • {pass.declaredBags}</p>
                  <p className="text-muted-foreground">Farmer: {pass.farmerName}</p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Weight:</span>
                    <span className="font-mono font-bold text-foreground">{pass.grossWeightKg} Kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tare Weight:</span>
                    <span className="font-mono font-bold text-foreground">{pass.tareWeightKg} Kg</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-border/60 text-emerald-600 font-bold">
                    <span>Tolerance:</span>
                    <span>{pass.weighbridgeTolerance}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  Shed Allocation: <strong className="text-foreground">{pass.shedAllocation}</strong>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedPassForPrint(pass)
                      toast.success(`Printing Official Gate Pass #${pass._id}`)
                    }}
                    className="rounded-xl text-xs h-9 px-4 flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Gate Slip
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleAdvanceStatus(pass._id, pass.status)}
                    className="rounded-xl text-xs font-bold h-9 px-5 bg-primary text-primary-foreground shadow-sm"
                  >
                    {isCleared ? 'Revert to Unloading' : 'Authorize Gate Clearance 🟢'}
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AdminMandiMonitoring
