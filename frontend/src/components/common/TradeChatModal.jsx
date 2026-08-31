import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import useSocket from '@/hooks/useSocket'
import chatService from '@/services/chatService'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  X, 
  ShieldCheck, 
  CheckCheck, 
  Clock, 
  Languages, 
  Gavel, 
  Loader2,
  MapPin,
  RefreshCw
} from 'lucide-react'

const QUICK_PROMPTS = [
  {
    en: 'Is the lot available for immediate dispatch?',
    kn: 'ಲಾಟ್ ತಕ್ಷಣದ ರವಾನೆಗೆ ಲಭ್ಯವಿದೆಯೇ?'
  },
  {
    en: 'Packaging confirmed in 25kg standard plastic crates.',
    kn: '25 ಕೆಜಿ ಪ್ರಮಾಣಿತ ಪ್ಲಾಸ್ಟಿಕ್ ಕ್ರೇಟ್‌ಗಳಲ್ಲಿ ಪ್ಯಾಕಿಂಗ್ ದೃಢಪಟ್ಟಿದೆ.'
  },
  {
    en: 'Truck dispatch scheduled for 06:00 AM tomorrow.',
    kn: 'ನಾಳೆ ಬೆಳಿಗ್ಗೆ 06:00 ಗಂಟೆಗೆ ವಾಹನ ರವಾನೆ ನಿಗದಿಯಾಗಿದೆ.'
  },
  {
    en: 'Please share the latest APMC Weighbridge Slip.',
    kn: 'ದಯವಿಟ್ಟು ಇತ್ತೀಚಿನ ಎಪಿಎಂಸಿ ತೂಕದ ರಸೀದಿಯನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.'
  }
]

