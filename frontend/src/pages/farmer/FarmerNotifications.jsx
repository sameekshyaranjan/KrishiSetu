import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import SMSNotificationPreview from '@/components/common/SMSNotificationPreview'
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Gavel, 
  DollarSign, 
  Truck, 
  CloudRain, 
  Award, 
  Radio, 
  ChevronRight, 
  Clock, 
  Smartphone, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  X,
  Languages
} from 'lucide-react'

const INITIAL_NOTIFICATIONS = [
  {
    _id: 'notif-1',
    type: 'payment',
    title: 'Bank Payout Disbursed — ₹1,85,180 Credited',
    message: 'Buyer escrow funds for Tomato Lot #ORD-KA-9912 have been transferred to your HDFC Bank account (UTR: HDFCR52026082500918).',
    category: 'payment',
    timestamp: '15 mins ago',
    unread: true,
    actionUrl: '/farmer/orders',
    actionLabel: 'View Tax Receipt',
    smsText: 'VM-KSETU: KrishiSetu Escrow: Rs 1,85,180 credited to HDFC A/C ••••4492 via UTR HDFCR52026082500918 for Lot #ORD-9912.',
    smsTextKn: 'VM-KSETU: ಕೃಷಿಸೇತು: ನಿಮ್ಮ ಟೊಮೇಟೊ ಲಾಟ್ #ORD-9912 ಗೆ ರೂ. 1,85,180 ನಿಮ್ಮ HDFC ಖಾತೆಗೆ (UTR: HDFCR52026082500918) ಜಮಾ ಆಗಿದೆ.'
  },
  {
    _id: 'notif-2',
    type: 'bid',
    title: 'New Inbound Bid Received — ₹2,600 / Quintal',
    message: 'Bengaluru Fresh Produce Wholesalers placed an offer of ₹2,600/Qtl on your Red Onion Lot (+₹350/Qtl above reserve price).',
    category: 'bids',
    timestamp: '1 hour ago',
    unread: true,
    actionUrl: '/farmer/bids',
    actionLabel: 'Review Offer',
    smsText: 'VK-KSETU: New Bid! Bengaluru Wholesalers offered Rs 2,600/Qtl on your Red Onion Lot. Review: krishisetu.in/b',
    smsTextKn: 'VK-KSETU: ಹೊಸ ಬಿಡ್! ಬೆಂಗಳೂರು ವ್ಯಾಪಾರಿಗಳು ನಿಮ್ಮ ಈರುಳ್ಳಿ ಬೆಳೆಗೆ ರೂ. 2,600/ಕ್ವಿಂಟಾಲ್ ಆಫರ್ ಮಾಡಿದ್ದಾರೆ.'
  },
  {
    _id: 'notif-3',
    type: 'logistics',
    title: 'Logistics Partner Assigned — KA-04-E-8819',
    message: 'Vehicle 14ft Eicher Truck dispatched by APMC Mandi Logistics is en route for Hassan farm-gate pickup (ETA: 04:30 PM).',
    category: 'logistics',
    timestamp: '3 hours ago',
    unread: false,
    actionUrl: '/farmer/orders',
    actionLabel: 'Track Truck Live',
    smsText: 'VK-KSETU: Mandi Logistics: Vehicle KA-04-E-8819 en route for Hassan farm pickup (ETA 4:30 PM). Driver: +919845112233',
    smsTextKn: 'VK-KSETU: ಮಾರುಕಟ್ಟೆ ಸಾರಿಗೆ: ವಾಹನ KA-04-E-8819 ಹಾಸನ ಫಾರ್ಮ್ ಪಿಕಪ್‌ಗೆ ಹೊರಟಿದೆ (ಸಮಯ: 4:30 PM).'
  },
  {
    _id: 'notif-4',
    type: 'weather',
    title: 'IMD Rain Warning — Protect Harvested Produce',
    message: 'Heavy localized thunderstorms forecast for Hassan & Channarayapatna taluks over next 24 hours. Cover outdoor drying sheds.',
    category: 'weather',
    timestamp: '5 hours ago',
    unread: false,
    actionUrl: '/farmer/weather',
    actionLabel: 'Check Advisory',
    smsText: 'VK-KSETU: IMD Weather Alert: Heavy thunderstorm expected in Hassan next 24h. Secure outdoor harvest. krishisetu.in/w',
    smsTextKn: 'VK-KSETU: ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ: ಮುಂದಿನ 24 ಗಂಟೆಗಳಲ್ಲಿ ಹಾಸನದಲ್ಲಿ ಭಾರಿ ಮಳೆ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ. ಬೆಳೆಗಳನ್ನು ರಕ್ಷಿಸಿ.'
  },
  {
    _id: 'notif-5',
    type: 'scheme',
    title: 'Raitha Siri Direct Subsidy — ₹10,000 / Hectare Approved',
    message: 'Your millet cultivation application under Karnataka Raitha Siri Scheme 2026 has been approved. DBT transfer initiated.',
    category: 'schemes',
    timestamp: '1 day ago',
    unread: false,
    actionUrl: '/schemes',
    actionLabel: 'View Scheme Details',
    smsText: 'VM-KSETU: Govt of Karnataka: Raitha Siri millet subsidy Rs 10,000 sanctioned for Bhoomi RTC-88192 via DBT.',
    smsTextKn: 'VM-KSETU: ಕರ್ನಾಟಕ ಸರ್ಕಾರ: ರೈತ ಸಿರಿ ಯೋಜನೆಯಡಿ ರೂ 10,000 ಸಿರಿಧಾನ್ಯ ಪ್ರೋತ್ಸಾಹಧನ ಮಂಜೂರಾಗಿದೆ.'
  }
]

