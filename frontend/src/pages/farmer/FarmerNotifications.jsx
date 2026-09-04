import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import notificationService from '@/services/notificationService'
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
  Languages,
  RefreshCw
} from 'lucide-react'

export const FarmerNotifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'unread' | 'bids' | 'payment' | 'logistics' | 'weather'
  const [selectedSmsLanguage, setSelectedSmsLanguage] = useState('kn') // 'kn' | 'en'
  const [showSmsModal, setShowSmsModal] = useState(false)
  const [selectedNotifForSms, setSelectedNotifForSms] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const data = await notificationService.getFarmerNotifications()
      setNotifications(data || [])
    } catch (err) {
      console.error('[FarmerNotifications] Load error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadNotifications()
    setIsRefreshing(false)
    toast.success('Live notification feeds and SMS push alerts updated! ⚡')
  }

  const handleMarkAsRead = async (id) => {
    const updated = await notificationService.markAsRead(id, 'farmer')
    setNotifications(updated)
  }

  const handleMarkAllAsRead = async () => {
    const updated = await notificationService.markAllAsRead('farmer')
    setNotifications(updated)
    toast.success('All notifications marked as read! 🔔')
  }

  const handleDeleteNotif = async (id) => {
    const updated = await notificationService.deleteNotification(id, 'farmer')
    setNotifications(updated)
    toast.success('Notification removed.')
  }

  const handlePreviewSMS = (notif) => {
    setSelectedNotifForSms(notif)
    setShowSmsModal(true)
  }

  const unreadCount = notifications.filter((n) => !n.isRead && n.unread !== false).length

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const isUnread = !n.isRead && n.unread !== false
      if (activeFilter === 'unread') return isUnread
      if (activeFilter === 'bids') return n.category === 'bids' || n.type === 'bid'
      if (activeFilter === 'payment') return n.category === 'escrow' || n.category === 'payment' || n.type === 'payment'
      if (activeFilter === 'logistics') return n.category === 'logistics' || n.type === 'logistics'
      if (activeFilter === 'weather') return n.category === 'weather' || n.type === 'weather'
      return true
    })
  }, [notifications, activeFilter])

  const getCategoryIcon = (category, type) => {
    const cat = category || type
    switch (cat) {
      case 'bids':
      case 'bid':
        return <Gavel className="w-5 h-5 text-amber-500" />
      case 'escrow':
      case 'payment':
        return <DollarSign className="w-5 h-5 text-emerald-500" />
      case 'logistics':
        return <Truck className="w-5 h-5 text-primary" />
      case 'weather':
        return <CloudRain className="w-5 h-5 text-sky-500" />
      default:
        return <Award className="w-5 h-5 text-purple-500" />
    }
  }

  return (
    <div className="space-y-8">
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Dual-Channel Push Telemetry (Web & SMS Gateway)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Alerts & Push Notifications
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time auction bid alerts, DBT bank payout credits, APMC gate dispatch passes, and localized weather advisories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-xl text-xs h-10 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="rounded-xl text-xs h-10 shadow-sm flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4 text-primary" />
              <span>Mark All Read ({unreadCount})</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: `All Alerts (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'bids', label: 'Bids & Offers 🔨' },
          { id: 'payment', label: 'Bank Payouts 💸' },
          { id: 'logistics', label: 'Logistics 🚚' },
          { id: 'weather', label: 'Weather 🌧️' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Notifications Feed */}
      <div className="space-y-4">
        {filteredNotifications.map((notif) => {
          const isUnread = !notif.isRead && notif.unread !== false

          return (
            <div
              key={notif._id}
              className={`p-5 sm:p-6 rounded-3xl border transition-all flex flex-col sm:flex-row items-start justify-between gap-4 ${
                isUnread
                  ? 'bg-primary/5 border-primary/30 shadow-sm'
                  : 'bg-card border-border'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                  {getCategoryIcon(notif.category, notif.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-foreground">
                      {notif.title}
                    </h3>
                    {isUnread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" /> {notif.timestamp}
                    </span>
                    <span>•</span>
                    <span className="capitalize font-semibold text-foreground">
                      {notif.category || notif.type || 'Alert'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Links & Controls */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {notif.actionLink || notif.actionUrl ? (
                  <Button asChild size="sm" className="rounded-xl text-xs font-bold h-9 px-4 bg-primary text-primary-foreground shadow-sm">
                    <Link 
                      to={notif.actionLink || notif.actionUrl}
                      onClick={() => handleMarkAsRead(notif._id)}
                    >
                      Open Details <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                ) : null}

                {isUnread && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMarkAsRead(notif._id)}
                    title="Mark as Read"
                    className="rounded-xl text-xs h-9 px-2 text-muted-foreground hover:text-primary hover:bg-primary/10"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteNotif(notif._id)}
                  title="Delete Notification"
                  className="rounded-xl text-xs h-9 px-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )
        })}

        {filteredNotifications.length === 0 && !loading && (
          <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto stroke-1" />
            <p className="text-base font-bold text-foreground">No notifications in this filter</p>
            <p className="text-xs text-muted-foreground">You are all caught up! New inbound bids and bank payouts will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FarmerNotifications
