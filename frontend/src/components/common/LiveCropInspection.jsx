import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Camera, 
  Sun, 
  ShieldCheck, 
  Sparkles, 
  Maximize2, 
  PhoneOff, 
  Gavel, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  X, 
  Sprout, 
  Briefcase,
  Layers,
  Zap,
  MapPin
} from 'lucide-react'

export const LiveCropInspection = ({ 
  isOpen, 
  onClose, 
  crop = {
    title: 'Grade-A Fresh Hybrid Tomato',
    farmerName: 'Ramesh Gowda',
    location: 'Belur Village, Hassan',
    quantity: '120 Quintals',
    price: 2200,
    lotId: 'LOT-KA-HSN-101'
  },
  onProceedToBid
}) => {
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isFlashlightOn, setIsFlashlightOn] = useState(false)
  const [aiAssayEnabled, setAiAssayEnabled] = useState(true)
  const [streamQuality, setStreamQuality] = useState('1080p HD • 60 FPS')
  const [snapshotTaken, setSnapshotTaken] = useState(false)
  const [callDuration, setCallDuration] = useState(0)

  useEffect(() => {
    let timer
    if (isOpen) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    } else {
      setCallDuration(0)
    }
    return () => clearInterval(timer)
  }, [isOpen])

  if (!isOpen) return null

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleTakeSnapshot = () => {
    setSnapshotTaken(true)
    toast.success('HD Inspection Snapshot captured & attached to APMC trade audit trail! 📸')
    setTimeout(() => setSnapshotTaken(false), 2000)
  }

  const handleEndCall = () => {
    toast.success('Live Video Inspection session completed.')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col justify-between overflow-hidden shadow-2xl relative text-white">
        
        {/* 1. Top HUD Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  Live Farm-Gate Video Inspection
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                  LIVE {formatDuration(callDuration)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>{crop.title}</span> • 
                <span className="font-mono text-emerald-400">{crop.lotId}</span> • 
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>{crop.location}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAiAssayEnabled(!aiAssayEnabled)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                aiAssayEnabled
                  ? 'bg-purple-600 text-white border-purple-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Assay HUD {aiAssayEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Main Live Stream Canvas */}
        <div className="flex-1 relative bg-slate-900 overflow-hidden flex items-center justify-center">
          
          {/* Simulated HD Farmer Camera Feed */}
          {isVideoOn ? (
            <div className="relative w-full h-full bg-gradient-to-br from-emerald-950/40 via-slate-900 to-black flex items-center justify-center">
              
              {/* Live Video Simulation Graphic */}
              <div className="text-center space-y-3 p-6 max-w-md">
                <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-2xl shadow-emerald-500/10">
                  <Sprout className="w-12 h-12 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-lg text-white">Farmer Ramesh Gowda is presenting harvest</p>
                  <p className="text-xs text-slate-400">
                    Live WebRTC stream transmitting from Belur, Hassan Field • 38ms latency
                  </p>
                </div>
              </div>

              {/* AI Real-Time Computer Vision Assay Overlay Boxes */}
              {aiAssayEnabled && (
                <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                  
                  {/* Top Overlay Badges */}
                  <div className="flex justify-between items-start">
                    <div className="p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-slate-800 space-y-1 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> AI QUALITY ASSAY: GRADE-A
                      </div>
                      <p className="text-slate-300">Surface Defect Ratio: <span className="text-emerald-400 font-bold">1.8% (Minimal)</span></p>
                      <p className="text-slate-300">Ripeness Uniformity: <span className="text-emerald-400 font-bold">94.2%</span></p>
                      <p className="text-slate-300">Estimated Brix Sweetness: <span className="text-amber-400 font-bold">5.4° Bx</span></p>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-slate-800 space-y-1 font-mono text-[11px] text-right">
                      <p className="text-slate-400">GPS: 13.1624° N, 75.8611° E</p>
                      <p className="text-emerald-400 font-bold">Bhoomi RTC Matched #RTC-HSN-88192</p>
                      <p className="text-slate-400">{streamQuality}</p>
                    </div>
                  </div>

                  {/* Center AI Target Bounding Box */}
                  <div className="self-center w-72 h-72 border-2 border-dashed border-emerald-400/60 rounded-3xl relative flex items-center justify-center animate-pulse">
                    <span className="absolute top-2 left-3 px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-black font-mono">
                      TOMATO CRATE LOT #101
                    </span>
                    <span className="text-xs font-mono text-emerald-400/80 font-bold">
                      Color Index: 92% Deep Crimson Red
                    </span>
                  </div>

                  {/* Bottom Strip */}
                  <div className="flex justify-between items-end">
                    <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>Transmitting from 5G Rural Broadband Node</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 font-mono text-xs text-right">
                      <span className="text-[10px] text-emerald-300 block font-bold">CURRENT APMC BENCHMARK</span>
                      <p className="font-black text-sm text-emerald-400">₹{crop.price}/Qtl (Reserve: ₹2,000)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Picture-in-Picture Trader Window */}
              <div className="absolute top-6 right-6 w-36 sm:w-44 h-28 sm:h-32 rounded-2xl bg-slate-950/90 border-2 border-slate-700 shadow-2xl overflow-hidden flex flex-col justify-between p-2.5 z-20">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>Procurement View</span>
                  <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-center">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs mx-auto mb-1">
                    TR
                  </div>
                  <p className="text-[10px] font-bold text-white truncate">KA Agro Traders</p>
                </div>
                <span className="text-[8px] font-mono text-slate-500 text-center">Bengaluru APMC</span>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <VideoOff className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-400">Video feed paused</p>
            </div>
          )}
        </div>

        {/* 3. Bottom Control Dock */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
          
          {/* Audio / Video Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setIsMicOn(!isMicOn)
                toast.success(isMicOn ? 'Microphone muted' : 'Microphone unmuted')
              }}
              className={`p-3 rounded-2xl border transition-all ${
                isMicOn
                  ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
              }`}
              title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                setIsVideoOn(!isVideoOn)
                toast.success(isVideoOn ? 'Camera disabled' : 'Camera enabled')
              }}
              className={`p-3 rounded-2xl border transition-all ${
                isVideoOn
                  ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
              }`}
              title={isVideoOn ? 'Turn Off Video' : 'Turn On Video'}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                setIsFlashlightOn(!isFlashlightOn)
                toast.success(isFlashlightOn ? 'Field torch light off' : 'HD Field torch light activated')
              }}
              className={`p-3 rounded-2xl border transition-all ${
                isFlashlightOn
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Field Spotlight"
            >
              <Sun className="w-5 h-5" />
            </button>

            <button
              onClick={handleTakeSnapshot}
              className="p-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
              title="Capture Inspection Snapshot"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>

          {/* Instant Bidding Direct Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              onClick={() => {
                if (onProceedToBid) {
                  onProceedToBid(crop)
                }
                onClose()
              }}
              className="rounded-2xl font-black text-xs h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              <Gavel className="w-4 h-4" />
              <span>Confirm Quality & Place Bid 🔨</span>
            </Button>

            <Button
              onClick={handleEndCall}
              className="rounded-2xl font-bold text-xs h-12 px-5 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20 flex items-center gap-1.5"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Inspection</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveCropInspection
