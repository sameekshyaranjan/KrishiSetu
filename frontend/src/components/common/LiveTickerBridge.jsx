import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  Radio, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  Layers, 
  ShieldCheck, 
  RefreshCw, 
  X, 
  Sparkles, 
  Terminal, 
  Copy, 
  CheckCheck,
  Server
} from 'lucide-react'

const DEFAULT_TICKER_FEED = [
  { id: '1', crop: 'Hybrid Tomato', mandi: 'Hassan APMC', price: 2200, shift: 14.2, isUp: true },
  { id: '2', crop: 'Bellary Onion', mandi: 'Mandya APMC', price: 2650, shift: 18.5, isUp: true },
  { id: '3', crop: 'Organic Ragi', mandi: 'Kolar APMC', price: 3450, shift: 2.1, isUp: true },
  { id: '4', crop: 'Yellow Maize', mandi: 'Doddaballapura', price: 2050, shift: -3.8, isUp: false },
  { id: '5', crop: 'Byadagi Chilli', mandi: 'Hubballi APMC', price: 14200, shift: 6.4, isUp: true },
  { id: '6', crop: 'Jyoti Potato', mandi: 'Belagavi APMC', price: 1850, shift: -5.2, isUp: false }
]

const INITIAL_LOGS = [
  { id: 'l1', time: '14:32:01', event: 'MANDI_PRICE_UPDATE', payload: '{"mandi":"Hassan","crop":"Tomato","rate":2200,"shift":14.2}' },
  { id: 'l2', time: '14:31:45', event: 'BID_PLACED_EVENT', payload: '{"lotId":"LOT-KA-HSN-101","bidder":"KA Agro","amount":2150}' },
  { id: 'l3', time: '14:30:12', event: 'WEIGHBRIDGE_SCALE_PULSE', payload: '{"mandi":"Yeshwanthpur","scale":"WB-01","gross":24850}' },
  { id: 'l4', time: '14:28:50', event: 'ESCROW_LOCK_CONFIRMED', payload: '{"orderId":"ORD-KA-9912","lockedAmount":264000}' }
]

