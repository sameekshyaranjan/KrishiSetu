import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  Phone, 
  FileText, 
  Download, 
  Navigation, 
  Scale, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  X, 
  Layers, 
  ArrowRight,
  Printer
} from 'lucide-react'

const DEMO_TRADER_ORDERS = [
  {
    _id: 'ORD-KA-TRD-9912',
    cropName: 'Grade-A Fresh Hybrid Tomato',
    variety: 'Shiva Hybrid (Firm Red Skin)',
    grade: 'Grade-A Premium',
    quantity: 120,
    unit: 'Quintals',
    agreedRate: 2200,
    grossEscrow: 264000,
    statutoryCess: 3960,
    freightCharges: 3200,
    totalEscrowLocked: 271160,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80',
    farmer: {
      name: 'Ramesh Gowda',
      mobile: '+91 98450 11223',
      village: 'Belur Village',
      taluk: 'Belur',
      district: 'Hassan'
    },
    transporter: {
      agency: 'Kisan Express Logistics Ltd',
      vehicleNumber: 'KA-04-F-8812',
      driverName: 'Manjunath Gowda',
      driverPhone: '+91 98860 55432',
      currentLocation: 'Nelamangala Highway Plaza',
      speed: '54 km/h',
      eta: 'Today, 06:30 PM (34 km away)'
    },
    weighment: {
      declaredWeight: 12000,
      grossWeight: 14280,
      tareWeight: 2280,
      netWeight: 12000,
      moistureChecked: '12.4%',
      status: 'pending' // 'pending' | 'verified'
    },
    stage: 2, // 1: Escrow Funded, 2: In-Transit, 3: Weighment Verified, 4: Delivered & Settled
    orderDate: '28 Aug 2026'
  },
  {
    _id: 'ORD-KA-TRD-4410',
    cropName: 'Bellary Premium Red Onion',
    variety: 'Nasik Red Medium-Large Bulbs',
    grade: 'Grade-A Export',
    quantity: 250,
    unit: 'Quintals',
    agreedRate: 2650,
    grossEscrow: 662500,
    statutoryCess: 9937,
    freightCharges: 5800,
    totalEscrowLocked: 678237,
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&q=80',
    farmer: {
      name: 'Basavaraj Patil',
      mobile: '+91 98860 77123',
      village: 'Malavalli Village',
      taluk: 'Malavalli',
      district: 'Mandya'
    },
    transporter: {
      agency: 'APMC Mandya Transport Syndicate',
      vehicleNumber: 'KA-09-E-4421',
      driverName: 'Ramesh Patil',
      driverPhone: '+91 98450 88321',
      currentLocation: 'Arrived at APMC Mandya Weighbridge #3',
      speed: '0 km/h (At Yard)',
      eta: 'Arrived at Weighbridge'
    },
    weighment: {
      declaredWeight: 25000,
      grossWeight: 31200,
      tareWeight: 6200,
      netWeight: 25000,
      moistureChecked: '10.8%',
      status: 'pending'
    },
    stage: 3, // Ready for weighment verification
    orderDate: '27 Aug 2026'
  },
  {
    _id: 'ORD-KA-TRD-7721',
    cropName: 'Yellow Dent Poultry Maize',
    variety: 'Kargil 900M Hybrid',
    grade: 'Grade-A Commercial',
    quantity: 300,
    unit: 'Quintals',
    agreedRate: 2050,
    grossEscrow: 615000,
    statutoryCess: 9225,
    freightCharges: 4800,
    totalEscrowLocked: 629025,
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500&q=80',
    farmer: {
      name: 'Channappa Gowda',
      mobile: '+91 98450 99441',
      village: 'Doddaballapura',
      taluk: 'Doddaballapura',
      district: 'Bengaluru Rural'
    },
    transporter: {
      agency: 'South Karnataka Cargo Fleet',
      vehicleNumber: 'KA-51-B-9912',
      driverName: 'Suresh Kumar',
      driverPhone: '+91 99000 44123',
      currentLocation: 'Delivered at Bengaluru Central Warehouse',
      speed: '0 km/h',
      eta: 'Completed'
    },
    weighment: {
      declaredWeight: 30000,
      grossWeight: 37400,
      tareWeight: 7400,
      netWeight: 30000,
      moistureChecked: '13.1%',
      status: 'verified'
    },
    stage: 4, // Fully delivered and settled
    orderDate: '26 Aug 2026'
  }
]

