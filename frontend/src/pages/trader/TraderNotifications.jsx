import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  Bell, 
  Gavel, 
  DollarSign, 
  Truck, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Scale, 
  MessageSquare, 
  Sparkles, 
  ChevronRight, 
  RefreshCw, 
  CheckCheck,
  Send,
  PhoneCall,
  X,
  Layers
} from 'lucide-react'

const INITIAL_TRADER_NOTIFICATIONS = [
  {
    _id: 'NOTIF-TRD-01',
    category: 'bidding', // 'bidding' | 'escrow' | 'logistics' | 'mandi'
    title: 'Outbid Alert: Bellary Red Onion Lot #LOT-KA-MND-102',
    description: 'Bengaluru Produce Alliance placed a higher bid of ₹2,650/Qtl (+₹150 over your offer). Auction closing in 3h 15m.',
    timestamp: '2 mins ago',
    read: false,
    urgent: true,
    lotId: 'LOT-KA-MND-102',
    actionText: 'Raise Bid Now ➔',
    actionUrl: '/trader/my-bids'
  },
  {
    _id: 'NOTIF-TRD-02',
    category: 'logistics',
    title: 'Transporter Arrived at Mandya APMC Weighbridge #3',
    description: 'Vehicle KA-09-E-4421 carrying 250 Qtl Onion has docked at the weighbridge. Digital tare/gross audit slip is ready for review.',
    timestamp: '15 mins ago',
    read: false,
    urgent: false,
    lotId: 'ORD-KA-TRD-4410',
    actionText: 'Audit Weighment Slip ➔',
    actionUrl: '/trader/orders'
  },
  {
    _id: 'NOTIF-TRD-03',
    category: 'escrow',
    title: 'Escrow Payout Disbursed to Producer Ramesh Gowda',
    description: '₹1,85,180 successfully transferred via HDFC RTGS (UTR: HDFCR52026082800441) upon verified tomato delivery.',
    timestamp: '1 hour ago',
    read: false,
    urgent: false,
    lotId: 'ORD-KA-TRD-9912',
    actionText: 'View Bank UTR ➔',
    actionUrl: '/trader/escrow'
  },
  {
    _id: 'NOTIF-TRD-04',
    category: 'mandi',
    title: 'APMC Market Alert: Tomato Prices Surged +14.2%',
    description: 'Hassan and Kolar APMC modal rates increased from ₹2,100 to ₹2,380/Qtl due to high monsoon wholesale demand in Bengaluru.',
    timestamp: '2 hours ago',
    read: true,
    urgent: false,
    lotId: null,
    actionText: 'View Live Mandi Rates ➔',
    actionUrl: '/mandi-prices'
  },
  {
    _id: 'NOTIF-TRD-05',
    category: 'bidding',
    title: 'Farmer Counter-Offer Received for Ragi Lot #LOT-KA-KLR-104',
    description: 'Producer Venkatesh Murthy proposed a direct buyout rate of ₹3,500/Qtl for 150 Qtl Grade-A Organic Finger Millet.',
    timestamp: '4 hours ago',
    read: true,
    urgent: false,
    lotId: 'LOT-KA-KLR-104',
    actionText: 'Review Counter-Offer ➔',
    actionUrl: '/trader/my-bids'
  },
  {
    _id: 'NOTIF-TRD-06',
    category: 'escrow',
    title: 'Electronic Mandi Tax Invoice Generated: INV-KA-2026-9912',
    description: 'Statutory APMC Bill of Supply (₹2,72,480) with 1.5% cess breakdown is ready for accounting download.',
    timestamp: '6 hours ago',
    read: true,
    urgent: false,
    lotId: 'INV-KA-2026-9912',
    actionText: 'Download Invoice ➔',
    actionUrl: '/trader/invoices'
  }
]

const CATEGORY_TABS = [
  { id: 'all', label: 'All Alerts' },
  { id: 'bidding', label: 'Outbid & Bids 🔴' },
  { id: 'escrow', label: 'Escrow & Banking 🟡' },
  { id: 'logistics', label: 'Fleet & Weighment 🚛' },
  { id: 'mandi', label: 'Mandi Rate Surges 📈' }
]

