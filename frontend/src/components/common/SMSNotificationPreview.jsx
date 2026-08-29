import { useState } from 'react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { notificationService, NOTIFICATION_TEMPLATES } from '@/services/notificationService'
import { 
  Smartphone, 
  Send, 
  Languages, 
  CheckCheck, 
  ShieldCheck, 
  Radio, 
  Sparkles, 
  MessageSquare, 
  Bell, 
  RefreshCw, 
  X, 
  Wifi, 
  Battery, 
  Signal,
  Gavel,
  DollarSign,
  Truck,
  Video
} from 'lucide-react'

export const SMSNotificationPreview = ({ isOpen, onClose }) => {
  const [selectedChannel, setSelectedChannel] = useState('sms') // 'sms' | 'whatsapp' | 'push'
  const [selectedLang, setSelectedLang] = useState('kn') // 'kn' | 'en'
  const [activeTab, setActiveTab] = useState('OUTBID_ALERT')
  const [feed, setFeed] = useState([
    {
      id: 'n1',
      sender: 'VK-KRISETU',
      time: '14:20 IST',
      text: '[ಕೃಷಿಸೇತು] ಎಚ್ಚರಿಕೆ: Grade-A Tomato (LOT-KA-HSN-101) ಮೇಲೆ ಹೊಸ ಬಿಡ್ ₹2,150/ಕ್ವಿಂಟಾಲ್ ಬಂದಿದೆ. ನಿಮ್ಮ ಬಿಡ್ ಹೆಚ್ಚಿಸಲು ಭೇಟಿ ನೀಡಿ: https://krishisetu.in/lot/101',
      channel: 'sms'
    },
    {
      id: 'n2',
      sender: 'VK-KRISETU',
      time: '12:05 IST',
      text: '[ಕೃಷಿಸೇತು] ಪಾವತಿ ಯಶಸ್ವಿ: ₹2,58,000 ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮಾ ಆಗಿದೆ (DBT Ref: KA-ESC-88192). ಎಪಿಎಂಸಿ ಶುಲ್ಕ ಕಡಿತಗೊಳಿಸಲಾಗಿದೆ.',
      channel: 'sms'
    }
  ])

  if (!isOpen) return null

  const handleTestDispatch = (templateKey) => {
    let params = {}
    if (templateKey === 'OUTBID_ALERT') {
      params = { cropName: 'Grade-A Tomato', amount: 2200, lotId: 'LOT-KA-HSN-101' }
    } else if (templateKey === 'ESCROW_PAYOUT') {
      params = { amount: 264000, refNo: 'KA-DBT-99182' }
    } else if (templateKey === 'WEIGHBRIDGE_PASS') {
      params = { mandi: 'Yeshwanthpur APMC', netWeight: '120.0', slipNo: 'WB-2026-8819' }
    } else if (templateKey === 'VIDEO_INSPECTION_INVITE') {
      params = { buyerName: 'KA Agro Traders', lotId: 'LOT-KA-HSN-101' }
    } else if (templateKey === 'DISPUTE_HEARING') {
      params = { caseId: 'DSP-KA-2026-001', status: '85% Disbursed to Farmer' }
    }

    const template = NOTIFICATION_TEMPLATES[templateKey]
    const content = selectedLang === 'kn' ? template.kn(...Object.values(params)) : template.en(...Object.values(params))

    const newRecord = {
      id: `n-${Date.now()}`,
      sender: selectedChannel === 'sms' ? 'VK-KRISETU' : 'KrishiSetu Official',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
      text: content,
      channel: selectedChannel
    }

    setFeed([newRecord, ...feed])
    notificationService.dispatch({ templateKey, params, channel: selectedChannel, lang: selectedLang })
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col justify-between overflow-hidden shadow-2xl">
        
        {/* 1. Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-foreground">
                  CDAC e-Gov SMS & Push Notification Dispatcher 📱
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border border-emerald-500/20">
                  CDAC Gateway Active 🟢
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Simulate real-time transactional alerts dispatched to Karnataka farmers & traders via SMS, WhatsApp, and App Push.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Main Two-Column View: Dispatch Triggers (Left) & Phone Mockup (Right) */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Dispatch Controls & Templates (7 Cols) */}
          <div className="md:col-span-7 space-y-4 text-xs">
            
            {/* Channel & Language Toggles */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase text-[10px]">Gateway Channel:</label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedChannel('sms')}
                    className={`flex-1 py-2 rounded-xl font-bold transition-all border ${
                      selectedChannel === 'sms' ? 'bg-purple-600 text-white border-purple-500 shadow-sm' : 'bg-muted border-border text-muted-foreground'
                    }`}
                  >
                    SMS (CDAC)
                  </button>
                  <button
                    onClick={() => setSelectedChannel('whatsapp')}
                    className={`flex-1 py-2 rounded-xl font-bold transition-all border ${
                      selectedChannel === 'whatsapp' ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm' : 'bg-muted border-border text-muted-foreground'
                    }`}
                  >
                    WhatsApp API
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase text-[10px]">Language Translation:</label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedLang('kn')}
                    className={`flex-1 py-2 rounded-xl font-bold transition-all border ${
                      selectedLang === 'kn' ? 'bg-purple-600 text-white border-purple-500 shadow-sm' : 'bg-muted border-border text-muted-foreground'
                    }`}
                  >
                    ಕನ್ನಡ (Kannada)
                  </button>
                  <button
                    onClick={() => setSelectedLang('en')}
                    className={`flex-1 py-2 rounded-xl font-bold transition-all border ${
                      selectedLang === 'en' ? 'bg-purple-600 text-white border-purple-500 shadow-sm' : 'bg-muted border-border text-muted-foreground'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>
            </div>

            {/* Template Dispatch Buttons */}
            <div className="space-y-2 pt-2">
              <span className="font-extrabold text-foreground uppercase tracking-wider text-[11px] block">
                Trigger Real-Time Transactional Alerts:
              </span>

              <div className="space-y-2">
                
                {/* 1. Outbid Alert */}
                <div className="p-3 rounded-2xl bg-card border border-border flex items-center justify-between hover:border-purple-500/40 transition-colors">
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground flex items-center gap-1.5">
                      <Gavel className="w-3.5 h-3.5 text-amber-600" /> Auction Outbid Alert SMS
                    </p>
                    <span className="text-[11px] text-muted-foreground">Notifies farmer/buyer when a higher bid is placed.</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleTestDispatch('OUTBID_ALERT')}
                    className="rounded-xl text-xs h-8 px-3 font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                  >
                    Dispatch 🚀
                  </Button>
                </div>

                {/* 2. Escrow Payout */}
                <div className="p-3 rounded-2xl bg-card border border-border flex items-center justify-between hover:border-purple-500/40 transition-colors">
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> DBT Escrow Disbursal SMS
                    </p>
                    <span className="text-[11px] text-muted-foreground">Confirms bank credit to farmer with treasury ref #.</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleTestDispatch('ESCROW_PAYOUT')}
                    className="rounded-xl text-xs h-8 px-3 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    Dispatch 🚀
                  </Button>
                </div>

                {/* 3. Weighbridge Pass */}
                <div className="p-3 rounded-2xl bg-card border border-border flex items-center justify-between hover:border-purple-500/40 transition-colors">
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-blue-600" /> APMC Digital Weighbridge Slip SMS
                    </p>
                    <span className="text-[11px] text-muted-foreground">Transmits net quintals and yard gate exit pass.</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleTestDispatch('WEIGHBRIDGE_PASS')}
                    className="rounded-xl text-xs h-8 px-3 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  >
                    Dispatch 🚀
                  </Button>
                </div>

                {/* 4. Live Video Inspection */}
                <div className="p-3 rounded-2xl bg-card border border-border flex items-center justify-between hover:border-purple-500/40 transition-colors">
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-purple-600" /> Video Inspection Invitation SMS
                    </p>
                    <span className="text-[11px] text-muted-foreground">Sends direct 1-click WebRTC room connect link.</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleTestDispatch('VIDEO_INSPECTION_INVITE')}
                    className="rounded-xl text-xs h-8 px-3 font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                  >
                    Dispatch 🚀
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Smartphone Mockup Simulation (5 Cols) */}
          <div className="md:col-span-5 flex justify-center">
            <div className="w-full max-w-[280px] sm:max-w-[300px] h-[480px] rounded-[36px] bg-slate-950 border-[6px] border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden relative text-white">
              
              {/* Phone Top Notch & Status Bar */}
              <div className="pt-2 px-5 flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>09:41</span>
                <div className="w-16 h-3.5 bg-slate-800 rounded-full mx-auto" />
                <div className="flex items-center gap-1 text-[9px]">
                  <Signal className="w-3 h-3" />
                  <Wifi className="w-3 h-3" />
                  <Battery className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Message Thread Header */}
              <div className="p-2.5 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur text-center space-y-0.5">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs mx-auto">
                  VK
                </div>
                <p className="font-bold text-xs text-white">VK-KRISETU</p>
                <span className="text-[9px] text-slate-400 font-mono">Government CDAC SMS Gateway</span>
              </div>

              {/* SMS Bubbles Stream */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-[11px] leading-snug">
                {feed.map((msg) => (
                  <div key={msg.id} className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-1 shadow-sm">
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                      <span className="font-bold text-purple-400">{msg.sender}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="text-slate-200 font-sans">{msg.text}</p>
                    <div className="flex justify-end pt-0.5 text-[9px] text-emerald-400 font-mono">
                      <span>✓✓ Delivered</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Phone Bottom Home Bar */}
              <div className="pb-2 pt-1 text-center">
                <div className="w-24 h-1 bg-slate-700 rounded-full mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SMSNotificationPreview
