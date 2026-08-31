import { useState, useEffect, useRef, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import useSocket from '@/hooks/useSocket'
import chatService from '@/services/chatService'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import {
  MessageSquare,
  Send,
  Search,
  MapPin,
  Clock,
  Sparkles,
  CheckCheck,
  Check,
  Phone,
  ShieldCheck,
  Package,
  Layers,
  ArrowLeft,
  RefreshCw,
  Loader2,
  Sprout,
  Briefcase
} from 'lucide-react'

const QUICK_FARMER_REPLIES = [
  'Yes, the produce lot is available for immediate dispatch.',
  'Quality is Grade-A standard FAQ verified.',
  'Can deliver directly to the APMC market yard.',
  'Reserve base price is firm. Please submit your bid on the portal.',
  'Harvest is freshly packed and ready for weighment.'
]

export const FarmerChats = () => {
  const { user } = useAuth()
  const { on, off, socket, isConnected } = useSocket()

  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [inputMessage, setInputMessage] = useState('')
  const [mobileViewChat, setMobileViewChat] = useState(false)

  const messagesEndRef = useRef(null)

  // 1. Fetch All Active Conversations for Farmer
  const loadConversations = async (keepSelection = true) => {
    try {
      const data = await chatService.getMyConversations()
      setConversations(data)

      if (data.length > 0) {
        if (!keepSelection || !selectedConversation) {
          setSelectedConversation(data[0])
        } else {
          // Sync selected conversation with updated metadata
          const updated = data.find((c) => c._id === selectedConversation._id)
          if (updated) setSelectedConversation(updated)
        }
      } else {
        setSelectedConversation(null)
      }
    } catch (err) {
      console.warn('[FarmerChats] Error loading conversations:', err.message)
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    loadConversations(false)
  }, [])

  // 2. Fetch Messages for Selected Conversation
  const loadMessages = async (conversationId) => {
    if (!conversationId) return
    setLoadingMessages(true)
    try {
      const res = await chatService.getConversationMessages(conversationId)
      setMessages(res?.messages || (Array.isArray(res) ? res : []))

      // Mark unread as read in UI conversation list
      setConversations((prev) =>
        prev.map((c) => (c._id === conversationId ? { ...c, unreadCount: 0 } : c))
      )
    } catch (err) {
      console.warn('[FarmerChats] Error loading messages:', err.message)
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  useEffect(() => {
    if (selectedConversation?._id) {
      loadMessages(selectedConversation._id)
    } else {
      setMessages([])
    }
  }, [selectedConversation?._id])

  // 3. Join Conversation Room & Listen to Real-Time Inbound Messages
  useEffect(() => {
    if (socket && selectedConversation?._id) {
      socket.emit('join_conversation', selectedConversation._id)
    }

    const handleNewMessage = (newMsg) => {
      const msgConvId = newMsg.conversationId || newMsg.conversation?._id || newMsg.conversation

      // If message belongs to currently open conversation
      if (selectedConversation && msgConvId === selectedConversation._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev
          return [...prev, newMsg]
        })
        // Mark as read on server
        chatService.markAsRead(selectedConversation._id)
      }

      // Update conversations list in real time
      setConversations((prev) => {
        const index = prev.findIndex((c) => c._id === msgConvId)
        if (index !== -1) {
          const updatedConv = {
            ...prev[index],
            lastMessage: newMsg.content,
            lastMessageAt: newMsg.createdAt || new Date().toISOString(),
            unreadCount:
              selectedConversation?._id === msgConvId
                ? 0
                : (prev[index].unreadCount || 0) + 1
          }
          const filtered = prev.filter((_, idx) => idx !== index)
          return [updatedConv, ...filtered]
        } else {
          // New conversation came in, reload full list
          loadConversations(true)
          return prev
        }
      })
    }

    on('newMessage', handleNewMessage)
    return () => {
      off('newMessage', handleNewMessage)
      if (socket && selectedConversation?._id) {
        socket.emit('leave_conversation', selectedConversation._id)
      }
    }
  }, [socket, selectedConversation?._id, on, off])

  // Auto-scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loadingMessages])

  // 4. Send Message Handler
  const handleSendMessage = async (textToSend) => {
    const content = (textToSend || inputMessage).trim()
    if (!content || sending || !selectedConversation) return

    setInputMessage('')
    setSending(true)

    try {
      // Find other participant (Trader)
      const otherParticipant = selectedConversation.participants?.find(
        (p) => (p.user?._id || p.user) !== user?.id
      )
      const receiverId = otherParticipant?.user?._id || otherParticipant?.user

      const savedMsg = await chatService.sendMessage({
        conversationId: selectedConversation._id,
        receiverId,
        receiverModel: 'Trader',
        content,
        listingId: selectedConversation.listingId?._id || selectedConversation.listingId || null
      })

      if (savedMsg) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === savedMsg._id)) return prev
          return [...prev, savedMsg]
        })

        // Update conversation list last message
        setConversations((prev) =>
          prev.map((c) =>
            c._id === selectedConversation._id
              ? { ...c, lastMessage: content, lastMessageAt: new Date().toISOString() }
              : c
          )
        )
      }
    } catch (err) {
      toast.error('Failed to send message. Please try again.')
      setInputMessage(content)
    } finally {
      setSending(false)
    }
  }

  // Filter conversations by search query
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const otherParticipant = conv.participants?.find(
        (p) => (p.user?._id || p.user) !== user?.id
      )
      const traderName = otherParticipant?.user?.name || otherParticipant?.user?.companyName || ''
      const cropName = conv.listingId?.name || ''
      const q = searchQuery.toLowerCase()

      return traderName.toLowerCase().includes(q) || cropName.toLowerCase().includes(q)
    })
  }, [conversations, searchQuery, user?.id])

  // Helper to extract other participant information
  const getOtherParty = (conv) => {
    if (!conv) return { name: 'Trader Partner', company: '', district: 'Karnataka', mobile: '' }
    const p = conv.participants?.find((part) => (part.user?._id || part.user) !== user?.id)
    const u = p?.user || {}
    return {
      name: u.name || u.companyName || 'Trader Partner',
      company: u.companyName || '',
      district: u.district || 'Karnataka',
      mobile: u.mobile || ''
    }
  }

  const otherTrader = getOtherParty(selectedConversation)
  const activeCrop = selectedConversation?.listingId

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Direct Marketplace Negotiations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Trader Chat Room 💬
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time direct communication with licensed APMC traders regarding your active crop harvest lots.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
            isConnected ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            {isConnected ? 'Live WebSocket Active' : 'Connecting Stream...'}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadConversations(true)}
            className="rounded-xl text-xs font-semibold h-9 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Main Two-Panel Chat Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-card border border-border rounded-3xl shadow-sm overflow-hidden min-h-[640px]">
        
        {/* LEFT PANEL: Conversation Thread List */}
        <div className={`lg:col-span-4 border-r border-border flex flex-col ${
          mobileViewChat ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Search Header */}
          <div className="p-4 border-b border-border/80 space-y-3 bg-muted/20">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search trader or crop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground px-1">
              <span>CONVERSATION THREADS ({filteredConversations.length})</span>
              <span>LATEST FIRST</span>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {loadingList ? (
              <div className="p-10 text-center space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground font-medium">Loading conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-foreground">No chats yet</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Chats with traders regarding your crop listings will automatically appear here when initiated.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const party = getOtherParty(conv)
                const isSelected = selectedConversation?._id === conv._id
                const crop = conv.listingId

                return (
                  <div
                    key={conv._id}
                    onClick={() => {
                      setSelectedConversation(conv)
                      setMobileViewChat(true)
                    }}
                    className={`p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                      isSelected ? 'bg-primary/10 border-l-4 border-primary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-foreground truncate">
                            {party.name}
                          </h4>
                          {party.company && (
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded truncate">
                              {party.company}
                            </span>
                          )}
                        </div>

                        {/* Associated Crop Context Tag */}
                        {crop && (
                          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md mt-1 truncate max-w-full border border-emerald-500/20">
                            <span>🌾</span>
                            <span className="truncate">{crop.name}</span>
                            {crop.quantity && (
                              <span className="text-[10px] text-muted-foreground font-normal">
                                ({crop.quantity} {crop.unit || 'Qtl'})
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground truncate mt-1.5 font-normal">
                          {conv.lastMessage || 'No messages yet'}
                        </p>
                      </div>

                      {/* Right Meta (Time & Unread Badge) */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {conv.lastMessageAt || conv.updatedAt
                            ? new Date(conv.lastMessageAt || conv.updatedAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : ''}
                        </span>

                        {conv.unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm animate-pulse">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Active Chat Conversation */}
        <div className={`lg:col-span-8 flex flex-col justify-between ${
          mobileViewChat ? 'flex' : 'hidden lg:flex'
        }`}>
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b border-border/80 bg-muted/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileViewChat(false)}
                    className="lg:hidden p-1.5 h-8 w-8 text-muted-foreground"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>

                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0 border border-amber-500/20">
                    <Briefcase className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-foreground truncate">
                        {otherTrader.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" /> APMC Verified Buyer
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary" /> {otherTrader.district}, Karnataka
                      </span>
                      {otherTrader.mobile && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-muted-foreground" /> {otherTrader.mobile}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* STICKY CROP CONTEXT BANNER */}
              {activeCrop && (
                <div className="p-3.5 bg-emerald-500/10 border-b border-emerald-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                      🌾
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-foreground text-sm">
                          {activeCrop.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-500/20 px-2 py-0.5 rounded">
                          {activeCrop.status || 'Active'}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Quantity: <strong className="text-foreground">{activeCrop.quantity} {activeCrop.unit || 'Quintals'}</strong> • APMC: <strong className="text-foreground">{activeCrop.district || 'Karnataka'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Reserve Base Rate</span>
                    <span className="text-sm font-black text-emerald-700 font-mono">
                      ₹{activeCrop.basePrice?.toLocaleString('en-IN')}/{activeCrop.unit || 'Qtl'}
                    </span>
                  </div>
                </div>
              )}

              {/* Message History Feed */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[420px] bg-background/50">
                {loadingMessages ? (
                  <div className="py-20 text-center space-y-3">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                    <p className="text-xs text-muted-foreground font-medium">Loading message history...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium max-w-sm mx-auto">
                      No previous messages. Start negotiating with {otherTrader.name} below.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isSenderFarmer = 
                      (msg.sender?._id || msg.sender) === user?.id || 
                      msg.senderModel === 'Farmer'

                    const timeFormatted = msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Just now'

                    return (
                      <div
                        key={msg._id || idx}
                        className={`flex flex-col ${isSenderFarmer ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1 px-1">
                          <span className="font-bold">
                            {isSenderFarmer ? 'You (Farmer)' : otherTrader.name}
                          </span>
                          <span>•</span>
                          <span>{timeFormatted}</span>
                        </div>

                        <div
                          className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm font-medium ${
                            isSenderFarmer
                              ? 'bg-primary text-primary-foreground rounded-tr-none'
                              : 'bg-muted text-foreground border border-border rounded-tl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>

                          <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                            isSenderFarmer ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {isSenderFarmer && (
                              msg.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Negotiation Prompt Chips */}
              <div className="px-4 py-2 bg-muted/20 border-t border-border/80 overflow-x-auto flex items-center gap-2 no-scrollbar">
                <span className="text-[10px] font-bold text-muted-foreground shrink-0 uppercase">Quick Replies:</span>
                {QUICK_FARMER_REPLIES.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(reply)}
                    disabled={sending}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-xl bg-background border border-border hover:border-primary/50 text-foreground shrink-0 transition-all hover:bg-primary/5"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="p-4 border-t border-border bg-card flex items-center gap-2.5"
              >
                <input
                  type="text"
                  placeholder="Type a message or price counter-offer to buyer..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={sending}
                  className="flex-1 h-11 px-4 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                />

                <Button
                  type="submit"
                  disabled={!inputMessage.trim() || sending}
                  className="h-11 px-5 rounded-xl font-bold text-xs bg-primary text-primary-foreground shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-foreground">Select a Negotiation Thread</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Select a trader conversation from the left panel to review previous discussions, trade terms, and negotiate prices in real time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FarmerChats
