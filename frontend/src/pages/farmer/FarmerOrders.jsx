import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
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
  Layers
} from 'lucide-react'

const MOCK_ORDERS = [
  {
    _id: 'ORD-KA-9912',
    date: '2026-08-25',
    crop: {
      name: 'Tomato (Hybrid Bangalore Grade A)',
      quantity: 80,
      unit: 'Quintals',
      rate: 2350,
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop'
    },
    trader: {
      name: 'Mysuru Agro Exporters Pvt Ltd',
      apmcLicense: 'APMC-MYS-8821',
      mobile: '+91 98450 12345',
      district: 'Mysuru'
    },
    escrowAmount: 188000,
    mandiCess: 2820,
    netFarmerPayout: 185180,
    paymentStatus: 'disbursed', // 'escrow_locked' | 'dispatched' | 'completed' | 'disbursed'
    stage: 4, // 1 to 4
    utrNumber: 'HDFCR52026082500918',
    logistics: {
      transporter: 'Kisan Express Agri-Logistics',
      vehicleNumber: 'KA-09-E-4421',
      driverName: 'Ramesh Gowda',
      driverPhone: '+91 98860 55432',
      status: 'Delivered at APMC Yard'
    }
  },
  {
    _id: 'ORD-KA-9915',
    date: '2026-08-26',
    crop: {
      name: 'Red Onion (Bellary Medium)',
      quantity: 120,
      unit: 'Quintals',
      rate: 2600,
      image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&auto=format&fit=crop'
    },
    trader: {
      name: 'Bengaluru Fresh Produce Wholesalers',
      apmcLicense: 'APMC-BLR-4419',
      mobile: '+91 99001 98765',
      district: 'Bengaluru Urban'
    },
    escrowAmount: 312000,
    mandiCess: 4680,
    netFarmerPayout: 307320,
    paymentStatus: 'dispatched',
    stage: 2,
    utrNumber: 'Pending Weighment',
    logistics: {
      transporter: 'Karnataka State APMC Logistics Fleet',
      vehicleNumber: 'KA-04-F-8812',
      driverName: 'Manjunath K',
      driverPhone: '+91 97410 22334',
      status: 'In Transit to Farm Gate'
    }
  },
  {
    _id: 'ORD-KA-9918',
    date: '2026-08-27',
    crop: {
      name: 'Yellow Maize (Commercial Poultry Grade)',
      quantity: 60,
      unit: 'Quintals',
      rate: 2150,
      image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&auto=format&fit=crop'
    },
    trader: {
      name: 'Dharwad Feeds & Grains Syndicate',
      apmcLicense: 'APMC-DHD-1102',
      mobile: '+91 94480 33211',
      district: 'Dharwad'
    },
    escrowAmount: 129000,
    mandiCess: 1935,
    netFarmerPayout: 127065,
    paymentStatus: 'escrow_locked',
    stage: 1,
    utrNumber: 'Secured in Escrow',
    logistics: {
      transporter: 'Assigned upon confirmation',
      vehicleNumber: 'Pending allocation',
      driverName: 'Fleet Coordinator',
      driverPhone: '+91 80 2345 6789',
      status: 'Vehicle being scheduled'
    }
  }
]

