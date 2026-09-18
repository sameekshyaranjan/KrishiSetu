import { useState, useRef, useEffect } from 'react'
import {
  MessageSquare,
  Send,
  CheckCheck,
  ShieldCheck,
  Gavel,
  Languages,
  Sparkles,
  Check,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import ScrollPop from '@/components/common/ScrollPop'

const QUICK_PROMPTS = [
  {
    en: 'Is the lot available for immediate dispatch?',
    kn: 'ಲಾಟ್ ತಕ್ಷಣದ ರವಾನೆಗೆ ಲಭ್ಯವಿದೆಯೇ?',
  },
  {
    en: 'Packaging confirmed in 25kg standard plastic crates.',
    kn: '25 ಕೆಜಿ ಪ್ರಮಾಣಿತ ಪ್ಲಾಸ್ಟಿಕ್ ಕ್ರೇಟ್‌ಗಳಲ್ಲಿ ಪ್ಯಾಕಿಂಗ್ ದೃಢಪಟ್ಟಿದೆ.',
  },
  {
    en: 'Truck dispatch scheduled for 06:00 AM tomorrow.',
    kn: 'ನಾಳೆ ಬೆಳಿಗ್ಗೆ 06:00 ಗಂಟೆಗೆ ವಾಹನ ರವಾನೆ ನಿಗದಿಯಾಗಿದೆ.',
  },
  {
    en: 'Please share the latest APMC Weighbridge Slip.',
    kn: 'ದಯವಿಟ್ಟು ಇತ್ತೀಚಿನ ಎಪಿಎಂಸಿ ತೂಕದ ರಸೀದಿಯನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.',
  },
]

const INITIAL_MESSAGES = [
  {
    id: 'msg-1',
    role: 'trader',
    sender: 'Bengaluru Fresh Retails',
    license: 'APMC #KA-BLR-491',
    en: 'Hello Raju, we inspected your 40 Qtl Hybrid Tomato lot (#KA-KLR-882). We placed an initial bid of ₹2,240/Qtl with same-day pickup.',
    kn: 'ನಮಸ್ಕಾರ ರಾಜು ಅವರೇ, ನಿಮ್ಮ 40 ಕ್ವಿಂಟಾಲ್ ಹೈಬ್ರಿಡ್ ಟೊಮೇಟೊ ಲಾಟ್ (#KA-KLR-882) ಪರಿಶೀಲಿಸಿದ್ದೇವೆ. ಇಂದು ಸಂಜೆ ರವಾನೆಯೊಂದಿಗೆ ₹2,240/ಕ್ವಿಂಟಾಲ್ ಬಿಡ್ ನೀಡಿದ್ದೇವೆ.',
    time: '08:42 AM',
  },
  {
    id: 'msg-2',
    role: 'farmer',
    sender: 'Raju Patel (Farmer)',
    license: 'Kolar Producer',
    en: 'All 40 Qtl are Grade A, harvested at 05:30 AM today. Can we agree at ₹2,280/Qtl? Quality is certified.',
    kn: 'ಎಲ್ಲಾ 40 ಕ್ವಿಂಟಾಲ್ ಗ್ರೇಡ್ A ಗುಣಮಟ್ಟದ್ದು, ಇಂದು ಬೆಳಿಗ್ಗೆ 05:30 ಕ್ಕೆ ಕೊಯ್ಲು ಮಾಡಲಾಗಿದೆ. ₹2,280/ಕ್ವಿಂಟಾಲ್‌ಗೆ ಒಪ್ಪಬಹುದೇ?',
    time: '08:45 AM',
  },
]

export const NegotiationChat = () => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [showKannada, setShowKannada] = useState(true)
  const [userRole, setUserRole] = useState('farmer') // 'farmer' | 'trader'
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [counterState, setCounterState] = useState('proposed') // 'proposed' | 'countered' | 'accepted'
  const [counterAmount, setCounterAmount] = useState(2280)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputMessage).trim()
    if (!text) return

    const newMsg = {
      id: `msg-${Date.now()}`,
      role: userRole,
      sender: userRole === 'farmer' ? 'Raju Patel (Farmer)' : 'Bengaluru Fresh Retails',
      license: userRole === 'farmer' ? 'Kolar Producer' : 'APMC #KA-BLR-491',
      en: text,
      kn: showKannada ? `${text} (ಸ್ವೀಕರಿಸಲಾಗಿದೆ)` : text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, newMsg])
    setInputMessage('')
    setIsTyping(true)

    // Simulated authentic partner response
    setTimeout(() => {
      let replyEn = 'Confirmed. The details are recorded in the trade ledger.'
      let replyKn = 'ದೃಢಪಡಿಸಲಾಗಿದೆ. ವಿವರಗಳನ್ನು ವ್ಯಾಪಾರ ಲೆಡ್ಜರ್‌ನಲ್ಲಿ ದಾಖಲಿಸಲಾಗಿದೆ.'

      const lower = text.toLowerCase()
      if (lower.includes('price') || lower.includes('₹') || lower.includes('counter') || lower.includes('rate')) {
        replyEn = 'Price proposal acknowledged. Updating lot negotiation record for escrow sync.'
        replyKn = 'ಬೆಲೆ ಪ್ರಸ್ತಾವನೆಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ಎಸ್ಕ್ರೋ ಹೊಂದಾಣಿಕೆಗಾಗಿ ದಾಖಲೆ ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ.'
      } else if (lower.includes('dispatch') || lower.includes('truck') || lower.includes('pickup')) {
        replyEn = 'Collection truck KA-04-E-4812 confirmed for 06:00 AM farm-gate pickup.'
        replyKn = 'ವಾಹನ KA-04-E-4812 ನಾಳೆ ಬೆಳಿಗ್ಗೆ 06:00 ಗಂಟೆಗೆ ತೋಟದ ಬಳಿ ಬರಲು ನಿಗದಿಯಾಗಿದೆ.'
      } else if (lower.includes('slip') || lower.includes('weigh') || lower.includes('quality')) {
        replyEn = 'APMC weighbridge slip will be digitally signed on-site before truck departure.'
        replyKn = 'ವಾಹನ ಹೊರಡುವ ಮುನ್ನ ಎಪಿಎಂಸಿ ತೂಕದ ರಸೀದಿಯನ್ನು ಡಿಜಿಟಲ್ ಆಗಿ ಸಹಿ ಮಾಡಲಾಗುತ್ತದೆ.'
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: userRole === 'farmer' ? 'trader' : 'farmer',
          sender: userRole === 'farmer' ? 'Bengaluru Fresh Retails' : 'Raju Patel (Farmer)',
          license: userRole === 'farmer' ? 'APMC #KA-BLR-491' : 'Kolar Producer',
          en: replyEn,
          kn: replyKn,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      setIsTyping(false)
    }, 750)
  }

  const handleAcceptCounter = () => {
    setCounterState('accepted')
    const confirmMsg = {
      id: `msg-${Date.now()}`,
      role: 'farmer',
      sender: 'Raju Patel (Farmer)',
      en: `Formal counter-offer of ₹${counterAmount.toLocaleString('en-IN')}/Qtl ACCEPTED! Requesting ₹${(counterAmount * 40).toLocaleString('en-IN')} escrow funding.`,
      kn: `₹${counterAmount.toLocaleString('en-IN')}/ಕ್ವಿಂಟಾಲ್ ಪ್ರಸ್ತಾವನೆಯನ್ನು ಒಪ್ಪಿಕೊಳ್ಳಲಾಗಿದೆ! ₹${(counterAmount * 40).toLocaleString('en-IN')} ಎಸ್ಕ್ರೋ ಠೇವಣಿ ಕೋರಲಾಗಿದೆ.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, confirmMsg])
    setIsTyping(true)

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: 'trader',
          sender: 'Bengaluru Fresh Retails',
          en: `₹${(counterAmount * 40).toLocaleString('en-IN')} pre-funded into KrishiSetu Escrow Pool. Truck KA-04-E-4812 authorized for dispatch!`,
          kn: `₹${(counterAmount * 40).toLocaleString('en-IN')} ಮೊತ್ತವನ್ನು ಕೃಷಿಸೇತು ಎಸ್ಕ್ರೋ ಖಾತೆಗೆ ಠೇವಣಿ ಮಾಡಲಾಗಿದೆ. ವಾಹನ ರವಾನೆಗೆ ಅನುಮೋದಿಸಲಾಗಿದೆ!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      setIsTyping(false)
    }, 800)
  }

  const handleCustomCounter = (newRate) => {
    setCounterAmount(newRate)
    setCounterState('countered')
    const counterMsg = {
      id: `msg-${Date.now()}`,
      role: 'trader',
      sender: 'Bengaluru Fresh Retails',
      en: `[FORMAL COUNTER-OFFER]: Proposed revised ₹${newRate.toLocaleString('en-IN')}/Qtl for 40 Quintals (Total ₹${(newRate * 40).toLocaleString('en-IN')}).`,
      kn: `[ಅಧಿಕೃತ ಕೌಂಟರ್ ಪ್ರಸ್ತಾವನೆ]: 40 ಕ್ವಿಂಟಾಲ್‌ಗಳಿಗೆ ₹${newRate.toLocaleString('en-IN')}/ಕ್ವಿಂಟಾಲ್ (ಒಟ್ಟು ₹${(newRate * 40).toLocaleString('en-IN')}) ಪ್ರಸ್ತಾಪಿಸಲಾಗಿದೆ.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, counterMsg])
    setIsTyping(true)

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: 'farmer',
          sender: 'Raju Patel (Farmer)',
          en: `Counter-offer of ₹${newRate.toLocaleString('en-IN')}/Qtl received. Standing by to accept or review terms.`,
          kn: `₹${newRate.toLocaleString('en-IN')}/ಕ್ವಿಂಟಾಲ್ ಕೌಂಟರ್ ಪ್ರಸ್ತಾವನೆ ಸ್ವೀಕರಿಸಲಾಗಿದೆ. ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      setIsTyping(false)
    }, 700)
  }

  const resetConversation = () => {
    setMessages(INITIAL_MESSAGES)
    setCounterState('proposed')
    setCounterAmount(2280)
  }

  return (
    <section id="negotiation" className="bg-surface-strong py-16 lg:py-24 text-surface-strong-foreground border-b border-border">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[.82fr_1.18fr] lg:gap-14 items-start">
          
          {/* Section Description & Guarantees */}
          <div className="space-y-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-trader flex items-center gap-2">
                <span className="size-2 rounded-full bg-trader animate-pulse" />
                Bilingual Trade Negotiation
              </p>
              <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl text-surface-strong-foreground">
                The trade stays bound to the conversation.
              </h2>
            </div>
            
            <p className="text-sm leading-7 text-primary-foreground/75">
              Experience the actual KrishiSetu trade chat. Buyer APMC licensing, lot terms, formal counter-offers, and escrow guarantees stay pinned inside the negotiation room—in both Kannada and English.
            </p>

            <div className="space-y-3 pt-2">
              <ScrollPop delay={0} className="border border-primary-foreground/15 p-3.5 rounded-sm bg-primary-foreground/5 flex items-start gap-3">
                <Gavel className="size-4 text-trader shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs text-surface-strong-foreground block">Formal Binding Counters</strong>
                  <p className="text-[11px] text-primary-foreground/65 mt-0.5">
                    Proposals are formal contract amendments, not loose casual text.
                  </p>
                </div>
              </ScrollPop>

              <ScrollPop delay={80} className="border border-primary-foreground/15 p-3.5 rounded-sm bg-primary-foreground/5 flex items-start gap-3">
                <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs text-surface-strong-foreground block">Instant Escrow Lock</strong>
                  <p className="text-[11px] text-primary-foreground/65 mt-0.5">
                    When either party accepts, the agreed total is locked into bank escrow before transit.
                  </p>
                </div>
              </ScrollPop>
            </div>

            {/* Role Simulation Switcher & Reset */}
            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-2 border border-primary-foreground/20 p-1 rounded-sm">
                <button
                  onClick={() => setUserRole('farmer')}
                  className={`px-3 py-1.5 text-xs font-bold transition-all rounded-xs ${
                    userRole === 'farmer' ? 'bg-market text-market-foreground' : 'text-primary-foreground/70 hover:text-white'
                  }`}
                >
                  Test as Farmer
                </button>
                <button
                  onClick={() => setUserRole('trader')}
                  className={`px-3 py-1.5 text-xs font-bold transition-all rounded-xs ${
                    userRole === 'trader' ? 'bg-trader text-trader-foreground' : 'text-primary-foreground/70 hover:text-white'
                  }`}
                >
                  Test as Trader
                </button>
              </div>

              <button
                onClick={resetConversation}
                className="text-[11px] font-bold text-primary-foreground/60 hover:text-white flex items-center gap-1.5 transition-colors"
                title="Reset simulation"
              >
                <RotateCcw className="size-3" /> Reset Chat
              </button>
            </div>
          </div>

          {/* ── COMPACT AUTHENTIC MINIATURE OF TradeChatModal.jsx ── */}
          <div className="border border-primary-foreground/20 bg-card text-card-foreground shadow-2xl rounded-sm overflow-hidden flex flex-col h-[560px]">
            
            {/* Header: Exact TradeChatModal Anatomy */}
            <div className="p-3.5 sm:p-4 border-b border-border bg-muted/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="grid size-8 shrink-0 place-items-center rounded-sm bg-primary/10 text-primary border border-primary/20">
                  <MessageSquare className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs sm:text-sm text-foreground truncate">
                      Bengaluru Fresh Retails
                    </h3>
                    <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold border border-emerald-500/20">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      APMC #KA-BLR-491
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                    <span>Lot #KA-KLR-882 (Hybrid Tomato · 40 Qtl)</span>
                    <span>·</span>
                    <span className="text-primary font-mono font-semibold">Socket.IO active</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowKannada((prev) => !prev)}
                className={`shrink-0 px-2.5 py-1.5 rounded-xs border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  showKannada
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-background border-border text-muted-foreground hover:text-foreground'
                }`}
                title="Toggle Kannada (ಕನ್ನಡ) Auto-Translation"
              >
                <Languages className="size-3.5" />
                <span>ಕನ್ನಡ {showKannada ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Escrow Safeguard Banner */}
            <div className="px-4 py-2 bg-primary/10 border-b border-primary/15 text-center flex items-center justify-center gap-2 text-[10px] text-foreground font-semibold">
              <ShieldCheck className="size-3.5 text-primary shrink-0" />
              <span className="truncate">KrishiSetu Escrow & APMC Trade Protection Active</span>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-background/50">
              {messages.map((m) => {
                const isFarmer = m.role === 'farmer'
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isFarmer ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <span className="text-[9px] font-bold text-muted-foreground px-1">
                      {m.sender}
                    </span>

                    <div
                      className={`p-3 rounded-sm max-w-[85%] shadow-xs space-y-1 ${
                        isFarmer
                          ? 'bg-market text-market-foreground border border-primary/20'
                          : 'bg-card border border-border text-card-foreground'
                      }`}
                    >
                      <p className="text-xs leading-relaxed">{m.en}</p>
                      {showKannada && m.kn && (
                        <p className="text-[11px] leading-relaxed pt-0.5 border-t border-current/15 opacity-85 font-serif">
                          {m.kn}
                        </p>
                      )}
                      <div className="flex items-center justify-end gap-1 text-[9px] opacity-70 pt-0.5">
                        <span>{m.time}</span>
                        <CheckCheck className="size-3" />
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Interactive Formal Counter Card (Embedded inside the chat stream) */}
              <div className={`border-2 border-trader bg-card p-3.5 rounded-sm space-y-2 shadow-sm transition-all ${
                counterState === 'accepted' ? 'opacity-85 border-emerald-500' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-trader">
                    <Gavel className="size-3.5" /> Formal Binding Counter-Offer
                  </span>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-xs ${
                    counterState === 'accepted' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-500/20 text-amber-700'
                  }`}>
                    {counterState === 'accepted' ? 'Accepted · Escrow Funded' : 'Pending Action'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="font-display text-2xl text-foreground">
                      ₹{counterAmount.toLocaleString('en-IN')}
                      <small className="font-sans text-xs text-muted-foreground font-normal"> / Qtl</small>
                    </span>
                    <span className="block text-[10px] text-muted-foreground">
                      Total Lot Value: ₹{(counterAmount * 40).toLocaleString('en-IN')} (40 Quintals)
                    </span>
                  </div>

                  {counterState !== 'accepted' && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="farmer"
                        onClick={handleAcceptCounter}
                        className="text-xs h-8"
                      >
                        <Check className="size-3 mr-1" />
                        Accept ₹{counterAmount}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCustomCounter(counterAmount === 2280 ? 2260 : 2300)}
                        className="text-xs h-8"
                      >
                        Counter {counterAmount === 2280 ? '₹2,260' : '₹2,300'}
                      </Button>
                    </div>
                  )}
                </div>

                {counterState === 'accepted' && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 pt-1 border-t border-border">
                    <CheckCheck className="size-3" /> Both parties committed. Bank escrow deposit sequence verified.
                  </p>
                )}
              </div>

              {isTyping && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground py-1">
                  <span className="size-1.5 rounded-full bg-primary animate-bounce" />
                  <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                  <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1">Partner is responding...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies Strip (from TradeChatModal.jsx) */}
            <div className="px-3 py-2 bg-muted/40 border-t border-border flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[9px] font-bold text-muted-foreground uppercase shrink-0 flex items-center gap-1">
                <Sparkles className="size-3 text-primary" /> Quick:
              </span>
              {QUICK_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(showKannada ? `${p.en} / ${p.kn}` : p.en)}
                  className="px-2.5 py-1 rounded-xs bg-card border border-border hover:border-primary text-[10px] text-muted-foreground hover:text-foreground shrink-0 transition-colors truncate max-w-[200px]"
                >
                  {showKannada ? p.kn : p.en}
                </button>
              ))}
            </div>

            {/* Bottom Message Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="p-3 border-t border-border bg-card flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  userRole === 'farmer'
                    ? (showKannada ? 'ಕೃಷಿಕರಾಗಿ ಸಂದೇಶ ಬರೆಯಿರಿ (ಉದಾ: ನಾಳೆ ಬೆಳಿಗ್ಗೆ ಬನ್ನಿ)...' : 'Type message as Farmer (e.g. Produce packed and ready)...')
                    : (showKannada ? 'ಖರೀದಿದಾರರಾಗಿ ಸಂದೇಶ ಬರೆಯಿರಿ...' : 'Type message as Trader (e.g. Truck arriving at 06:00 AM)...')
                }
                className="flex-1 bg-background border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground rounded-xs outline-hidden focus:border-primary"
              />
              <Button
                type="submit"
                size="sm"
                variant={userRole === 'farmer' ? 'farmer' : 'trader'}
                disabled={!inputMessage.trim()}
                className="h-8 px-3"
              >
                <span>Send</span>
                <Send className="size-3 ml-1" />
              </Button>
            </form>

          </div>

        </div>
      </div>
    </section>
  )
}

export default NegotiationChat
