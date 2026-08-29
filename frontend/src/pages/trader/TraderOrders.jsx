import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import orderService from '@/services/orderService'
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

const STAGE_FILTERS = [
  { id: 'all', label: 'All Shipments' },
  { id: 'in_transit', label: 'In-Transit 🚚' },
  { id: 'weighment_pending', label: 'Weighment Ready ⚖️' },
  { id: 'delivered', label: 'Delivered & Settled 💸' }
]

export const TraderOrders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Modals
  const [selectedOrderForWeighment, setSelectedOrderForWeighment] = useState(null)
  const [selectedOrderForGps, setSelectedOrderForGps] = useState(null)
  const [selectedOrderForWaybill, setSelectedOrderForWaybill] = useState(null)

  const loadOrders = async () => {
    setLoading(true)
    try {
      const data = await orderService.getTraderOrders()
      setOrders(data || [])
    } catch (err) {
      console.error('[TraderOrders] Failed to load orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadOrders()
    setIsRefreshing(false)
    toast.success('Live logistics fleet positions and weighbridge telemetry updated! ⚡')
  }

  const handleAuthorizeWeighment = async (orderId) => {
    try {
      const updated = await orderService.advanceTraderOrderStage(orderId, 4)
      setOrders(updated)
      toast.success('APMC Weighment Verified! Escrow funds released directly to the farmer via DBT! 💸')
      setSelectedOrderForWeighment(null)
    } catch (err) {
      toast.error('Failed to verify weighment.')
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const stage = o.currentStage || o.stage || 2
      if (selectedFilter === 'in_transit') return stage === 2
      if (selectedFilter === 'weighment_pending') return stage === 3
      if (selectedFilter === 'delivered') return stage === 4
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
            className="rounded-xl text-xs font-semibold shadow-sm h-10 px-4"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </Button>

          <Button asChild size="sm" className="rounded-xl text-xs font-bold shadow-md h-10 px-5 bg-primary text-primary-foreground">
            <Link to="/trader/marketplace">
              Browse More Lots
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {STAGE_FILTERS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              selectedFilter === tab.id
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Orders List */}
      <div className="space-y-6">
        {filteredOrders.map((order) => {
          const currentStage = order.currentStage || order.stage || 2
          const isDelivered = currentStage === 4

          return (
            <div
              key={order._id}
              className="p-6 sm:p-7 rounded-3xl bg-card border border-border hover:border-border/80 shadow-sm transition-all space-y-6"
            >
              {/* Top Row: Order ID & Financial Escrow Tag */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-black text-base shrink-0">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">{order._id}</span>
                      <span className="text-xs text-muted-foreground">• Ordered on {order.createdAt || order.orderDate || '28 Aug 2026'}</span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" /> Origin: <span className="font-semibold text-foreground">{order.farmer?.name}</span> ({order.farmer?.district}, Karnataka)
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Escrow Protected Value</span>
                    <span className="text-xl font-black text-amber-600 font-mono">
                      ₹{order.grossEscrow?.toLocaleString('en-IN') || order.totalEscrowLocked?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                    isDelivered
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : 'bg-sky-500/10 text-sky-600 border border-sky-500/20'
                  }`}>
                    {isDelivered ? 'Settled & Delivered 💸' : 'In Transit 🚚'}
                  </span>
                </div>
              </div>

              {/* Middle Row: Crop & Transporter Telemetry */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                
                {/* Crop item info */}
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden shrink-0 border border-border">
                    <img src={order.image} alt={order.cropName} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-sm text-foreground">{order.cropName}</h4>
                    <p className="text-xs text-muted-foreground">{order.variety}</p>
                    <p className="text-xs font-mono font-bold text-primary">
                      {order.quantity} {order.unit} @ ₹{order.agreedRate}/Qtl
                    </p>
                  </div>
                </div>

                {/* Transporter Tracking Snippet */}
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-sky-600" /> {order.transporter?.agency}
                    </span>
                    <span className="font-mono font-bold text-sky-600">{order.transporter?.vehicleNumber}</span>
                  </div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-amber-500" /> {order.transporter?.currentLocation}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold">
                    ETA: {order.transporter?.eta}
                  </p>
                </div>

                {/* Weighbridge verification status */}
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-emerald-600" /> Weighbridge Tare
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      order.weighment?.isVerified || currentStage === 4
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {order.weighment?.isVerified || currentStage === 4 ? 'Verified ⚖️' : 'Pending Weighment'}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-[11px]">
                    <span>Declared: <strong>{order.weighment?.declaredWeight / 100} Qtl</strong></span>
                    <span>Net Verified: <strong className="text-foreground">{order.weighment?.netWeight ? order.weighment.netWeight / 100 : order.quantity} Qtl</strong></span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border/80 text-xs">
                <span className="text-muted-foreground flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> APMC Electronic Gate Pass Protected
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrderForGps(order)}
                    className="rounded-xl text-xs font-semibold h-9 px-3"
                  >
                    <Navigation className="w-3.5 h-3.5 mr-1" /> Live GPS
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrderForWaybill(order)}
                    className="rounded-xl text-xs font-semibold h-9 px-3"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1" /> e-Waybill
                  </Button>

                  {currentStage < 4 && (
                    <Button
                      size="sm"
                      onClick={() => handleAuthorizeWeighment(order._id)}
                      className="rounded-xl text-xs font-bold h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    >
                      <Scale className="w-3.5 h-3.5 mr-1" /> Authorize Weighment & DBT 💸
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 4. Real-time GPS Fleet Position Modal */}
      {selectedOrderForGps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">
                    Live GPS Vehicle Telemetry
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Vehicle #{selectedOrderForGps.transporter?.vehicleNumber}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrderForGps(null)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Agency:</span>
                <span className="font-bold text-foreground">{selectedOrderForGps.transporter?.agency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver:</span>
                <span className="font-bold text-foreground">{selectedOrderForGps.transporter?.driverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver Mobile:</span>
                <span className="font-mono font-bold text-sky-600">{selectedOrderForGps.transporter?.driverPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current GPS Fix:</span>
                <span className="font-semibold text-foreground">{selectedOrderForGps.transporter?.currentLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Speed & Telemetry:</span>
                <span className="font-mono text-emerald-600 font-bold">{selectedOrderForGps.transporter?.speed}</span>
              </div>
            </div>

            <Button 
              onClick={() => setSelectedOrderForGps(null)}
              className="w-full rounded-xl text-xs font-bold h-10"
            >
              Close Telemetry Stream
            </Button>
          </div>
        </div>
      )}

      {/* 5. e-Waybill Print Modal */}
      {selectedOrderForWaybill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">
                    APMC Inter-Mandi Electronic e-Waybill
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    e-Waybill #{selectedOrderForWaybill._id}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrderForWaybill(null)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consignor (Farmer):</span>
                <span className="font-bold text-foreground">{selectedOrderForWaybill.farmer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consignee (Trader):</span>
                <span className="font-bold text-foreground">{user?.name || 'Mysuru Agro Exporters Pvt Ltd'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicle Reg:</span>
                <span className="font-mono font-bold text-foreground">{selectedOrderForWaybill.transporter?.vehicleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Produce:</span>
                <span className="font-bold text-foreground">{selectedOrderForWaybill.cropName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Declared Net Qty:</span>
                <span className="font-mono font-bold text-foreground">{selectedOrderForWaybill.quantity} {selectedOrderForWaybill.unit}</span>
              </div>
            </div>

            <Button 
              onClick={() => {
                window.print()
                toast.success('e-Waybill printed!')
              }}
              className="w-full rounded-xl text-xs font-bold h-10 bg-primary text-primary-foreground"
            >
              <Printer className="w-4 h-4 mr-1.5" /> Print Physical Mandi Waybill
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TraderOrders