export const FarmerOrders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState(MOCK_ORDERS)
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'escrow_locked' | 'dispatched' | 'disbursed'
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modals state
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null)
  const [selectedOrderForLogistics, setSelectedOrderForLogistics] = useState(null)

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = 
        o._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.trader.name.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || o.paymentStatus === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orders, searchQuery, statusFilter])

  // KPIs
  const totalSettled = orders
    .filter((o) => o.paymentStatus === 'disbursed')
    .reduce((sum, o) => sum + o.netFarmerPayout, 0)

  const activeEscrow = orders
    .filter((o) => o.paymentStatus !== 'disbursed')
    .reduce((sum, o) => sum + o.escrowAmount, 0)

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
                    {isDisbursed ? 'Disbursed to Bank' : isDispatched ? 'In Logistics Transit' : 'Escrow Secured'}
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
                          2. Logistics Pickup
                        </span>
                      </div>

                      {/* Step 3: Weighment */}
                      <div className="space-y-1">
                        <div className={`h-2 rounded-full ${order.stage >= 3 ? 'bg-primary' : 'bg-border'}`} />
                        <span className={`block font-semibold ${order.stage >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                          3. Quality Verified
                        </span>
                      </div>

                      {/* Step 4: Disbursed */}
                      <div className="space-y-1">
                        <div className={`h-2 rounded-full ${order.stage >= 4 ? 'bg-emerald-500' : 'bg-border'}`} />
                        <span className={`block font-semibold ${order.stage >= 4 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                          4. Bank Disbursed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/80 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Truck className="w-3.5 h-3.5 text-primary" />
                  <span>Logistics: <span className="font-semibold text-foreground">{order.logistics.status}</span> ({order.logistics.vehicleNumber})</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setSelectedOrderForLogistics(order)}
                    className="rounded-xl text-xs font-semibold h-9 shadow-sm"
                  >
                    <Truck className="w-3.5 h-3.5 mr-1.5" /> Vehicle Details
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => setSelectedOrderForInvoice(order)}
                    className="rounded-xl text-xs font-bold h-9 shadow-sm bg-primary text-primary-foreground"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5" /> APMC Mandi Bill
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 5. Digital APMC Mandi Tax Invoice Modal */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedOrderForInvoice(null)}
              className="absolute right-5 top-5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Bill Header */}
            <div className="border-b border-border pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground leading-tight">
                    APMC Electronic Mandi Receipt
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    eNAM / Government of Karnataka Regulated Bill
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-primary block">
                  {selectedOrderForInvoice._id}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Date: {selectedOrderForInvoice.date}
                </span>
              </div>
            </div>

            {/* Parties Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Farmer Seller Details:
                </span>
                <p className="font-bold text-foreground">{user?.name || 'Lori Osinski-Rodriguez'}</p>
                <p className="text-muted-foreground">District: {user?.district || 'Hassan'}, Karnataka</p>
                <p className="text-muted-foreground font-mono text-[11px]">Bank A/C: •••••••• 4492 (Direct UPI / RTGS)</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Buyer / Trader Details:
                </span>
                <p className="font-bold text-foreground">{selectedOrderForInvoice.trader.name}</p>
                <p className="text-muted-foreground">License: {selectedOrderForInvoice.trader.apmcLicense}</p>
                <p className="text-muted-foreground">Phone: {selectedOrderForInvoice.trader.mobile}</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="rounded-2xl border border-border overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-muted/60 text-muted-foreground font-bold border-b border-border">
                  <tr>
                    <th className="p-3">Produce Description</th>
                    <th className="p-3 text-right">Quantity</th>
                    <th className="p-3 text-right">Agreed Rate</th>
                    <th className="p-3 text-right">Gross Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-3 font-semibold text-foreground">{selectedOrderForInvoice.crop.name}</td>
                    <td className="p-3 text-right">{selectedOrderForInvoice.crop.quantity} {selectedOrderForInvoice.crop.unit}</td>
                    <td className="p-3 text-right">₹{selectedOrderForInvoice.crop.rate.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-bold">₹{selectedOrderForInvoice.escrowAmount.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-muted/20">
                    <td colSpan="3" className="p-3 text-right text-muted-foreground">
                      APMC Market Cess & Handling (1.5%):
                    </td>
                    <td className="p-3 text-right text-rose-500 font-semibold">
                      -₹{selectedOrderForInvoice.mandiCess.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="bg-primary/5 font-bold">
                    <td colSpan="3" className="p-3 text-right text-sm text-foreground">
                      Net Farmer Payout:
                    </td>
                    <td className="p-3 text-right text-base text-primary font-black">
                      ₹{selectedOrderForInvoice.netFarmerPayout.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payout Verification & Download */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Bank Settlement Reference: {selectedOrderForInvoice.utrNumber}</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">Verified by Escrow</span>
            </div>

            <Button
              onClick={() => {
                toast.success('Mandi Tax Invoice downloaded successfully!')
                setSelectedOrderForInvoice(null)
              }}
              className="w-full rounded-2xl font-bold text-xs h-10 shadow-md bg-primary text-primary-foreground"
            >
              <Download className="w-4 h-4 mr-2" /> Download Printable Invoice PDF
            </Button>
          </div>
        </div>
      )}

      {/* 6. Logistics Vehicle Tracking Modal */}
      {selectedOrderForLogistics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            <button
              onClick={() => setSelectedOrderForLogistics(null)}
              className="absolute right-5 top-5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1 border-b border-border pb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-foreground pt-1">
                Assigned Logistics Fleet
              </h3>
              <p className="text-[11px] text-muted-foreground">
                APMC Real-Time Farm Gate Transit Tracker
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transporter:</span>
                <span className="font-bold text-foreground">{selectedOrderForLogistics.logistics.transporter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicle Plate:</span>
                <span className="font-mono font-bold text-primary">{selectedOrderForLogistics.logistics.vehicleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver Name:</span>
                <span className="font-bold text-foreground">{selectedOrderForLogistics.logistics.driverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver Contact:</span>
                <span className="font-bold text-foreground">{selectedOrderForLogistics.logistics.driverPhone}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-border/60">
                <span className="text-muted-foreground">Current Status:</span>
                <span className="font-bold text-emerald-600">{selectedOrderForLogistics.logistics.status}</span>
              </div>
            </div>

            <Button
              onClick={() => {
                toast.success(`Calling driver ${selectedOrderForLogistics.logistics.driverPhone}...`)
              }}
              className="w-full rounded-2xl font-bold text-xs h-10 shadow-md"
            >
              <Phone className="w-4 h-4 mr-2" /> Call Transporter Driver
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FarmerOrders