const STAGE_FILTERS = [
  { id: 'all', label: 'All Shipments' },
  { id: 'in_transit', label: 'In-Transit (2)' },
  { id: 'weighment_pending', label: 'Weighment Ready (1)' },
  { id: 'delivered', label: 'Delivered & Settled (1)' }
]

export const TraderOrders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState(DEMO_TRADER_ORDERS)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Modals
  const [selectedOrderForWeighment, setSelectedOrderForWeighment] = useState(null)
  const [selectedOrderForGps, setSelectedOrderForGps] = useState(null)
  const [selectedOrderForWaybill, setSelectedOrderForWaybill] = useState(null)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Live logistics fleet positions and weighbridge telemetry updated!')
    }, 600)
  }

  const handleAuthorizeWeighment = (orderId) => {
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId
          ? {
              ...o,
              stage: 4,
              weighment: { ...o.weighment, status: 'verified' },
              transporter: { ...o.transporter, eta: 'Delivered & Verified' }
            }
          : o
      )
    )
    toast.success('APMC Weighment Verified! Escrow funds released directly to the farmer. 🎉')
    setSelectedOrderForWeighment(null)
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (selectedFilter === 'in_transit') return o.stage === 2
      if (selectedFilter === 'weighment_pending') return o.stage === 3
      if (selectedFilter === 'delivered') return o.stage === 4
      return true
    })
  }, [orders, selectedFilter])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 text-xs font-semibold border border-sky-500/20 mb-2">
            <Truck className="w-3.5 h-3.5" />
            <span>Real-Time APMC Transit & Fleet Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Procurement Orders & Fleet Logistics 🚛
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track farm-gate collection vehicles in real-time, inspect digital weighbridge slips, and authorize escrow payouts upon delivery.
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
            Refresh Fleet
          </Button>

          <Button asChild size="sm" className="rounded-xl text-xs h-10 px-4 font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md">
            <Link to="/trader/marketplace">
              <Package className="w-4 h-4 mr-1.5" /> Source More Crops
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. 4 Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Active Shipments</span>
          <p className="text-2xl font-black text-sky-600">3 Consignments</p>
          <span className="text-[11px] text-muted-foreground">670 Quintals moving</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Capital Locked in Transit</span>
          <p className="text-2xl font-black text-amber-600">₹15,78,422</p>
          <span className="text-[11px] text-emerald-600 font-bold">100% Escrow Protected</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">On-Time Transit Rate</span>
          <p className="text-2xl font-black text-emerald-600">98.4%</p>
          <span className="text-[11px] text-muted-foreground">APMC Certified Fleet</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Avg Transit Speed</span>
          <p className="text-2xl font-black text-foreground">52 km/h</p>
          <span className="text-[11px] text-muted-foreground">Live Telemetry Active</span>
        </div>
      </div>

      {/* 3. Filter Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {STAGE_FILTERS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              selectedFilter === tab.id
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Active Consignments Stream */}
      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <div 
            key={order._id}
            className="p-6 sm:p-7 rounded-3xl bg-card border border-border hover:border-amber-500/40 transition-all shadow-sm space-y-6"
          >
            {/* Top Bar: Order ID, Crop Snapshot & Financial Value */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-start gap-4">
                <img 
                  src={order.image} 
                  alt={order.cropName} 
                  className="w-16 h-16 rounded-2xl object-cover border border-border shrink-0 shadow-sm"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-xs text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20">
                      {order._id}
                    </span>
                    <span className="text-[10px] font-extrabold bg-muted text-foreground px-2 py-0.5 rounded-md border border-border">
                      {order.grade}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-foreground">
                    {order.cropName}
                  </h3>

                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <span><MapPin className="w-3.5 h-3.5 inline text-primary mr-0.5" />{order.farmer.village}, {order.farmer.district}</span>
                    <span>•</span>
                    <span className="font-bold text-foreground">{order.quantity} {order.unit}</span>
                    <span>•</span>
                    <span>Agreed: ₹{order.agreedRate}/Qtl</span>
                  </p>
                </div>
              </div>

              <div className="text-right sm:self-center">
                <span className="text-xs text-muted-foreground block">Total Escrow Locked</span>
                <span className="text-xl font-black text-amber-600">
                  ₹{order.totalEscrowLocked.toLocaleString('en-IN')}
                </span>
                <span className="block text-[10px] text-emerald-600 font-bold">Includes 1.5% Cess & Freight</span>
              </div>
            </div>

            {/* 4-Stage Visual Logistics Progress Stepper */}
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                <div className="space-y-1">
                  <div className={`h-2 rounded-full ${order.stage >= 1 ? 'bg-amber-600' : 'bg-border'}`} />
                  <span className={`block font-bold ${order.stage >= 1 ? 'text-amber-700' : 'text-muted-foreground'}`}>
                    1. Escrow Funded
                  </span>
                </div>
                <div className="space-y-1">
                  <div className={`h-2 rounded-full ${order.stage >= 2 ? 'bg-sky-600' : 'bg-border'}`} />
                  <span className={`block font-bold ${order.stage >= 2 ? 'text-sky-700' : 'text-muted-foreground'}`}>
                    2. In-Transit
                  </span>
                </div>
                <div className="space-y-1">
                  <div className={`h-2 rounded-full ${order.stage >= 3 ? 'bg-amber-600' : 'bg-border'}`} />
                  <span className={`block font-bold ${order.stage >= 3 ? 'text-amber-700' : 'text-muted-foreground'}`}>
                    3. Weighment Ready
                  </span>
                </div>
                <div className="space-y-1">
                  <div className={`h-2 rounded-full ${order.stage >= 4 ? 'bg-emerald-600' : 'bg-border'}`} />
                  <span className={`block font-bold ${order.stage >= 4 ? 'text-emerald-700' : 'text-muted-foreground'}`}>
                    4. Settled
                  </span>
                </div>
              </div>
            </div>

            {/* Transporter Live Fleet Details Box */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Assigned Vehicle</span>
                <p className="font-mono font-black text-sm text-foreground flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-sky-600" /> {order.transporter.vehicleNumber}
                </p>
                <span className="text-[11px] text-muted-foreground block">{order.transporter.agency}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Driver Contact</span>
                <p className="font-bold text-foreground">{order.transporter.driverName}</p>
                <a 
                  href={`tel:${order.transporter.driverPhone}`}
                  className="text-[11px] font-mono text-primary hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" /> {order.transporter.driverPhone}
                </a>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Live ETA & Telemetry</span>
                <p className="font-extrabold text-foreground">{order.transporter.eta}</p>
                <span className="text-[11px] text-sky-600 font-semibold block">{order.transporter.currentLocation}</span>
              </div>
            </div>

            {/* Bottom Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedOrderForWaybill(order)}
                  className="rounded-xl text-xs h-9 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 mr-1 text-primary" /> APMC Waybill
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedOrderForGps(order)}
                  className="rounded-xl text-xs h-9 shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5 mr-1 text-sky-600" /> Live GPS Track
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {order.stage === 3 && (
                  <Button 
                    size="sm"
                    onClick={() => setSelectedOrderForWeighment(order)}
                    className="rounded-xl text-xs font-bold h-9 bg-amber-600 hover:bg-amber-700 text-white shadow-md"
                  >
                    <Scale className="w-3.5 h-3.5 mr-1.5" /> Verify Weighbridge & Release Escrow
                  </Button>
                )}

                {order.stage === 4 && (
                  <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" /> Weighment Verified & Funds Settled
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Modal: APMC Electronic Weighbridge Slip & Escrow Release */}
      {selectedOrderForWeighment && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-600 uppercase">
                  APMC Karnataka Certified Weighbridge Slip
                </span>
                <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-600" />
                  Weighment Audit & Escrow Release
                </h3>
                <p className="text-xs text-muted-foreground">
                  Order #{selectedOrderForWeighment._id} • {selectedOrderForWeighment.cropName}
                </p>
              </div>

              <button 
                onClick={() => setSelectedOrderForWeighment(null)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Weighment Telemetry Grid */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-2 border-b border-border">
                <div>
                  <span className="text-muted-foreground block">Vehicle Registration:</span>
                  <span className="font-mono font-bold text-foreground text-sm">{selectedOrderForWeighment.transporter.vehicleNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Lab Moisture Checked:</span>
                  <span className="font-bold text-emerald-600 text-sm">{selectedOrderForWeighment.weighment.moistureChecked}</span>
                </div>
              </div>

              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gross Vehicle Weight (Loaded):</span>
                  <span className="font-bold text-foreground">{selectedOrderForWeighment.weighment.grossWeight.toLocaleString('en-IN')} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tare Weight (Empty Truck):</span>
                  <span className="font-bold text-muted-foreground">-{selectedOrderForWeighment.weighment.tareWeight.toLocaleString('en-IN')} kg</span>
                </div>
                <div className="flex justify-between font-extrabold text-base text-emerald-600 pt-2 border-t border-border">
                  <span>Net Verified Produce Weight:</span>
                  <span>{selectedOrderForWeighment.weighment.netWeight.toLocaleString('en-IN')} kg ({selectedOrderForWeighment.weighment.netWeight / 100} Qtl)</span>
                </div>
              </div>
            </div>

            {/* Escrow Release Notice */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Escrow Payout Authorization: ₹{selectedOrderForWeighment.grossEscrow.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Authorizing will disburse funds directly to {selectedOrderForWeighment.farmer.name}&apos;s verified bank account and mark consignment as delivered.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setSelectedOrderForWeighment(null)}
                className="rounded-xl text-xs h-11"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleAuthorizeWeighment(selectedOrderForWeighment._id)}
                className="rounded-xl text-xs font-bold h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              >
                Confirm & Release Funds
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal: Live GPS Tracking Simulation */}
      {selectedOrderForGps && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-sky-600 uppercase">
                  Live Satellite Telemetry
                </span>
                <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-sky-600 animate-spin" />
                  Vehicle {selectedOrderForGps.transporter.vehicleNumber}
                </h3>
              </div>

              <button 
                onClick={() => setSelectedOrderForGps(null)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="h-44 rounded-2xl bg-muted/60 border border-border relative overflow-hidden flex items-center justify-center text-center p-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-600 mx-auto flex items-center justify-center animate-bounce">
                    <Truck className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-foreground">{selectedOrderForGps.transporter.currentLocation}</p>
                  <span className="text-[11px] text-muted-foreground font-mono">Current Speed: {selectedOrderForGps.transporter.speed}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transporter:</span>
                  <span className="font-bold text-foreground">{selectedOrderForGps.transporter.agency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Driver:</span>
                  <span className="font-bold text-foreground">{selectedOrderForGps.transporter.driverName} ({selectedOrderForGps.transporter.driverPhone})</span>
                </div>
                <div className="flex justify-between text-sky-600 font-extrabold pt-1 border-t border-border">
                  <span>Estimated Arrival:</span>
                  <span>{selectedOrderForGps.transporter.eta}</span>
                </div>
              </div>
            </div>

            <Button 
              type="button" 
              onClick={() => setSelectedOrderForGps(null)}
              className="w-full rounded-xl text-xs font-bold h-10 bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
            >
              Close Live Telemetry
            </Button>
          </div>
        </div>
      )}

      {/* 7. Modal: APMC Electronic Waybill & Transit Pass */}
      {selectedOrderForWaybill && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[10px] font-bold">
                  Government of Karnataka • APMC e-Waybill
                </div>
                <h3 className="text-lg font-extrabold text-foreground">
                  Official Mandi Transit Pass
                </h3>
              </div>

              <button 
                onClick={() => setSelectedOrderForWaybill(null)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formatted Electronic Transit Pass */}
            <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-4 text-xs font-mono">
              <div className="flex justify-between border-b border-border pb-2">
                <span>WAYBILL NO: WB-KA-{selectedOrderForWaybill._id.slice(-4)}</span>
                <span>DATE: {selectedOrderForWaybill.orderDate}</span>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-foreground">CONSIGNOR (PRODUCER):</p>
                <p className="text-muted-foreground">{selectedOrderForWaybill.farmer.name} • {selectedOrderForWaybill.farmer.village}, {selectedOrderForWaybill.farmer.district}</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-foreground">CONSIGNEE (BUYER):</p>
                <p className="text-muted-foreground">{user?.name || 'Karnataka Agro Traders'} (APMC License #KA-BLR-TRD-2026)</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-foreground">COMMODITY SPECIFICATIONS:</p>
                <p className="text-muted-foreground">{selectedOrderForWaybill.cropName} ({selectedOrderForWaybill.quantity} Qtl @ ₹{selectedOrderForWaybill.agreedRate}/Qtl)</p>
                <p className="text-muted-foreground">APMC Cess (1.5%): ₹{selectedOrderForWaybill.statutoryCess.toLocaleString('en-IN')}</p>
              </div>

              <div className="space-y-1 pt-2 border-t border-border">
                <p className="font-bold text-foreground">TRANSPORTER & VEHICLE:</p>
                <p className="text-muted-foreground">{selectedOrderForWaybill.transporter.agency} • Vehicle #{selectedOrderForWaybill.transporter.vehicleNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setSelectedOrderForWaybill(null)}
                className="rounded-xl text-xs h-10"
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  toast.success('Official APMC e-Waybill sent to printer!')
                  setSelectedOrderForWaybill(null)
                }}
                className="rounded-xl text-xs font-bold h-10 bg-amber-600 hover:bg-amber-700 text-white shadow-md"
              >
                <Printer className="w-4 h-4 mr-1.5" /> Print Waybill PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TraderOrders