export const TradeChatModal = ({ 
  isOpen, 
  onClose, 
  recipientId,
  recipientName = 'Trade Partner',
  recipientRole = 'Trader',
  crop = {
    _id: '',
    title: 'Grade-A Produce Lot',
    quantity: 100,
    unit: 'Quintals',
    price: 2000,
    lotId: 'LOT-KA'
  }
}) => {
  const { user } = useAuth()
  const { on, off } = useSocket()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [inputMessage, setInputMessage] = useState('')
  const [showKannadaTranslation, setShowKannadaTranslation] = useState(true)
  const [counterRate, setCounterRate] = useState(String(crop.price || crop.basePrice || 2000))
  const [showCounterBox, setShowCounterBox] = useState(false)
  const messagesEndRef = useRef(null)

  // 1. Fetch Real Conversation & Message History from MongoDB
  const loadChatHistory = async () => {
    if (!recipientId) return
    setLoading(true)
    try {
      const cropListingId = crop?._id || crop?.lotId || null
      const data = await chatService.getConversationWithUser(recipientId, cropListingId)
      if (data?.conversation) {
        setConversationId(data.conversation._id)
      }
      setMessages(data?.messages || [])
    } catch (err) {
      console.warn('[TradeChatModal] Error loading messages:', err.message)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && recipientId) {
      loadChatHistory()
    }
  }, [isOpen, recipientId])

  // 2. Real-Time Socket.io Listener for Inbound Messages
  useEffect(() => {
    if (!isOpen) return

    const handleNewMessage = (newMsg) => {
      // Check if message belongs to this conversation or recipient
      const isCurrentChat = 
        newMsg.conversationId === conversationId || 
        newMsg.sender === recipientId || 
        newMsg.sender?._id === recipientId

      if (isCurrentChat) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m._id === newMsg._id)) return prev
          return [...prev, newMsg]
        })
      }
    }

    on('newMessage', handleNewMessage)
    return () => {
      off('newMessage', handleNewMessage)
    }
  }, [isOpen, conversationId, recipientId, on, off])

  // Scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  if (!isOpen) return null

  // 3. Send Message Handler
  const handleSendMessage = async (e) => {
    e?.preventDefault?.()
    if (!inputMessage.trim() || isSending || !recipientId) return

    const textToSend = inputMessage.trim()
    setInputMessage('')
    setIsSending(true)

    try {
      const savedMsg = await chatService.sendMessage({
        receiverId: recipientId,
        receiverModel: recipientRole,
        content: textToSend,
        listingId: crop?._id || crop?.lotId || null
      })

      if (savedMsg) {
        if (savedMsg.conversationId && !conversationId) {
          setConversationId(savedMsg.conversationId)
        }
        setMessages((prev) => {
          if (prev.some((m) => m._id === savedMsg._id)) return prev
          return [...prev, savedMsg]
        })
      }
    } catch (err) {
      toast.error('Failed to send message. Please try again.')
      setInputMessage(textToSend)
    } finally {
      setIsSending(false)
    }
  }

  // 4. Send Counter-Offer Message
  const handleSendCounterOffer = async (e) => {
    e?.preventDefault?.()
    const rate = Number(counterRate)
    if (!rate || rate <= 0 || !recipientId) {
      toast.error('Please enter a valid counter-offer price')
      return
    }

    const offerText = `[FORMAL COUNTER-OFFER]: Proposed ₹${rate.toLocaleString('en-IN')}/Qtl for ${crop.quantity || 100} ${crop.unit || 'Quintals'}.`
    setShowCounterBox(false)
    setIsSending(true)

    try {
      const savedMsg = await chatService.sendMessage({
        receiverId: recipientId,
        receiverModel: recipientRole,
        content: offerText,
        listingId: crop?._id || null
      })

      if (savedMsg) {
        setMessages((prev) => [...prev, savedMsg])
        toast.success(`Formal Counter-Offer of ₹${rate.toLocaleString('en-IN')}/Qtl submitted! 🤝`)
      }
    } catch (err) {
      toast.error('Failed to submit counter offer.')
    } finally {
      setIsSending(false)
    }
  }

  const handleQuickPromptClick = (prompt) => {
    setInputMessage(prompt.en)
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl w-full max-w-2xl h-[88vh] flex flex-col justify-between overflow-hidden shadow-2xl">
        
        {/* 1. Chat Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-foreground">
                  Direct Trade Negotiation: {recipientName}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {recipientRole} Channel
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <span>{crop.title || crop.name || 'Crop Produce Lot'}</span> • 
                <span className="font-mono text-purple-600 font-bold">Lot #{crop._id ? crop._id.slice(-6) : crop.lotId || 'LOT'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKannadaTranslation(!showKannadaTranslation)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                showKannadaTranslation
                  ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
              }`}
              title="Toggle Kannada (ಕನ್ನಡ) Auto-Translation"
            >
              <Languages className="w-4 h-4" />
              <span className="text-[11px]">ಕನ್ನಡ {showKannadaTranslation ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Message History Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Trust Safeguard Banner */}
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center space-y-0.5">
            <p className="text-[11px] font-bold text-purple-800 dark:text-purple-300 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              KrishiSetu Escrow & Trade Protection Active
            </p>
            <span className="text-[10px] text-muted-foreground">
              All agreed prices can be locked directly into smart escrow contracts.
            </span>
          </div>

          {loading && (
            <div className="p-8 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
              <p className="text-xs text-muted-foreground">Loading verified chat history from MongoDB...</p>
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="p-8 text-center space-y-2 rounded-2xl bg-muted/20 border border-dashed border-border">
              <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-xs font-bold text-foreground">No prior messages with {recipientName}</p>
              <p className="text-[11px] text-muted-foreground">Send a direct message or propose a price offer to start negotiating!</p>
            </div>
          )}

          {/* Messages Feed */}
          {messages.map((m, idx) => {
            const senderId = typeof m.sender === 'object' ? m.sender?._id : m.sender
            const isMe = senderId === user?._id || m.senderModel?.toLowerCase() === user?.role
            const isOffer = m.content?.includes('[FORMAL COUNTER-OFFER]')

            return (
              <div
                key={m._id || idx}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
              >
                <span className="text-[10px] font-bold text-muted-foreground px-1">
                  {isMe ? 'You' : recipientName}
                </span>

                <div
                  className={`p-3.5 rounded-2xl max-w-md shadow-sm space-y-1.5 ${
                    isMe
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-muted border border-border text-foreground rounded-bl-none'
                  }`}
                >
                  {/* Counter Offer Highlight */}
                  {isOffer && (
                    <div className="p-2.5 rounded-xl bg-black/20 border border-white/20 space-y-1">
                      <div className="flex items-center justify-between text-amber-300 font-bold text-[10px]">
                        <span className="flex items-center gap-1">
                          <Gavel className="w-3 h-3" /> FORMAL BINDING COUNTER-OFFER
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Message Text */}
                  <p className="text-xs leading-relaxed">{m.content}</p>

                  <div className="flex items-center justify-end gap-1 text-[9px] opacity-70 pt-0.5">
                    <span>{m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
                    <CheckCheck className="w-3 h-3" />
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* 3. Quick-Prompt Suggestions */}
        <div className="px-4 py-2 bg-muted/40 border-t border-border flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-muted-foreground uppercase shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-600" /> Quick Replies:
          </span>
          {QUICK_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPromptClick(p)}
              className="px-2.5 py-1 rounded-xl bg-card border border-border hover:border-purple-500/40 text-[11px] text-muted-foreground hover:text-foreground shrink-0 transition-colors truncate max-w-xs"
            >
              {p.en}
            </button>
          ))}
        </div>

        {/* 4. Bottom Interaction Bar */}
        <div className="p-4 border-t border-border bg-card space-y-3">
          
          {/* Counter-Offer Expandable Box */}
          {showCounterBox && (
            <form onSubmit={handleSendCounterOffer} className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
                  <Gavel className="w-4 h-4" /> Propose Binding Counter-Offer:
                </span>
                <button 
                  type="button" 
                  onClick={() => setShowCounterBox(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-muted-foreground font-bold text-xs">₹</span>
                  <input
                    type="number"
                    value={counterRate}
                    onChange={(e) => setCounterRate(e.target.value)}
                    placeholder="Enter rate per Quintal..."
                    className="w-full h-9 pl-7 pr-3 rounded-xl bg-background border border-border text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isSending}
                  className="h-9 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-4 shrink-0 shadow-sm"
                >
                  {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Submit Offer 🤝'}
                </Button>
              </div>
            </form>
          )}

          {/* Standard Input Row */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCounterBox(!showCounterBox)}
              className="rounded-xl text-xs h-10 px-3 border-purple-500/30 text-purple-600 hover:bg-purple-500/10 font-bold shrink-0"
            >
              <Gavel className="w-3.5 h-3.5 mr-1" /> Make Offer
            </Button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Type message to ${recipientName}...`}
              className="flex-1 h-10 px-4 rounded-xl bg-muted/40 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />

            <Button
              type="submit"
              size="sm"
              disabled={isSending || !inputMessage.trim()}
              className="rounded-xl h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white shadow-md shrink-0 flex items-center justify-center"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TradeChatModal
