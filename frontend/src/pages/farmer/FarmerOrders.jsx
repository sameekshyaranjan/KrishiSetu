import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import orderService from '@/services/orderService'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  CheckCircle2, 
  Clock, 
  Truck, 
  ShieldCheck, 
  FileText, 
  Download, 
  DollarSign, 
  MapPin, 
  Search, 
  Building2, 
  ChevronRight, 
  X, 
  AlertCircle, 
  Phone, 
  CreditCard,
  Sparkles,
  Package,
  Layers,
  RefreshCw,
  Printer
} from 'lucide-react'

export const FarmerOrders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'escrow_locked' | 'dispatched' | 'disbursed'
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modals state
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null)
  const [selectedOrderForLogistics, setSelectedOrderForLogistics] = useState(null)

  const loadOrders = async () => {
    setLoading(true)
    try {
      const data = await orderService.getFarmerOrders()
      setOrders(data || [])
    } catch (err) {
      console.error('[FarmerOrders] Load error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleAdvanceStage = async (orderId, currentStage) => {
    const nextStage = Math.min(4, currentStage + 1)
    try {
      const updatedList = await orderService.advanceFarmerOrderStage(orderId, nextStage)
      setOrders(updatedList)
      const stageMessages = {
        2: 'APMC Electronic Gate Pass Issued & Vehicle Dispatched! 🚚',
        3: 'Produce Reached Mandi & Destination Weighbridge Verified! ⚖️',
        4: 'Direct Bank Transfer (DBT) Payout Settled in your Bank! 💸'
      }
      toast.success(stageMessages[nextStage] || 'Order updated!')
    } catch (err) {
      toast.error('Failed to advance order milestone.')
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = 
        (o._id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.crop?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.trader?.name || '').toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || o.paymentStatus === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orders, searchQuery, statusFilter])

  // KPIs
  const totalSettled = orders
    .filter((o) => o.paymentStatus === 'disbursed')
    .reduce((sum, o) => sum + (o.netFarmerPayout || 0), 0)

  const activeEscrow = orders
    .filter((o) => o.paymentStatus !== 'disbursed')
    .reduce((sum, o) => sum + (o.escrowAmount || 0), 0)

  const completedCount = orders.filter((o) => o.paymentStatus === 'disbursed').length

  return (
    <div className="space-y-8">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Guaranteed Bank Escrow Settlements</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Escrow Settlements & Orders
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track lot fulfillment, monitor real-time vehicle dispatch, and download digital APMC tax invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadOrders} 
            disabled={loading}
            className="rounded-xl text-xs h-10 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button asChild variant="outline" className="rounded-xl text-xs font-semibold h-10 shadow-sm">
            <Link to="/farmer/bids">Review Inbound Bids</Link>
          </Button>
          <Button asChild className="rounded-xl text-xs font-bold shadow-md h-10 px-5 bg-primary text-primary-foreground">
            <Link to="/farmer/listings">My Harvest Lots</Link>
          </Button>
        </div>
      </div>

      {/* 2. KPI Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Metric 1: Total Settled Payouts */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Disbursed to Bank</p>
            <h3 className="text-2xl font-black text-primary">₹{totalSettled.toLocaleString('en-IN')}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">{completedCount} Orders Completed</span>
          </div>
        </div>

        {/* Metric 2: Active Escrow Locked */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Secured in Escrow</p>
            <h3 className="text-2xl font-black text-amber-600">₹{activeEscrow.toLocaleString('en-IN')}</h3>
            <span className="text-[11px] text-muted-foreground">Releases upon APMC delivery</span>
          </div>
        </div>

        {/* Metric 3: Fulfillment Rate */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">APMC Transit Rate</p>
            <h3 className="text-2xl font-black text-foreground">100% On-Time</h3>
            <span className="text-[11px] text-muted-foreground">Zero default rate</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-3xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, crop, or buyer name..."
              className="w-full h-10 pl-10 pr-3 rounded-2xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center bg-muted/60 p-1 rounded-2xl border border-border text-xs font-semibold shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setStatusFilter('escrow_locked')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'escrow_locked' ? 'bg-card text-amber-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Escrow Locked
            </button>
            <button
              onClick={() => setStatusFilter('dispatched')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'dispatched' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              In Transit
            </button>
            <button
              onClick={() => setStatusFilter('disbursed')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'disbursed' ? 'bg-card text-emerald-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Settled
            </button>
          </div>
        </div>
      </div>

      {/* 4. Orders List Cards */}
      <div className="space-y-6">
        {filteredOrders.map((order) => {
          const isDisbursed = order.paymentStatus === 'disbursed'
          const isDispatched = order.paymentStatus === 'dispatched'

          return (
            <div 
              key={order._id}
              className="p-6 rounded-3xl bg-card border border-border hover:border-primary/50 shadow-sm transition-all space-y-6"
            >
              {/* Card Top: Order ID, Date & Total Amount */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">{order._id}</span>
                      <span className="text-xs text-muted-foreground">• Booked on {order.date}</span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-primary" /> Buyer: <span className="font-semibold text-foreground">{order.trader.name}</span> ({order.trader.district})
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] font-semibold text-muted-foreground block">Net Farmer Payout</span>
                    <span className="text-xl font-black text-primary">₹{order.netFarmerPayout.toLocaleString('en-IN')}</span>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isDisbursed 
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                      : isDispatched 
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  }`}>
                    {isDisbursed ? 'Disbursed to Bank 💸' : isDispatched ? 'In Logistics Transit 🚚' : 'Escrow Secured 🔒'}
                  </span>
                </div>
              </div>

              {/* Card Middle: Crop Snippet & 4-Stage Lifecycle Stepper */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                
                {/* Crop details */}
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden shrink-0 border border-border">
                    <img 
                      src={order.crop.image} 
                      alt={order.crop.name}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">{order.crop.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      Quantity: <span className="font-semibold text-foreground">{order.crop.quantity} {order.crop.unit}</span>
                    </p>
                    <p className="text-xs font-semibold text-primary">
                      Rate: ₹{order.crop.rate.toLocaleString('en-IN')}/Qtl
                    </p>
                  </div>
                </div>

                {/* 4-Stage Visual Lifecycle Stepper */}
                <div className="lg:col-span-2">
                  <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                      <span>Order Lifecycle & Bank Settlement</span>
                      <span className="text-primary font-mono text-xs">{order.utrNumber}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                      {/* Step 1: Escrow Funded */}
                      <div className="space-y-1">
                        <div className={`h-2 rounded-full ${order.stage >= 1 ? 'bg-primary' : 'bg-border'}`} />
                        <span className={`block font-semibold ${order.stage >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                          1. Escrow Locked
                        </span>
                      </div>

                      {/* Step 2: Dispatched */}
                      <div className="space-y-1">
                        <div className={`h-2 rounded-full ${order.stage >= 2 ? 'bg-primary' : 'bg-border'}`} />
                        <span className={`block font-semibold ${order.stage >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                          2. APMC Gate Pass
                        </span>
                      </div>

                      {/* Step 3: Weighment */}
                      <div className="space-y-1">
                        <div className={`h-2 rounded-full ${order.stage >= 3 ? 'bg-primary' : 'bg-border'}`} />
                        <span className={`block font-semibold ${order.stage >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                          3. Weighbridge Pass
                        </span>
                      </div>

                      {/* Step 4: Disbursed */}
                      <div className="space-y-1">
                        <div className={`h-2 rounded-full ${order.stage >= 4 ? 'bg-emerald-500' : 'bg-border'}`} />
                        <span className={`block font-semibold ${order.stage >= 4 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                          4. DBT Disbursed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Bottom: Logistics Details & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/80 text-xs">
                
                {/* Logistics status snippet */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block">{order.logistics.transporter} ({order.logistics.vehicleNumber})</span>
                    <span className="text-muted-foreground">{order.logistics.status}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedOrderForLogistics(order)}
                    className="rounded-xl text-xs font-semibold h-9 px-3"
                  >
                    <Truck className="w-3.5 h-3.5 mr-1" /> Track Logistics
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedOrderForInvoice(order)}
                    className="rounded-xl text-xs font-semibold h-9 px-3"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1" /> APMC Invoice
                  </Button>

                  {order.stage < 4 && (
                    <Button 
                      size="sm"
                      onClick={() => handleAdvanceStage(order._id, order.stage)}
                      className="rounded-xl text-xs font-bold h-9 px-4 bg-primary text-primary-foreground shadow-sm"
                    >
                      {order.stage === 1 ? 'Dispatch Lot 🚚' : order.stage === 2 ? 'Weighbridge Pass ⚖️' : 'Release DBT 💸'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 5. APMC Tax Invoice / Gate Pass Modal */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">
                    APMC Mandi Tax Invoice & Gate Pass
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Order #{selectedOrderForInvoice._id}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrderForInvoice(null)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Farmer Producer:</span>
                <span className="font-bold text-foreground">{user?.name || 'Ramesh Gowda'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Procurement Buyer:</span>
                <span className="font-bold text-foreground">{selectedOrderForInvoice.trader.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Produce:</span>
                <span className="font-bold text-foreground">{selectedOrderForInvoice.crop.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Escrow Value:</span>
                <span className="font-mono font-bold text-foreground">₹{selectedOrderForInvoice.escrowAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">APMC Market Cess (1.5%):</span>
                <span className="font-mono text-foreground">₹{selectedOrderForInvoice.mandiCess.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/80">
                <span className="font-bold text-foreground">Net DBT Settlement:</span>
                <span className="font-mono font-black text-sm text-primary">₹{selectedOrderForInvoice.netFarmerPayout.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <Button 
                onClick={() => {
                  window.print()
                  toast.success('Invoice dispatched to printer!')
                }}
                className="w-full rounded-xl text-xs font-bold h-10 bg-primary text-primary-foreground shadow-md"
              >
                <Printer className="w-4 h-4 mr-1.5" /> Print Tax Invoice
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Real-Time Logistics Tracking Modal */}
      {selectedOrderForLogistics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">
                    Live APMC Vehicle Tracking
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {selectedOrderForLogistics.logistics.vehicleNumber}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrderForLogistics(null)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transporter:</span>
                <span className="font-bold text-foreground">{selectedOrderForLogistics.logistics.transporter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assigned Driver:</span>
                <span className="font-bold text-foreground">{selectedOrderForLogistics.logistics.driverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver Contact:</span>
                <span className="font-mono font-bold text-primary">{selectedOrderForLogistics.logistics.driverPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Status:</span>
                <span className="font-semibold text-emerald-600">{selectedOrderForLogistics.logistics.status}</span>
              </div>
            </div>

            <Button 
              onClick={() => setSelectedOrderForLogistics(null)}
              className="w-full rounded-xl text-xs font-bold h-10"
            >
              Close Tracking Console
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FarmerOrders
