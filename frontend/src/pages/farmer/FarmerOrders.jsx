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
  Printer,
  Scale
} from 'lucide-react'

export const FarmerOrders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'escrow_locked' | 'disbursed'
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null)
  const [selectedOrderForLogistics, setSelectedOrderForLogistics] = useState(null)
  const [dispatchingId, setDispatchingId] = useState(null)

  const loadOrders = async () => {
    setLoading(true)
    try {
      const data = await orderService.getFarmerOrders()
      setOrders(data || [])
    } catch (err) {
      console.error('[FarmerOrders] Failed to load orders:', err)
      toast.error('Could not load order transactions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  // Phase 11: Farmer Dispatch Handler
  const handleDispatch = async (orderId) => {
    setDispatchingId(orderId)
    try {
      await orderService.dispatchOrder(orderId)
      toast.success('🎉 Crop Lot Dispatched! Transporter is now in transit to APMC yard. 🚚')
      await loadOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch crop lot.')
    } finally {
      setDispatchingId(null)
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = 
        (o.orderCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.crop?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.trader?.name || '').toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'disputed' 
          ? (o.isDisputed || o.logisticsStatus === 'disputed' || o.isResolved || o.logisticsStatus === 'resolved') 
          : o.paymentStatus === statusFilter)
      return matchesSearch && matchesStatus
    })
  }, [orders, searchQuery, statusFilter])

  // Real Database KPIs (Phase 14)
  const totalSettled = orders
    .filter((o) => o.stage === 4 || o.paymentStatus === 'disbursed')
    .reduce((sum, o) => sum + (o.escrowAmount || 0), 0)

  const activeEscrow = orders
    .filter((o) => o.stage < 4 && o.paymentStatus !== 'disbursed')
    .reduce((sum, o) => sum + (o.escrowAmount || 0), 0)

  const completedCount = orders.filter((o) => o.stage === 4 || o.paymentStatus === 'disbursed').length

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
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
            Track lot fulfillment, monitor transporter vehicle details, dispatch harvest produce, and inspect escrow DBT payouts.
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

      {/* 2. KPI Financial Summary Cards (Phase 14 Real Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Metric 1: Total Settled Payouts */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Disbursed to Bank (DBT)</p>
            <h3 className="text-2xl font-black text-primary">₹{totalSettled.toLocaleString('en-IN')}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">{completedCount} Orders Settled</span>
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

        {/* Metric 3: Total Orders */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Total Transactions</p>
            <h3 className="text-2xl font-black text-foreground">{orders.length}</h3>
            <span className="text-[11px] text-muted-foreground">All authenticated procurement lots</span>
          </div>
        </div>
      </div>

      {/* 3. Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by order ID, crop, or buyer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'escrow_locked', label: 'Active Escrow 🔒' },
            { id: 'disbursed', label: 'Disbursed / Completed 💸' },
            { id: 'disputed', label: 'Disputes & Claims ⚖️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Orders List Cards */}
      <div className="space-y-6">
        {filteredOrders.map((order) => {
          const isDelivered = order.stage === 4 || order.logisticsStatus === 'delivered'
          const isInTransit = (order.stage === 2 || order.stage === 3 || order.logisticsStatus === 'in_transit' || order.logisticsStatus === 'arrived_mandi') && !isDelivered
          const isDisputed = order.isDisputed || order.logisticsStatus === 'disputed'
          const isResolved = order.isResolved || order.logisticsStatus === 'resolved' || Boolean(order.dispute && order.dispute.status?.startsWith('resolved_'))
          const isRefunded = order.paymentStatus === 'refunded' || order.rawPaymentStatus === 'refunded'
          const isPending = !isDelivered && !isInTransit && !isDisputed && !isRefunded

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
                      <span className="font-mono font-bold text-sm text-foreground">{order.orderCode}</span>
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
                    <span className="text-xl font-black text-primary">₹{order.escrowAmount?.toLocaleString('en-IN')}</span>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isRefunded
                      ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      : isDisputed
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      : isResolved
                      ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                      : isDelivered 
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                      : isInTransit 
                      ? 'bg-sky-500/10 text-sky-600 border border-sky-500/20'
                      : order.hasVehicleDetails
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}>
                    {isRefunded
                      ? 'Refunded to Buyer 🛑'
                      : isDisputed
                      ? 'Disputed • Under Review ⚖️'
                      : isResolved
                      ? 'Dispute Resolved 🏛️'
                      : isDelivered 
                      ? 'Disbursed to Bank 💸' 
                      : isInTransit 
                      ? 'In Logistics Transit 🚚' 
                      : order.hasVehicleDetails
                      ? 'Ready for Dispatch' 
                      : 'Awaiting Vehicle Details 🔒'}
                  </span>
                </div>
              </div>

              {/* Dispute Under Review Banner */}
              {isDisputed && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-amber-600" /> APMC Dispute Lodged by Buyer • Under Tribunal Review
                    </span>
                    <span className="font-mono font-bold px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300">
                      Escrow Frozen: ₹{order.escrowAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-muted-foreground font-medium">
                    Reason reported: &quot;{order.dispute?.reason || 'Quality or transit discrepancy reported by buyer'}&quot;
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                    Escrow funds are safely frozen in the APMC vault. Consignment dispatch and financial settlement are held until state administrator arbitration.
                  </p>
                </div>
              )}

              {/* Dispute Resolved Banner */}
              {isResolved && (
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-purple-600" /> APMC Dispute Ruling Finalized
                    </span>
                    <span className="font-mono font-bold px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-700 dark:text-purple-300 uppercase">
                      {order.disputeResolution || order.dispute?.ruling?.action || 'RESOLVED'}
                    </span>
                  </div>
                  <p className="text-muted-foreground font-medium">
                    {order.disputeResolution === 'split_85_15'
                      ? `Tribunal Ruling: 85/15 Mutual Split. Your Payout: ₹${(order.farmerPayoutAmount || Math.round(order.escrowAmount * 0.85)).toLocaleString('en-IN')} (85%), Buyer Refund: ₹${(order.traderRefundAmount || Math.round(order.escrowAmount * 0.15)).toLocaleString('en-IN')} (15%).`
                      : order.disputeResolution === 'payout_farmer'
                      ? `Tribunal Ruling: 100% Payout to Farmer Approved: ₹${order.escrowAmount?.toLocaleString('en-IN')}.`
                      : order.disputeResolution === 'refund_trader'
                      ? 'Tribunal Ruling: 100% Refund to Buyer. Order closed and crop lot delisted.'
                      : 'Tribunal arbitration completed.'}
                  </p>
                  <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                    {order.disputeResolutionStatus === 'awaiting_delivery' || order.rawPaymentStatus === 'held_in_escrow'
                      ? '⏳ Funds remain held in escrow. Payout will be disbursed directly upon verified delivery acceptance.'
                      : '✅ Financial resolution executed.'}
                  </p>
                </div>
              )}

              {/* Card Middle: Crop Snippet & 4-Stage Lifecycle Stepper */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                
                {/* Crop details */}
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden shrink-0 border border-border">
                    <img 
                      src={order.crop.image || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop'} 
                      alt={order.crop.name}
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop'
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">{order.crop.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      Quantity: <span className="font-semibold text-foreground">{order.crop.quantity} {order.crop.unit}</span>
                    </p>
                    <p className="text-xs font-semibold text-primary">
                      Rate: ₹{order.crop.rate?.toLocaleString('en-IN')}/Qtl
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
                          2. APMC Dispatched
                        </span>
                      </div>

                      {/* Step 3: Weighment */}
                      <div className="space-y-1">
                        <div className={`h-2 rounded-full ${order.stage >= 3 ? 'bg-primary' : 'bg-border'}`} />
                        <span className={`block font-semibold ${order.stage >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                          3. Mandi Arrival
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

              {/* Phase 10: Transporter & Vehicle Details Box */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-primary" /> Transporter Vehicle Details
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-md font-mono text-xs font-bold ${
                    order.hasVehicleDetails ? 'bg-sky-500/10 text-sky-600 border border-sky-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  }`}>
                    {order.hasVehicleDetails ? order.vehicleNumber : 'Pending Trader Assignment'}
                  </span>
                </div>

                {order.hasVehicleDetails ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                    <div className="flex items-center gap-3">
                      {order.vehiclePhoto && (
                        <img
                          src={order.vehiclePhoto.startsWith('http') || order.vehiclePhoto.startsWith('blob:') ? order.vehiclePhoto : `http://localhost:5000${order.vehiclePhoto}`}
                          alt="Vehicle"
                          className="w-14 h-14 rounded-xl object-cover border border-border shrink-0 shadow-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop';
                          }}
                        />
                      )}
                      <div className="space-y-0.5">
                        <p className="text-foreground font-bold">
                          Driver: {order.driverName} <span className="font-normal text-muted-foreground">• {order.vehicleType} {order.capacity ? `(${order.capacity})` : ''}</span>
                        </p>
                        <p className="text-muted-foreground font-mono">
                          Contact: <strong className="text-primary">{order.driverContact}</strong>
                        </p>
                      </div>
                    </div>

                    {isPending && (
                      <Button
                        size="sm"
                        disabled={dispatchingId === order._id}
                        onClick={() => handleDispatch(order._id)}
                        className="rounded-xl text-xs font-bold h-9 px-5 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                      >
                        <Truck className="w-3.5 h-3.5 mr-1.5" />
                        {dispatchingId === order._id ? 'Dispatching...' : 'Dispatch Crop Lot 🚚'}
                      </Button>
                    )}
                  </div>
                ) : isDisputed ? (
                  <p className="text-xs text-amber-600 flex items-center gap-1.5 pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    Consignment is currently under APMC arbitration. Dispatch is on hold.
                  </p>
                ) : isRefunded ? (
                  <p className="text-xs text-rose-600 flex items-center gap-1.5 pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    This transaction was refunded to buyer and closed.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    Awaiting transporter vehicle registration from trader. You can dispatch the lot once vehicle details are received.
                  </p>
                )}
              </div>

              {/* Phase 14: Payout Received & Settled Banner (When Delivered) */}
              {isDelivered && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Payout Received & Settled 💸
                    </span>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      Status: PAID / DISBURSED
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Crop Lot</span>
                      <span className="font-bold text-foreground">{order.crop?.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Procuring Trader</span>
                      <span className="font-bold text-foreground">{order.trader?.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Net Payout Received</span>
                      <span className="font-black text-emerald-600 text-sm">₹{order.escrowAmount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">DBT Settlement Reference</span>
                      <span className="font-mono font-bold text-foreground">{order.utrNumber}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Bottom: Logistics Details & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/80 text-xs">
                
                {/* Logistics status snippet */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block">
                      {order.hasVehicleDetails ? `${order.vehicleType} (${order.vehicleNumber})` : 'Transporter Unassigned'}
                    </span>
                    <span className="text-muted-foreground">
                      {isDelivered ? 'Delivered at APMC Mandi Yard' : isInTransit ? 'In-Transit on State Highway' : 'Awaiting Farm Gate Pickup'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
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

                  {/* Dispatch Button if pending */}
                  {isPending && order.hasVehicleDetails && (
                    <Button 
                      size="sm"
                      disabled={dispatchingId === order._id}
                      onClick={() => handleDispatch(order._id)}
                      className="rounded-xl text-xs font-bold h-9 px-4 bg-primary text-primary-foreground shadow-sm"
                    >
                      <Truck className="w-3.5 h-3.5 mr-1" />
                      {dispatchingId === order._id ? 'Dispatching...' : 'Dispatch Lot 🚚'}
                    </Button>
                  )}

                  {isPending && !order.hasVehicleDetails && (
                    <span className="text-xs text-muted-foreground font-semibold bg-muted px-3 py-1.5 rounded-xl border border-border">
                      Awaiting Trader Vehicle Details
                    </span>
                  )}

                  {isInTransit && (
                    <span className="text-xs font-bold text-sky-600 bg-sky-500/10 px-3 py-1.5 rounded-xl border border-sky-500/20 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> In Transit to APMC Yard
                    </span>
                  )}

                  {isDelivered && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Payout Settled to Bank
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && !loading && (
        <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-foreground">No Orders Found</p>
          <p className="text-xs text-muted-foreground">Orders will appear here once you accept a trader's bid for your harvest crops.</p>
          <Button asChild size="sm" className="rounded-xl">
            <Link to="/farmer/bids">Check Inbound Bids</Link>
          </Button>
        </div>
      )}

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
                    Order #{selectedOrderForInvoice.orderCode}
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
                <span className="text-muted-foreground">Assigned Vehicle:</span>
                <span className="font-mono font-bold text-foreground">{selectedOrderForInvoice.vehicleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Escrow Value:</span>
                <span className="font-mono font-bold text-foreground">₹{selectedOrderForInvoice.escrowAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Net Payout to Farmer:</span>
                <span className="font-mono font-bold text-emerald-600">₹{selectedOrderForInvoice.escrowAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">UTR Transaction Ref:</span>
                <span className="font-mono text-foreground font-bold">{selectedOrderForInvoice.utrNumber}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={() => {
                  window.print()
                  toast.success('Invoice sent to printer')
                }}
                className="flex-1 rounded-xl text-xs font-bold h-10 bg-primary text-primary-foreground"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Tax Receipt
              </Button>
              <Button 
                variant="outline"
                onClick={() => setSelectedOrderForInvoice(null)}
                className="rounded-xl text-xs h-10 px-4"
              >
                Close
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
                    Farm-Gate Logistics Telemetry
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Order {selectedOrderForLogistics.orderCode}
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
                <span className="text-muted-foreground">Assigned Vehicle:</span>
                <span className="font-mono font-bold text-foreground">{selectedOrderForLogistics.vehicleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver Name:</span>
                <span className="font-bold text-foreground">{selectedOrderForLogistics.driverName || 'Designated Transporter'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver Phone:</span>
                <span className="font-mono font-bold text-primary">{selectedOrderForLogistics.driverContact || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Transit Phase:</span>
                <span className="font-bold text-emerald-600">
                  {selectedOrderForLogistics.stage === 4 ? 'Delivered & Disbursed' : selectedOrderForLogistics.stage === 2 ? 'In-Transit on State Highway' : 'Awaiting Farm Gate Pickup'}
                </span>
              </div>
            </div>

            {selectedOrderForLogistics.vehiclePhoto && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Verified Transport Vehicle:</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md font-mono font-bold">Cloudinary Verified</span>
                </div>
                <div className="relative h-44 rounded-2xl overflow-hidden border border-border group bg-muted">
                  <img
                    src={selectedOrderForLogistics.vehiclePhoto}
                    alt="Assigned Vehicle"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <Button 
              onClick={() => setSelectedOrderForLogistics(null)}
              className="w-full rounded-xl text-xs font-bold h-10 bg-primary text-primary-foreground"
            >
              Close Telemetry
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}

export default FarmerOrders