export const LiveTickerBridge = () => {
  const [tickerItems, setTickerItems] = useState(DEFAULT_TICKER_FEED)
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [logs, setLogs] = useState(INITIAL_LOGS)
  const [isConnected, setIsConnected] = useState(true)
  const [latency, setLatency] = useState(24)

  // Periodic simulated latency jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(22 + Math.random() * 6))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleSimulateEvent = () => {
    const crops = ['Tomato', 'Onion', 'Ragi', 'Maize', 'Chilli']
    const randomCrop = crops[Math.floor(Math.random() * crops.length)]
    const newPrice = Math.floor(1800 + Math.random() * 1500)
    
    const newLog = {
      id: `l-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      event: 'MANDI_PRICE_SURGE',
      payload: JSON.stringify({ crop: randomCrop, rate: newPrice, source: 'Agmarknet Karnataka' })
    }

    setLogs((prev) => [newLog, ...prev])
    toast.success(`Live WebSocket Event Ingested: ${randomCrop} @ ₹${newPrice}/Qtl ⚡`)
  }

  const handleCopyPayload = (payload) => {
    navigator.clipboard.writeText(payload)
    toast.success('Raw WebSocket payload copied!')
  }

  return (
    <>
      {/* 1. Universal Top Marquee Strip */}
      <div className="w-full bg-slate-950 text-white border-b border-slate-800 py-1.5 px-4 text-xs flex items-center justify-between overflow-hidden">
        
        {/* Left: Socket Live Badge */}
        <button
          onClick={() => setShowDiagnostics(true)}
          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors font-mono text-[10px] font-bold shrink-0 mr-4 group"
          title="Click to view WebSocket Telemetry & Diagnostics"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>SOCKET LIVE • {latency}ms</span>
          <Activity className="w-3 h-3 group-hover:rotate-45 transition-transform" />
        </button>

        {/* Center: Live Scrolling Ticker Content */}
        <div className="flex-1 overflow-hidden relative">
          <div className="flex items-center gap-6 animate-marquee whitespace-nowrap">
            {tickerItems.concat(tickerItems).map((item, idx) => (
              <div key={idx} className="inline-flex items-center gap-2 text-[11px] shrink-0 font-medium">
                <span className="text-slate-400 font-semibold">{item.mandi}:</span>
                <span className="text-white font-bold">{item.crop}</span>
                <span className="font-mono font-bold text-amber-300">₹{item.price.toLocaleString('en-IN')}/Qtl</span>
                <span className={`font-mono text-[10px] font-bold flex items-center ${
                  item.isUp ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {item.isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {item.isUp ? `+${item.shift}%` : `${item.shift}%`}
                </span>
                <span className="text-slate-600">|</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Action */}
        <button
          onClick={() => setShowDiagnostics(true)}
          className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors shrink-0 ml-4 font-mono font-semibold"
        >
          <Terminal className="w-3 h-3" />
          <span>Diagnostics</span>
        </button>
      </div>

      {/* 2. WebSocket Telemetry & Diagnostics Modal */}
      {showDiagnostics && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col justify-between overflow-hidden shadow-2xl">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-foreground">
                      WebSocket Event Telemetry & Diagnostics
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-mono font-bold border border-emerald-500/20">
                      CONNECTED 🟢
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    wss://krishisetu.in/socket.io • Engine.IO v4 Protocol
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDiagnostics(false)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Telemetry Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Roundtrip Latency</span>
                  <p className="text-xl font-black text-emerald-600">{latency} ms</p>
                  <span className="text-[9px] text-muted-foreground">Jitter: 1.2ms</span>
                </div>

                <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Transport Layer</span>
                  <p className="text-xl font-black text-purple-600">WebSocket</p>
                  <span className="text-[9px] text-muted-foreground">Upgrade: HTTP/1.1</span>
                </div>

                <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Packet Loss</span>
                  <p className="text-xl font-black text-foreground">0.00%</p>
                  <span className="text-[9px] text-emerald-600 font-bold">Optimal Stream 🟢</span>
                </div>

                <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Heartbeat Interval</span>
                  <p className="text-xl font-black text-foreground">25,000 ms</p>
                  <span className="text-[9px] text-muted-foreground">Ping/Pong Sync</span>
                </div>
              </div>

              {/* Channel Subscriptions */}
              <div className="space-y-2">
                <span className="font-bold text-foreground uppercase tracking-wider text-[10px]">
                  Active Channel Subscriptions:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-xl bg-card border border-border flex items-center justify-between">
                    <span className="text-purple-600 font-bold">/mandi/prices/karnataka</span>
                    <span className="text-emerald-600 font-bold text-[10px]">SUBSCRIBED 🟢</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-card border border-border flex items-center justify-between">
                    <span className="text-purple-600 font-bold">/auctions/live/bids</span>
                    <span className="text-emerald-600 font-bold text-[10px]">SUBSCRIBED 🟢</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-card border border-border flex items-center justify-between">
                    <span className="text-purple-600 font-bold">/escrow/events</span>
                    <span className="text-emerald-600 font-bold text-[10px]">SUBSCRIBED 🟢</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-card border border-border flex items-center justify-between">
                    <span className="text-purple-600 font-bold">/yard/weighbridge/telemetry</span>
                    <span className="text-emerald-600 font-bold text-[10px]">SUBSCRIBED 🟢</span>
                  </div>
                </div>
              </div>

              {/* Raw Event Stream Frame Logs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-purple-600" /> Inbound WebSocket Frame Log
                  </span>
                  <button
                    onClick={() => setLogs([])}
                    className="text-[10px] text-muted-foreground hover:text-foreground font-semibold"
                  >
                    Clear Logs
                  </button>
                </div>

                <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3 max-h-48 overflow-y-auto space-y-2 font-mono text-[11px] text-slate-300">
                  {logs.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">No events logged yet. Trigger simulation below.</p>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-2">
                        <div className="space-y-0.5 overflow-hidden">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-[10px]">{log.time}</span>
                            <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 text-[9px] font-bold">
                              {log.event}
                            </span>
                          </div>
                          <p className="text-slate-300 truncate text-[10px]">{log.payload}</p>
                        </div>

                        <button
                          onClick={() => handleCopyPayload(log.payload)}
                          className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Copy payload"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-border bg-card flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground font-medium">
                Testing realtime bidirectional telemetry
              </span>

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  onClick={handleSimulateEvent}
                  className="rounded-xl text-xs font-bold h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white shadow-md flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4" />
                  <span>Simulate Inbound Event ⚡</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default LiveTickerBridge
