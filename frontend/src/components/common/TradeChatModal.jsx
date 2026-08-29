import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Sparkles, 
  X, 
  Sprout, 
  Briefcase, 
  ShieldCheck, 
  DollarSign, 
  CheckCheck, 
  Clock, 
  Languages, 
  Gavel, 
  ArrowRight,
  Layers,
  MapPin
} from 'lucide-react'

const INITIAL_MESSAGES = [
  {
    id: 'm1',
    sender: 'farmer',
    senderName: 'Ramesh Gowda (Farmer)',
    text: 'ನಮಸ್ಕಾರ, ನಮ್ಮ ಟೊಮ್ಯಾಟೊ ಲಾಟ್ (120 ಕ್ವಿಂಟಾಲ್) ಬೆಳಿಗ್ಗೆ ಕೊಯ್ಲು ಮಾಡಲಾಗಿದೆ. ಸಂಪೂರ್ಣ ಗ್ರೇಡ್-ಎ ಗುಣಮಟ್ಟ.',
    translation: 'Hello, our tomato lot (120 Quintals) was harvested this morning. 100% Grade-A premium quality.',
    time: '14:20 IST',
    isCounterOffer: false
  },
  {
    id: 'm2',
    sender: 'trader',
    senderName: 'Karnataka Agro Traders (You)',
    text: 'Hello Ramesh ji, we inspected the lot via live video. Can you do ₹2,180/Qtl for immediate 100% lot buyout?',
    translation: 'ನಮಸ್ತೆ ರಮೇಶ್ ಜಿ, ನಾವು ಲೈವ್ ವೀಡಿಯೊ ಮೂಲಕ ಪರಿಶೀಲಿಸಿದ್ದೇವೆ. ತಕ್ಷಣದ ಖರೀದಿಗೆ ₹2,180/ಕ್ವಿಂಟಾಲ್ ಸಾಧ್ಯವೇ?',
    time: '14:25 IST',
    isCounterOffer: true,
    offerAmount: 2180
  },
  {
    id: 'm3',
    sender: 'farmer',
    senderName: 'Ramesh Gowda (Farmer)',
    text: 'ಖಂಡಿತ ಒಪ್ಪಿಗೆ ಇದೆ. ನಾಳೆ ಬೆಳಿಗ್ಗೆ 06:00 ಗಂಟೆಗೆ ಯಶವಂತಪುರ ಮಾರುಕಟ್ಟೆಗೆ ಲಾರಿ ಲೋಡಿಂಗ್ ಮಾಡಲು ಸಿದ್ಧವಿದೆ.',
    translation: 'Agreed! We can load the truck for Yeshwanthpur APMC delivery by 06:00 AM tomorrow.',
    time: '14:28 IST',
    isCounterOffer: false
  }
]