export const FarmerNotifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'unread' | 'bids' | 'payment' | 'logistics' | 'weather'
  const [selectedSmsLanguage, setSelectedSmsLanguage] = useState('kn') // 'kn' | 'en'
  const [showSmsModal, setShowSmsModal] = useState(false)

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
    toast.success('All notifications marked as read!')
  }

  const clearAll = () => {
    setNotifications([])
    toast.success('Notification feed cleared.')
  }

  const toggleReadStatus = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, unread: !n.unread } : n))
    )
  }

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id))
    toast.success('Notification removed.')
  }

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeFilter === 'unread') return n.unread
      if (activeFilter === 'bids') return n.category === 'bids'
      if (activeFilter === 'payment') return n.category === 'payment'
      if (activeFilter === 'logistics') return n.category === 'logistics'
      if (activeFilter === 'weather') return n.category === 'weather'
      return true
    })
  }, [notifications, activeFilter])

  const unreadCount = notifications.filter((n) => n.unread).length

  const renderIcon = (type) => {
    switch (type) {
      case 'payment':
        return <DollarSign className="w-5 h-5 text-emerald-600" />
      case 'bid':
        return <Gavel className="w-5 h-5 text-primary" />
      case 'logistics':
        return <Truck className="w-5 h-5 text-sky-600" />
      case 'weather':
        return <CloudRain className="w-5 h-5 text-amber-500" />
      default:
        return <Award className="w-5 h-5 text-purple-600" />
    }
  }

  return (
    <div className="space-y-8">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-primary" />
            <span>Real-Time Socket Event Stream</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Notifications & SMS Activity Feed
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time updates on trader bids, escrow bank disbursements, logistics trucks, and IMD weather alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            onClick={() => setShowSmsModal(true)}
            className="rounded-xl text-xs h-10 px-3.5 font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md flex items-center gap-1.5"
          >
            <Smartphone className="w-4 h-4" />
            <span>CDAC SMS Simulator 📱</span>
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={markAllRead} 
            disabled={unreadCount === 0}
            className="rounded-xl text-xs h-10 shadow-sm font-semibold"
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1.5 text-primary" /> Mark All Read
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAll} 
            disabled={notifications.length === 0}
            className="rounded-xl text-xs h-10 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear All
          </Button>
        </div>
      </div>

      {/* 2. Notification Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground">Unread Alerts</span>
          <p className="text-2xl font-black text-primary">{unreadCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Live socket sync</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground">Escrow Payouts</span>
          <p className="text-2xl font-black text-emerald-600">₹1.85L</p>
          <span className="text-[10px] text-muted-foreground">Settled to bank</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground">Inbound Bids</span>
          <p className="text-2xl font-black text-foreground">1 Active</p>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting action</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground">Transit Vehicles</span>
          <p className="text-2xl font-black text-sky-600">1 En Route</p>
          <span className="text-[10px] text-muted-foreground">Farm pickup</span>
        </div>
      </div>

      {/* 3. Filter Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeFilter === 'all'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          All Activity ({notifications.length})
        </button>

        <button
          onClick={() => setActiveFilter('unread')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeFilter === 'unread'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveFilter('payment')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeFilter === 'payment'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          Escrow Payments (₹)
        </button>

        <button
          onClick={() => setActiveFilter('bids')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeFilter === 'bids'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          Trader Bids 🔨
        </button>

        <button
          onClick={() => setActiveFilter('logistics')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeFilter === 'logistics'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          Logistics 🚛
        </button>

        <button
          onClick={() => setActiveFilter('weather')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeFilter === 'weather'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          IMD Weather 🌧️
        </button>
      </div>

      {/* 4. Notifications Feed List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center bg-card border border-border rounded-3xl space-y-3">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
            <h3 className="text-base font-extrabold text-foreground">No notifications in this view</h3>
            <p className="text-xs text-muted-foreground">
              You are all caught up! Real-time alerts will appear here as trade events occur.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                notif.unread
                  ? 'bg-primary/5 border-primary/30 shadow-sm'
                  : 'bg-card border-border opacity-85 hover:opacity-100'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-card border border-border shadow-sm shrink-0 mt-0.5">
                  {renderIcon(notif.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-sm text-foreground">
                      {notif.title}
                    </h3>
                    {notif.unread && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 text-[10px] font-bold border border-rose-500/20">
                        NEW
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {notif.timestamp}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-primary font-bold uppercase tracking-wider text-[10px]">
                      {notif.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {notif.actionUrl && (
                  <Button asChild size="sm" className="rounded-xl text-xs h-9 px-4 font-bold">
                    <Link to={notif.actionUrl}>
                      {notif.actionLabel}
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleReadStatus(notif._id)}
                  className="rounded-xl text-xs h-9 text-muted-foreground hover:text-foreground"
                  title={notif.unread ? 'Mark as Read' : 'Mark as Unread'}
                >
                  <CheckCheck className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteNotification(notif._id)}
                  className="rounded-xl text-xs h-9 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10"
                  title="Delete Alert"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. SMS Gateway Simulation Modal */}
      <SMSNotificationPreview
        isOpen={showSmsModal}
        onClose={() => setShowSmsModal(false)}
      />
    </div>
  )
}

export default FarmerNotifications
