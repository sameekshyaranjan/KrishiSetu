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
  Printer,
  AlertCircle,
  AlertTriangle,
  Upload,
  UserCheck
} from 'lucide-react'

const STAGE_FILTERS = [
  { id: 'all', label: 'All Orders' },
  { id: 'pending', label: 'Vehicle Assignment / Pending 🚚' },
  { id: 'in_transit', label: 'In-Transit 🚛' },
  { id: 'disputed', label: 'Disputed Consignments ⚖️' },
  { id: 'delivered', label: 'Delivered & Disbursed 💸' }
]

export const TraderOrders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Modals
  const [selectedOrderForGps, setSelectedOrderForGps] = useState(null)
  const [selectedOrderForWaybill, setSelectedOrderForWaybill] = useState(null)
  
  // Vehicle Assignment Modal
  const [vehicleModalOrder, setVehicleModalOrder] = useState(null)
  const [vehicleForm, setVehicleForm] = useState({
    vehicleNumber: '',
    vehicleType: '',
    capacity: '',
    driverName: '',
    driverContact: '',
    vehiclePhoto: '',
    additionalNotes: ''
  })
  const [vehicleFile, setVehicleFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [submittingVehicle, setSubmittingVehicle] = useState(false)

  // Dispute Modal State
  const [disputeModalOrder, setDisputeModalOrder] = useState(null)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeFiles, setDisputeFiles] = useState([])
  const [disputePreviews, setDisputePreviews] = useState([])
  const [submittingDispute, setSubmittingDispute] = useState(false)

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
    toast.success('Procurement orders & fleet tracking telemetry updated! ⚡')
  }

  const handleOpenVehicleModal = (order) => {
    setVehicleModalOrder(order)
    setVehicleFile(null)
    setPhotoPreview(order.vehiclePhoto || '')
    setVehicleForm({
      vehicleNumber: order.vehicleDetails?.vehicleNumber || '',
      vehicleType: order.vehicleDetails?.vehicleType || '',
      capacity: order.vehicleDetails?.capacity || '',
      driverName: order.driverName || '',
      driverContact: order.driverContact || '',
      vehiclePhoto: order.vehiclePhoto || '',
      additionalNotes: order.vehicleDetails?.additionalNotes || ''
    })
  }

  const handleSubmitVehicle = async (e) => {
    e.preventDefault()
    if (!vehicleForm.vehicleNumber.trim()) {
      toast.error('Please enter vehicle registration number')
      return
    }
    if (!vehicleForm.vehicleType.trim()) {
      toast.error('Please enter vehicle type (e.g. Tata 407)')
      return
    }
    if (!vehicleForm.capacity.trim()) {
      toast.error('Please enter vehicle capacity (e.g. 10 tonnes)')
      return
    }
    if (!vehicleForm.driverName.trim()) {
      toast.error('Please enter driver name')
      return
    }
    if (!/^\d{10}$/.test(vehicleForm.driverContact.trim())) {
      toast.error('Please enter valid 10-digit driver contact number')
      return
    }

    setSubmittingVehicle(true)
    try {
      const formData = new FormData()
      formData.append('vehicleNumber', vehicleForm.vehicleNumber.trim())
      formData.append('vehicleType', vehicleForm.vehicleType.trim())
      formData.append('capacity', vehicleForm.capacity.trim())
      formData.append('driverName', vehicleForm.driverName.trim())
      formData.append('driverContact', vehicleForm.driverContact.trim())
      formData.append('additionalNotes', vehicleForm.additionalNotes.trim())
      if (vehicleFile) {
        formData.append('vehiclePhoto', vehicleFile)
      } else if (vehicleForm.vehiclePhoto) {
        formData.append('vehiclePhoto', vehicleForm.vehiclePhoto)
      }

      await orderService.submitVehicleDetails(vehicleModalOrder._id, formData)
      toast.success('Vehicle details assigned! Farmer notified to dispatch crop lot. 🚚')
      setVehicleModalOrder(null)
      await loadOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit vehicle details')
    } finally {
      setSubmittingVehicle(false)
    }
  }

  const handleConfirmDelivery = async (orderId) => {
    if (!window.confirm('Confirm that you have received this crop lot at the APMC yard? This will release the escrow funds directly to the farmer.')) {
      return
    }
    try {
      await orderService.confirmDelivery(orderId)
      toast.success('🎉 Delivery Confirmed! Escrow payout released to farmer via DBT.')
      await loadOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm delivery')
    }
  }

  const handleOpenDisputeModal = (order) => {
    setDisputeModalOrder(order)
    setDisputeReason('')
    setDisputeFiles([])
    setDisputePreviews([])
  }

  const handleDisputeFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const nextFiles = [...disputeFiles, ...files].slice(0, 5)
    setDisputeFiles(nextFiles)
    setDisputePreviews(nextFiles.map(f => URL.createObjectURL(f)))
  }

  const handleRemoveDisputeFile = (idx) => {
    const nextFiles = disputeFiles.filter((_, i) => i !== idx)
    setDisputeFiles(nextFiles)
    setDisputePreviews(nextFiles.map(f => URL.createObjectURL(f)))
  }

  const handleSubmitDispute = async (e) => {
    e.preventDefault()
    if (!disputeReason.trim() || disputeReason.trim().length < 10) {
      toast.error('Please describe the discrepancy in detail (min 10 characters).')
      return
    }
    if (disputeFiles.length === 0) {
      toast.error('Please attach at least 1 photo proof showing the discrepancy.')
      return
    }

    setSubmittingDispute(true)
    try {
      const formData = new FormData()
      formData.append('reason', disputeReason.trim())
      disputeFiles.forEach(file => {
        formData.append('proofPhotos', file)
      })

      await orderService.raiseDispute(disputeModalOrder._id, formData)
      toast.success('Dispute filed with photo evidence! APMC Admin notified. Escrow frozen. ⚖️')
      setDisputeModalOrder(null)
      await loadOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to file dispute')
    } finally {
      setSubmittingDispute(false)
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const isUnderReview = o.logisticsStatus === 'disputed' || (o.isDisputed && !o.isResolved)
      const isArbitrated = o.logisticsStatus === 'resolved' || o.isResolved
      const isDelivered = (o.currentStage || o.stage) === 4 || o.logisticsStatus === 'delivered' || o.paymentStatus === 'completed'
      const isInTransit = ((o.currentStage || o.stage) === 2 || (o.currentStage || o.stage) === 3 || o.logisticsStatus === 'in_transit' || o.logisticsStatus === 'arrived_mandi') && !isDelivered

      if (selectedFilter === 'all') return true
      if (selectedFilter === 'disputed') return isUnderReview || isArbitrated
      if (selectedFilter === 'delivered') return isDelivered
      if (selectedFilter === 'in_transit') return isInTransit && !isUnderReview
      if (selectedFilter === 'pending') return !isInTransit && !isDelivered && !isUnderReview
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
            Assign pickup transport vehicles, track farm-gate dispatches, and authorize escrow payouts upon verified APMC delivery.
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
          const currentStage = order.currentStage || order.stage || 1
          const isDelivered = currentStage === 4 || order.logisticsStatus === 'delivered' || order.paymentStatus === 'payout_released' || order.paymentStatus === 'completed'
          const isRefunded = order.paymentStatus === 'refunded' || order.rawPaymentStatus === 'refunded'
          const isDisputed = order.logisticsStatus === 'disputed' || order.isDisputed
          const isResolved = (order.logisticsStatus === 'resolved' || order.isResolved) && !isDelivered && !isRefunded
          const isInTransit = (currentStage === 2 || currentStage === 3 || order.logisticsStatus === 'in_transit' || order.logisticsStatus === 'arrived_mandi') && !isDelivered && !isDisputed
          const isPending = !isInTransit && !isDelivered && !isDisputed && !isRefunded

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
                      <span className="font-mono font-bold text-sm text-foreground">{order.orderCode || `KS-ORD-${String(order._id).slice(-6).toUpperCase()}`}</span>
                      <span className="text-xs text-muted-foreground">• Ordered on {order.createdAt || order.orderDate || 'Recent'}</span>
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
                      : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                  }`}>
                    {isRefunded
                      ? 'Refunded to Wallet 💰'
                      : isDisputed
                      ? 'Disputed • Under Review ⚖️'
                      : isResolved
                      ? (isInTransit ? 'Dispute Arbitrated • In Transit 🚚' : 'Dispute Resolved 🏛️')
                      : isDelivered 
                      ? 'Delivered & Disbursed 💸' 
                      : isInTransit 
                      ? 'In Transit 🚚' 
                      : order.hasVehicleDetails 
                      ? 'Vehicle Assigned • Awaiting Dispatch' 
                      : 'Action Required: Upload Vehicle'}
                  </span>
                </div>
              </div>

              {/* Middle Row: Crop & Transporter Telemetry */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                
                {/* Crop item info */}
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden shrink-0 border border-border shadow-xs">
                    <img 
                      src={order.image || order.images?.[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop'} 
                      alt={order.cropName} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop'
                      }}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-sm text-foreground">{order.cropName}</h4>
                    <p className="text-xs text-muted-foreground">{order.variety}</p>
                    <p className="text-xs font-mono font-bold text-primary">
                      {order.quantity} {order.unit} • ₹{order.agreedRate}/Qtl
                    </p>
                  </div>
                </div>

                {/* Transporter / Vehicle Information */}
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-sky-600" /> Assigned Vehicle
                    </span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                      order.hasVehicleDetails ? 'bg-sky-500/10 text-sky-600' : 'bg-rose-500/10 text-rose-600'
                    }`}>
                      {order.hasVehicleDetails ? order.vehicleNumber : 'Not Assigned'}
                    </span>
                  </div>
                  
                  {order.hasVehicleDetails ? (
                    <div className="flex items-center gap-3 pt-1">
                      {order.vehiclePhoto && (
                        <img
                          src={order.vehiclePhoto.startsWith('http') || order.vehiclePhoto.startsWith('blob:') ? order.vehiclePhoto : `http://localhost:5000${order.vehiclePhoto}`}
                          alt="Truck"
                          className="w-14 h-14 rounded-xl object-cover border border-border shrink-0 shadow-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop';
                          }}
                        />
                      )}
                      <div className="space-y-0.5 text-[11px]">
                        <p className="text-foreground font-bold">
                          {order.vehicleType} {order.capacity ? `(${order.capacity})` : ''}
                        </p>
                        <p className="text-muted-foreground">
                          Driver: <strong className="text-foreground">{order.driverName}</strong>
                        </p>
                        <p className="text-muted-foreground">
                          Phone: <strong className="text-foreground font-mono">{order.driverContact}</strong>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      Upload vehicle details to enable farmer dispatch.
                    </p>
                  )}
                </div>

                {/* Logistics / Weighbridge Status */}
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-emerald-600" /> Logistics Status
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isDelivered
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : isInTransit
                        ? 'bg-sky-500/10 text-sky-600'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {isDelivered ? 'Delivered ⚖️' : isInTransit ? 'In Transit 🚚' : 'Pending Dispatch'}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-[11px]">
                    <span>Declared Lot: <strong>{order.quantity} {order.unit}</strong></span>
                    <span>Net Verified: <strong className="text-foreground">{order.quantity} {order.unit}</strong></span>
                  </div>
                </div>
              </div>

              {/* Dispute Under Arbitration Banner (When Disputed) */}
              {isDisputed && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <Scale className="w-4 h-4" /> APMC Dispute Lodged • Under Admin Review
                    </span>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300">
                      Escrow Frozen: ₹{order.grossEscrow?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You have lodged an official quality or delivery dispute for this harvest consignment. Your complaint and photographic proofs have been submitted to the APMC Karnataka Arbitration Panel. Escrow funds will remain safely frozen until formal ruling.
                  </p>
                </div>
              )}

              {/* Dispute Resolved Banner (When Resolved) */}
              {isResolved && (
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-purple-600" /> APMC Arbitration Ruling Recorded
                    </span>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-700 dark:text-purple-300 uppercase">
                      {order.disputeResolution || order.dispute?.ruling?.action || 'RESOLVED 🏛️'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {order.disputeResolution === 'split_85_15'
                      ? `Statutory Ruling: 85/15 Mutual Split. Farmer will receive ₹${(order.farmerPayoutAmount || Math.round(order.grossEscrow * 0.85)).toLocaleString('en-IN')} (85%), and your wallet will be refunded ₹${(order.traderRefundAmount || Math.round(order.grossEscrow * 0.15)).toLocaleString('en-IN')} (15%).`
                      : order.disputeResolution === 'payout_farmer'
                      ? `Statutory Ruling: 100% Payout to Farmer Upheld: ₹${order.grossEscrow?.toLocaleString('en-IN')}.`
                      : order.disputeResolution === 'refund_trader'
                      ? `Statutory Ruling: 100% Refunded to your wallet: ₹${order.grossEscrow?.toLocaleString('en-IN')}. Order closed.`
                      : 'Statutory dispute ruling recorded.'}
                  </p>
                  <p className="text-[11px] font-semibold text-purple-600">
                    {order.disputeResolutionStatus === 'awaiting_delivery' || order.rawPaymentStatus === 'held_in_escrow'
                      ? '🔒 Escrow funds remain safely held in vault until you confirm physical delivery at the APMC yard.'
                      : '✅ Financial resolution finalized.'}
                  </p>
                </div>
              )}

              {/* Amount Disbursed to Farmer & Settled Banner (When Delivered) */}
              {isDelivered && !isDisputed && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Amount Disbursed & Order Settled
                    </span>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      Status: PAID / DISBURSED
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Crop Produce</span>
                      <span className="font-bold text-foreground">{order.cropName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Farmer Payout</span>
                      <span className="font-bold text-emerald-600">₹{(order.farmerPayoutAmount || order.grossEscrow)?.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Buyer Refund</span>
                      <span className="font-black text-amber-600 text-sm">₹{(order.traderRefundAmount || 0)?.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Settlement Date</span>
                      <span className="font-semibold text-foreground">{order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('en-IN') : 'Completed'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border/80 text-xs">
                <span className="text-muted-foreground flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> APMC Electronic Gate Pass & Escrow Protected
                </span>

                <div className="flex flex-wrap items-center gap-2">
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

                  {/* Upload Vehicle Details Button */}
                  {isPending && (
                    <Button
                      size="sm"
                      onClick={() => handleOpenVehicleModal(order)}
                      className={`rounded-xl text-xs font-bold h-9 px-4 shadow-sm ${
                        order.hasVehicleDetails
                          ? 'bg-muted text-foreground border border-border hover:bg-muted/80'
                          : 'bg-amber-600 hover:bg-amber-700 text-white'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5 mr-1" />
                      {order.hasVehicleDetails ? 'Edit Vehicle Details' : 'Upload Vehicle Details'}
                    </Button>
                  )}

                  {/* Raise Dispute button (available prior to confirmed delivery) */}
                  {(isInTransit || isPending) && !isDisputed && !isDelivered && !isResolved && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDisputeModal(order)}
                      className="rounded-xl text-xs font-bold h-9 px-3 text-amber-600 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-700"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Raise Dispute
                    </Button>
                  )}

                  {/* Confirm Delivery Button - Available for active in-transit lots (normal or arbitrated awaiting delivery) */}
                  {(isInTransit || (isResolved && (order.disputeResolutionStatus === 'awaiting_delivery' || order.rawPaymentStatus === 'held_in_escrow' || order.paymentStatus === 'held_in_escrow'))) && !isDisputed && !isDelivered && (
                    <Button
                      size="sm"
                      onClick={() => handleConfirmDelivery(order._id)}
                      className={`rounded-xl text-xs font-bold h-9 px-4 text-white shadow-sm ${
                        isResolved
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      {isResolved
                        ? 'Confirm Delivery & Execute Dispute Settlement 🏛️'
                        : 'Confirm Delivery & Release Escrow 💸'}
                    </Button>
                  )}

                  {isDisputed && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5" /> Escrow Frozen • In Arbitration ⚖️
                    </span>
                  )}

                  {isRefunded && (
                    <span className="text-xs font-bold text-rose-600 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Refunded to Wallet 💰
                    </span>
                  )}

                  {isDelivered && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Order Completed & Settled
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
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 mx-auto flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-foreground">No Procurement Orders Found</p>
          <p className="text-xs text-muted-foreground">Active orders created from accepted crop bids will appear here for vehicle assignment and delivery confirmation.</p>
          <Button asChild size="sm" className="rounded-xl">
            <Link to="/trader/marketplace">Explore Crop Marketplace</Link>
          </Button>
        </div>
      )}

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
                    Vehicle #{selectedOrderForGps.vehicleNumber || 'Unassigned'}
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
                <span className="text-muted-foreground">Registration:</span>
                <span className="font-bold text-foreground">{selectedOrderForGps.vehicleNumber || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver:</span>
                <span className="font-bold text-foreground">{selectedOrderForGps.driverName || 'Designated Driver'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver Contact:</span>
                <span className="font-mono font-bold text-sky-600">{selectedOrderForGps.driverContact || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fleet Type:</span>
                <span className="font-semibold text-foreground">{selectedOrderForGps.vehicleType || 'Standard APMC Truck'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Status:</span>
                <span className="font-mono text-emerald-600 font-bold">
                  {selectedOrderForGps.currentStage === 4 ? 'Delivered at APMC Yard' : selectedOrderForGps.currentStage === 2 ? 'In-Transit on State Highway' : 'Awaiting Farm Gate Pickup'}
                </span>
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
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">
                    National APMC e-Waybill Slip
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Digital Transit Pass #{selectedOrderForWaybill._id}
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

            <div className="p-6 rounded-2xl bg-muted/30 border border-border space-y-4 text-xs font-mono">
              <div className="text-center border-b border-border pb-3">
                <p className="font-black text-sm uppercase">Govt. of Karnataka — Agricultural Marketing Dept.</p>
                <p className="text-[10px] text-muted-foreground">Unified Market Platform Electronic Waybill (Rule 32A)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Consignor (Farmer):</span>
                  <span className="font-bold text-foreground">{selectedOrderForWaybill.farmer?.name}</span>
                  <p className="text-[10px] text-muted-foreground">{selectedOrderForWaybill.farmer?.district}, Karnataka</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Consignee (Trader):</span>
                  <span className="font-bold text-foreground">{user?.name}</span>
                  <p className="text-[10px] text-muted-foreground">APMC Yard License Holder</p>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <div className="flex justify-between py-1">
                  <span>Commodity:</span>
                  <strong className="text-foreground">{selectedOrderForWaybill.cropName}</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Quantity:</span>
                  <strong>{selectedOrderForWaybill.quantity} {selectedOrderForWaybill.unit}</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Assigned Vehicle:</span>
                  <strong className="text-foreground">{selectedOrderForWaybill.vehicleNumber || 'Unassigned'}</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Driver Name:</span>
                  <strong className="text-foreground">{selectedOrderForWaybill.driverName || 'Designated Driver'}</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Escrow Amount:</span>
                  <strong>₹{selectedOrderForWaybill.grossEscrow?.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={() => {
                  window.print()
                  toast.success('Waybill document sent to printer spooler')
                }}
                className="flex-1 rounded-xl text-xs font-bold h-10 bg-primary text-primary-foreground"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Physical Gate Pass
              </Button>
              <Button 
                variant="outline"
                onClick={() => setSelectedOrderForWaybill(null)}
                className="rounded-xl text-xs h-10 px-4"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Upload Vehicle Details Modal (Phase 9) */}
      {vehicleModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">
                    Assign Collection Vehicle & Driver 🚛
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    Order: {vehicleModalOrder.orderCode || `KS-ORD-${String(vehicleModalOrder._id).slice(-6).toUpperCase()}`} ({vehicleModalOrder.cropName})
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setVehicleModalOrder(null)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitVehicle} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Vehicle Registration Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. KA-04-E-8821"
                  value={vehicleForm.vehicleNumber}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-muted border border-border font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Driver Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Raju Gowda"
                    value={vehicleForm.driverName}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, driverName: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Driver Contact (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9845012345"
                    maxLength={10}
                    value={vehicleForm.driverContact}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, driverContact: e.target.value.replace(/\D/g, '') })}
                    className="w-full h-10 px-3 rounded-xl bg-muted border border-border font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Vehicle Type *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tata 407"
                    value={vehicleForm.vehicleType}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Capacity *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10 tonnes"
                    value={vehicleForm.capacity}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Upload Truck / Vehicle Photo (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-dashed border-border bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors text-xs font-semibold">
                    <Upload className="w-4 h-4" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setVehicleFile(file)
                          setPhotoPreview(URL.createObjectURL(file))
                        }
                      }}
                    />
                  </label>
                  {photoPreview && (
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-border shrink-0">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setVehicleFile(null); setPhotoPreview(''); }}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center text-[10px]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <span className="text-[11px] text-muted-foreground truncate">
                    {vehicleFile ? vehicleFile.name : (photoPreview ? 'Photo selected' : 'PNG, JPG up to 10MB')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Additional Notes / Mandi Waybill Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Driver will arrive at farm gate before 09:00 AM carrying digital waybill slip."
                  value={vehicleForm.additionalNotes}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, additionalNotes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={submittingVehicle}
                  className="flex-1 rounded-xl text-xs font-bold h-10 bg-amber-600 hover:bg-amber-700 text-white shadow-md"
                >
                  {submittingVehicle ? 'Registering Vehicle...' : 'Save & Notify Farmer for Dispatch 🚀'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setVehicleModalOrder(null)}
                  className="rounded-xl text-xs h-10 px-4"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. APMC Dispute Filing Modal */}
      {disputeModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">
                    Raise Consignment Dispute ⚖️
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Order: <span className="font-mono font-bold text-foreground">{disputeModalOrder.orderCode || disputeModalOrder._id}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDisputeModalOrder(null)}
                className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Escrow Lock Warning */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
              <p className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Escrow Protection Notice
              </p>
              <p className="text-muted-foreground text-[11px]">
                Submitting this dispute will immediately freeze <strong className="text-foreground">₹{disputeModalOrder.grossEscrow?.toLocaleString('en-IN')}</strong> in escrow. Delivery payout is halted pending APMC state arbitration.
              </p>
            </div>

            <form onSubmit={handleSubmitDispute} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Dispute Reason / Description of Defect <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe produce condition, transit bruising, moisture discrepancy, or weight shortage upon arrival..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Upload Photo Proof(s) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-dashed border-border bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors text-xs font-semibold">
                    <Upload className="w-4 h-4" />
                    <span>Upload Evidence (Max 5)</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleDisputeFileChange}
                    />
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    {disputeFiles.length > 0 ? `${disputeFiles.length} photo(s) selected` : 'JPG, PNG up to 10MB'}
                  </span>
                </div>

                {/* Photo Previews */}
                {disputePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3">
                    {disputePreviews.map((src, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border shadow-xs">
                        <img src={src} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveDisputeFile(idx)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 rounded-full text-white flex items-center justify-center text-[10px]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={submittingDispute}
                  className="flex-1 rounded-xl text-xs font-bold h-10 bg-amber-600 hover:bg-amber-700 text-white shadow-md"
                >
                  {submittingDispute ? 'Submitting Dispute...' : 'Lodge Dispute & Freeze Escrow ⚖️'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDisputeModalOrder(null)}
                  className="rounded-xl text-xs h-10 px-4"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default TraderOrders