const QUICK_PROMPTS = [
  {
    en: 'Can you do ₹2,180/Qtl for immediate full lot buyout?',
    kn: 'ತಕ್ಷಣದ ಖರೀದಿಗೆ ₹2,180/ಕ್ವಿಂಟಾಲ್ ನೀಡಲು ಸಾಧ್ಯವೇ?'
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
  crop = {
    title: 'Grade-A Fresh Hybrid Tomato',
    farmerName: 'Ramesh Gowda',
    location: 'Belur, Hassan',
    quantity: '120 Quintals',
    price: 2180,
    lotId: 'LOT-KA-HSN-101'
  },
  onAcceptOffer
}) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [inputMessage, setInputMessage] = useState('')
  const [showKannadaTranslation, setShowKannadaTranslation] = useState(true)
  const [counterRate, setCounterRate] = useState(String(crop.price || 2180))
  const [showCounterBox, setShowCounterBox] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  if (!isOpen) return null

  const handleSendMessage = (e) => {
    e?.preventDefault?.()
    if (!inputMessage.trim()) return

    const newMsg = {
      id: `m-${Date.now()}`,
      sender: user?.role === 'farmer' ? 'farmer' : 'trader',
      senderName: user?.name || (user?.role === 'farmer' ? 'Farmer' : 'Trader (You)'),
      text: inputMessage,
      translation: `[Kannada Translation]: ${inputMessage}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
      isCounterOffer: false
    }

    setMessages((prev) => [...prev, newMsg])
    setInputMessage('')
    toast.success('Message sent!')
  }

  const handleSendCounterOffer = (e) => {
    e?.preventDefault?.()
    const rate = Number(counterRate)
    if (!rate || rate <= 0) {
      toast.error('Please enter a valid counter-offer price')
      return
    }

    const newOfferMsg = {
      id: `m-offer-${Date.now()}`,
      sender: user?.role === 'farmer' ? 'farmer' : 'trader',
      senderName: user?.name || 'Trader (You)',
      text: `Formal Price Negotiation: Proposed ₹${rate.toLocaleString('en-IN')}/Qtl for ${crop.quantity}.`,
      translation: `ಔಪಚಾರಿಕ ಬೆಲೆ ಸಂಧಾನ: ${crop.quantity} ಗೆ ₹${rate.toLocaleString('en-IN')}/ಕ್ವಿಂಟಾಲ್ ಪ್ರಸ್ತಾಪಿಸಲಾಗಿದೆ.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
      isCounterOffer: true,
      offerAmount: rate
    }

    setMessages((prev) => [...prev, newOfferMsg])
    setShowCounterBox(false)
    toast.success(`Formal Counter-Offer of ₹${rate.toLocaleString('en-IN')}/Qtl submitted! 🤝`)
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
                  Direct Trade Negotiation Channel
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Chat
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <span>{crop.title}</span> • 
                <span className="font-mono text-purple-600 font-bold">{crop.lotId}</span> • 
                <span>{crop.farmerName} ({crop.location})</span>
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
            <p className="text-[11px] font-bold text-purple-800 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              KrishiSetu Escrow Protection Active
            </p>
            <span className="text-[10px] text-purple-900/80">
              All agreed prices can be locked directly into smart escrow from this chat.
            </span>
          </div>

          {/* Messages */}
          {messages.map((m) => {
            const isMe = m.sender === (user?.role === 'farmer' ? 'farmer' : 'trader')

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
              >
                <span className="text-[10px] font-bold text-muted-foreground px-1">
                  {m.senderName}
                </span>

                <div
                  className={`p-3.5 rounded-2xl max-w-md shadow-sm space-y-1.5 ${
                    isMe
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-muted border border-border text-foreground rounded-bl-none'
                  }`}
                >
                  {/* If Counter-Offer Card */}
                  {m.isCounterOffer && (
                    <div className="p-2.5 rounded-xl bg-black/20 border border-white/20 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                          <Gavel className="w-3 h-3" /> FORMAL COUNTER-OFFER
                        </span>
                        <span className="font-mono font-black text-xs text-white">
                          ₹{m.offerAmount?.toLocaleString('en-IN')}/Qtl
                        </span>
                      </div>
                      <p className="text-[10px] opacity-90">
                        Total Escrow Value: ₹{((m.offerAmount || 0) * 120).toLocaleString('en-IN')} (120 Qtl)
                      </p>
                    </div>
                  )}

                  {/* Message Text */}
                  <p className="text-xs leading-relaxed">{m.text}</p>

                  {/* Auto-Translation Subtext */}
                  {showKannadaTranslation && m.translation && (
                    <div className={`pt-1 border-t text-[11px] ${
                      isMe ? 'border-white/20 text-purple-100 font-sans' : 'border-border text-muted-foreground font-sans'
                    }`}>
                      {m.translation}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1 text-[9px] opacity-70 pt-0.5">
                    <span>{m.time}</span>
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
                <span className="flex items-center gap-1.5 text-purple-700">
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
                  className="h-9 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-4 shrink-0 shadow-sm"
                >
                  Submit Offer 🤝
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
              placeholder="Type message in English or Kannada..."
              className="flex-1 h-10 px-4 rounded-xl bg-muted/40 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />

            <Button
              type="submit"
              size="sm"
              className="rounded-xl h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white shadow-md shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TradeChatModal