export const TraderNotifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState(INITIAL_TRADER_NOTIFICATIONS)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Live notification feed synchronized with APMC event gateway!')
    }, 600)
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast.success('All notifications marked as read!')
  }

  const handleToggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: !n.read } : n))
    )
  }

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (selectedCategory === 'all') return true
      return n.category === selectedCategory
    })
  }, [notifications, selectedCategory])

  // Counts
  const unreadCount = notifications.filter((n) => !n.read).length
  const urgentCount = notifications.filter((n) => n.urgent && !n.read).length

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-semibold border border-amber-500/20 mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Real-Time APMC Event Telemetry Stream</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Trader Notifications & Market Alerts 🔔
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time auction outbid alerts, weighbridge docking updates, and instant banking escrow settlement confirmations.
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
            Refresh Alerts
          </Button>

          <Button 
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="rounded-xl text-xs h-10 px-4 font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md"
          >
            <CheckCheck className="w-4 h-4 mr-1.5" /> Mark All as Read
          </Button>
        </div>
      </div>

      {/* 2. 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Unread Alerts</span>
          <p className="text-2xl font-black text-foreground">{unreadCount} Pending</p>
          <span className="text-[11px] text-muted-foreground">Live Telemetry Active</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Outbid Urgency</span>
          <p className="text-2xl font-black text-rose-600">{urgentCount} Lot{urgentCount !== 1 ? 's' : ''}</p>
          <span className="text-[11px] text-rose-500 font-bold">Action Required</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Escrow Settlements</span>
          <p className="text-2xl font-black text-emerald-600">₹8.55L Today</p>
          <span className="text-[11px] text-emerald-600 font-bold">100% On-Time UTRs</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground">Mandi Rate Shifts</span>
          <p className="text-2xl font-black text-sky-600">+14.2%</p>
          <span className="text-[11px] text-muted-foreground">Tomato Modal Surge</span>
        </div>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {CATEGORY_TABS.map((tab) => {
          const count =
            tab.id === 'all'
              ? notifications.length
              : notifications.filter((n) => n.category === tab.id).length

          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedCategory === tab.id
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                selectedCategory === tab.id ? 'bg-black/20 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* 4. Notifications Feed Stream */}
      <div className="space-y-4">
        {filteredNotifications.map((notif) => (
          <div
            key={notif._id}
            className={`p-5 sm:p-6 rounded-3xl bg-card border transition-all space-y-3 shadow-sm ${
              !notif.read
                ? notif.urgent
                  ? 'border-rose-500/50 bg-rose-500/[0.03]'
                  : 'border-amber-500/40 bg-amber-500/[0.02]'
                : 'border-border opacity-85 hover:opacity-100'
            }`}
          >
            {/* Top Bar: Icon, Category & Timestamp */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  notif.category === 'bidding'
                    ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                    : notif.category === 'logistics'
                    ? 'bg-sky-500/10 text-sky-600 border border-sky-500/20'
                    : notif.category === 'escrow'
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                }`}>
                  {notif.category === 'bidding' && <Gavel className="w-5 h-5" />}
                  {notif.category === 'logistics' && <Truck className="w-5 h-5" />}
                  {notif.category === 'escrow' && <DollarSign className="w-5 h-5" />}
                  {notif.category === 'mandi' && <TrendingUp className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-foreground">
                      {notif.title}
                    </h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {notif.timestamp}
                  </span>
                </div>
              </div>

              {/* Read / Unread Toggle */}
              <button
                onClick={() => handleToggleRead(notif._id)}
                className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                {notif.read ? 'Mark as Unread' : 'Mark as Read'}
              </button>
            </div>

            {/* Description Body */}
            <p className="text-xs text-muted-foreground leading-relaxed pl-13">
              {notif.description}
            </p>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-border/60 pl-13">
              {notif.lotId ? (
                <span className="font-mono text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-md">
                  Ref: {notif.lotId}
                </span>
              ) : <div />}

              <Button asChild size="sm" className="rounded-xl text-xs font-bold h-8 px-3 bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
                <Link to={notif.actionUrl}>
                  {notif.actionText}
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Corporate DLT-Registered Transactional SMS Terminal */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-950 text-slate-100 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-extrabold text-slate-100">
              DLT-Registered Corporate SMS & Telegram Dispatch Terminal
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
            DLT Header: VM-KRISHI
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
          <div className="flex justify-between text-[10px] text-slate-500 border-b border-slate-800 pb-1">
            <span>TO: +91 98860 55432 (Suresh Hegde - KA Agro Traders)</span>
            <span>GATEWAY: AIRTEL DLT ENT-99214</span>
          </div>
          <p className="text-amber-300 leading-relaxed">
            [KRISHI-SETU ALERT] Urgent: Your bid of ₹2,500/Qtl on Bellary Red Onion Lot #LOT-KA-MND-102 was outbid by ₹2,650/Qtl. Counter now at: https://krishisetu.com/t/b/102 - Dept of Agri Mktg, Govt of Karnataka.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TraderNotifications
