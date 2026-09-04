import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import notificationService from '@/services/notificationService'
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
  Layers,
  Trash2
} from 'lucide-react'

export const TraderNotifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const data = await notificationService.getTraderNotifications()
      setNotifications(data || [])
    } catch (err) {
      console.error('[TraderNotifications] Load error:', err)
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
    toast.success('Procurement alerts and auction telemetry synchronized! ⚡')
  }

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id, 'trader')
      setNotifications((prev) => (Array.isArray(prev) ? prev.map((n) => n._id === id ? { ...n, isRead: true } : n) : []))
    } catch (err) {
      console.warn('Failed to mark notification as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead('trader')
      setNotifications((prev) => (Array.isArray(prev) ? prev.map((n) => ({ ...n, isRead: true })) : []))
      toast.success('All notifications marked as read! 🔔')
    } catch (err) {
      console.warn('Failed to mark all as read:', err)
    }
  }

  const handleDeleteNotif = async (id) => {
    try {
      await notificationService.deleteNotification(id, 'trader')
      setNotifications((prev) => (Array.isArray(prev) ? prev.filter((n) => n._id !== id) : []))
      toast.success('Notification removed.')
    } catch (err) {
      console.warn('Failed to delete notification:', err)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead && n.read !== true).length

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const isUnread = !n.isRead && n.read !== true
      if (selectedFilter === 'unread') return isUnread
      if (selectedFilter === 'bids') return n.category === 'bids' || n.category === 'bidding'
      if (selectedFilter === 'logistics') return n.category === 'logistics'
      if (selectedFilter === 'escrow') return n.category === 'escrow'
      return true
    })
  }, [notifications, selectedFilter])

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'bids':
      case 'bidding':
        return <Gavel className="w-5 h-5 text-amber-600" />
      case 'logistics':
        return <Truck className="w-5 h-5 text-sky-600" />
      case 'escrow':
        return <DollarSign className="w-5 h-5 text-emerald-600" />
      default:
        return <TrendingUp className="w-5 h-5 text-primary" />
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-semibold border border-amber-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real-Time Wholesale Procurement Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Procurement Alerts & Market Feed 🔔
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Outbid alerts, weighbridge net tare certifications, bank escrow settlements, and spot price movements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-xl text-xs font-semibold shadow-sm h-10 px-4"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Alerts
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="rounded-xl text-xs font-semibold shadow-sm h-10 px-4 flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4 text-amber-600" />
              <span>Mark All Read ({unreadCount})</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: `All Alerts (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'bids', label: 'Bids & Outbid 🔨' },
          { id: 'logistics', label: 'Weighbridge & Logistics 🚚' },
          { id: 'escrow', label: 'Escrow & Invoices 🏛️' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedFilter === tab.id
                ? 'bg-amber-600 text-white shadow-md'
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
          const isUnread = !notif.isRead && notif.read !== true

          return (
            <div
              key={notif._id}
              className={`p-5 sm:p-6 rounded-3xl border transition-all flex flex-col sm:flex-row items-start justify-between gap-4 ${
                isUnread
                  ? 'bg-amber-500/5 border-amber-500/30 shadow-sm'
                  : 'bg-card border-border'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                  {getCategoryIcon(notif.category)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-foreground">
                      {notif.title}
                    </h3>
                    {isUnread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {notif.message || notif.description}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" /> {notif.timestamp}
                    </span>
                    <span>•</span>
                    <span className="capitalize font-semibold text-foreground">
                      {notif.category || 'Procurement Alert'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Button asChild size="sm" className="rounded-xl text-xs font-bold h-9 px-4 bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
                  <Link to={notif.actionLink || notif.actionUrl || '/trader/orders'}>
                    Open <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>

                {isUnread && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMarkAsRead(notif._id)}
                    title="Mark as read"
                    className="rounded-xl text-xs h-9 px-2.5 text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 flex items-center gap-1"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span className="hidden md:inline text-[11px]">Read</span>
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteNotif(notif._id)}
                  title="Delete notification"
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
            <p className="text-xs text-muted-foreground">All your procurement notifications and bidding alerts are up to date.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TraderNotifications
