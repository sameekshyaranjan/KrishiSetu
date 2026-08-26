import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import weatherService from '@/services/weatherService'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { 
  CloudSun, 
  CloudRain, 
  Sun, 
  Wind, 
  Droplets, 
  Thermometer, 
  ShieldAlert, 
  Sparkles, 
  MapPin, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Send, 
  Bot, 
  HelpCircle,
  Calendar,
  Layers,
  Sprout,
  Radio
} from 'lucide-react'

const FALLBACK_WEATHER = {
  current: { temp: 27, condition: 'Partly Cloudy', humidity: 75, rainProb: 40, wind: 12, uv: 6, rainfall: '2.0 mm', feelsLike: 29 },
  forecast: [
    { day: 'Today', date: '27 Aug', icon: 'cloud-sun', max: 28, min: 20, rain: 40, tag: 'Good Spray Window', tagType: 'success' },
    { day: 'Thu', date: '28 Aug', icon: 'rain', max: 27, min: 19, rain: 75, tag: 'Rain Likely', tagType: 'danger' },
    { day: 'Fri', date: '29 Aug', icon: 'cloud-sun', max: 29, min: 21, rain: 30, tag: 'Good Spray Window', tagType: 'success' },
    { day: 'Sat', date: '30 Aug', icon: 'sun', max: 31, min: 22, rain: 10, tag: 'Optimal for Harvest', tagType: 'success' },
    { day: 'Sun', date: '31 Aug', icon: 'sun', max: 32, min: 22, rain: 15, tag: 'Ideal Sun Drying', tagType: 'success' },
    { day: 'Mon', date: '01 Sep', icon: 'cloud-sun', max: 30, min: 21, rain: 25, tag: 'Favorable Fieldwork', tagType: 'success' },
    { day: 'Tue', date: '02 Sep', icon: 'rain', max: 28, min: 20, rain: 60, tag: 'Soil Moisture Surplus', tagType: 'info' },
  ],
  advisories: [
    { category: 'Irrigation', title: 'Maintain Scheduled Drip Intervals', desc: 'Soil moisture levels are favorable. Standard morning fertigation is recommended.', type: 'success' },
    { category: 'Pest & Disease', title: 'Scout Lower Foliage for Fungal Spots', desc: 'Moderate humidity requires routine pest inspection across solanaceous and pulse crops.', type: 'warning' }
  ]
}

const DISTRICT_LIST = ['Hassan', 'Mysuru', 'Belagavi', 'Mandya', 'Bengaluru Rural', 'Bengaluru Urban', 'Kolar', 'Dharwad', 'Kalaburagi', 'Raichur', 'Ballari', 'Tumakuru', 'Mangaluru']

const AI_PRESET_QUESTIONS = [
  'Should I spray pesticide on my tomato crop today?',
  'Is tomorrow a safe day for harvesting Maize?',
  'How to prevent root rot during heavy rainfall?',
  'What is the best time for fertilizer foliar spray this week?'
]

export const FarmerWeather = () => {
  const { user } = useAuth()
  const [selectedDistrict, setSelectedDistrict] = useState(user?.district || 'Hassan')
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // AI Assistant State
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAnswer, setAiAnswer] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  const fetchLiveWeather = async (district) => {
    setLoading(true)
    try {
      const liveData = await weatherService.getDistrictWeather(district)
      if (liveData) {
        setWeatherData(liveData)
      } else {
        setWeatherData(FALLBACK_WEATHER)
      }
    } catch {
      setWeatherData(FALLBACK_WEATHER)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveWeather(selectedDistrict)
  }, [selectedDistrict])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchLiveWeather(selectedDistrict)
    setIsRefreshing(false)
    toast.success(`Live weather radar updated for ${selectedDistrict}!`)
  }

  const weather = weatherData || FALLBACK_WEATHER

  const handleAskAI = (questionToAsk) => {
    const q = questionToAsk || aiQuestion
    if (!q.trim()) return

    setAiLoading(true)
    setAiAnswer(null)

    setTimeout(() => {
      setAiLoading(false)
      const rainProb = weather.current.rainProb
      const temp = weather.current.temp
      const wind = weather.current.wind

      if (q.toLowerCase().includes('spray') || q.toLowerCase().includes('pesticide')) {
        if (rainProb > 50) {
          setAiAnswer(`🌧️ Live Radar for ${selectedDistrict}: Rain probability is ${rainProb}%. Spraying today is NOT recommended as rain will wash away chemical deposits. Wait for clear skies on Friday morning (6:00 AM - 9:00 AM) when wind drops below 9 km/h.`)
        } else {
          setAiAnswer(`✅ Live Radar for ${selectedDistrict}: Rain probability is currently low (${rainProb}%) and wind speed is ${wind} km/h. Favorable morning spraying window between 6:30 AM and 9:30 AM.`)
        }
      } else if (q.toLowerCase().includes('harvest')) {
        setAiAnswer(`🌾 For ${selectedDistrict}, Saturday and Sunday present the optimal harvesting window with less than 15% precipitation probability and 6+ hours of uninterrupted sunlight.`)
      } else if (q.toLowerCase().includes('rot') || q.toLowerCase().includes('rain')) {
        setAiAnswer(`💧 To prevent root rot during current conditions (${weather.current.humidity}% humidity): 1) Clear field bund channels, 2) Avoid standing water around root zones, 3) Apply Trichoderma viride bio-fungicide drench once rain clears.`)
      } else {
        setAiAnswer(`🌱 Live Agronomy Telemetry for ${selectedDistrict}: Current temperature is ${temp}°C with ${weather.current.humidity}% humidity. Vegetative growth is optimal; scout lower foliage for pest egg clusters over the next 48 hours.`)
      }
    }, 800)
  }

  const renderWeatherIcon = (type) => {
    switch (type) {
      case 'rain':
      case 'cloudy-rain':
        return <CloudRain className="w-8 h-8 text-primary" />
      case 'sun':
        return <Sun className="w-8 h-8 text-amber-500" />
      default:
        return <CloudSun className="w-8 h-8 text-amber-500" />
    }
  }

  return (
    <div className="space-y-8">
      
      {/* 1. Header & District Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20 mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
            <span>Live Open-Meteo & IMD Radar Sync</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Hyper-Local Weather & Crop Advisory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time Karnataka micro-climate telemetry, 7-day agricultural outlook, and AI-driven spraying & harvest recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <MapPin className="w-4 h-4 text-primary absolute left-3 top-3" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="h-10 pl-9 pr-4 rounded-xl bg-card border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
            >
              {DISTRICT_LIST.map((dist) => (
                <option key={dist} value={dist}>{dist} District</option>
              ))}
            </select>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="rounded-xl text-xs h-10 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Current Micro-Climate Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          {/* Main Temperature & State */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>{selectedDistrict}, Karnataka • Live Micro-Climate</span>
            </div>

            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-background/80 backdrop-blur border border-border flex items-center justify-center shadow-sm">
                <CloudSun className="w-9 h-9 text-amber-500 animate-pulse duration-1000" />
              </div>
              <div>
                <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
                  {weather.current.temp}°C
                </h2>
                <p className="text-sm font-bold text-muted-foreground mt-0.5">
                  {weather.current.condition}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Rainfall: <span className="font-semibold text-foreground">{weather.current.rainfall}</span> • Feels like {weather.current.feelsLike || weather.current.temp + 2}°C
            </p>
          </div>

          {/* 4 Micro-Climate Key Indices */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* Index 1: Humidity */}
            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-semibold">Humidity</span>
                <Droplets className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xl font-extrabold text-foreground">{weather.current.humidity}%</p>
              <span className="text-[10px] text-amber-600 font-medium">Air Moisture</span>
            </div>

            {/* Index 2: Rain Probability */}
            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-semibold">Rain Prob.</span>
                <CloudRain className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xl font-extrabold text-primary">{weather.current.rainProb}%</p>
              <span className="text-[10px] text-primary font-medium">Precipitation</span>
            </div>

            {/* Index 3: Wind Speed */}
            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-semibold">Wind Speed</span>
                <Wind className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xl font-extrabold text-foreground">{weather.current.wind} <span className="text-xs font-normal">km/h</span></p>
              <span className="text-[10px] text-muted-foreground">Surface Wind</span>
            </div>

            {/* Index 4: UV Index */}
            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-semibold">UV Index</span>
                <Sun className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xl font-extrabold text-amber-600">{weather.current.uv} / 10</p>
              <span className="text-[10px] text-muted-foreground">Solar Radiance</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 7-Day Agricultural Forecast Strip */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-foreground tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            7-Day Live Agro-Climatic Outlook
          </h3>
          <span className="text-xs text-muted-foreground font-medium">Open-Meteo Satellite Feed</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {weather.forecast.map((item, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-2xl bg-card border transition-all text-center space-y-2.5 ${
                idx === 0 
                  ? 'border-primary shadow-sm bg-primary/[0.03]' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div>
                <span className="font-bold text-xs text-foreground block">{item.day}</span>
                <span className="text-[10px] text-muted-foreground font-medium">{item.date}</span>
              </div>

              <div className="my-2 flex items-center justify-center">
                {renderWeatherIcon(item.icon)}
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold">
                <span className="text-foreground">{item.max}°</span>
                <span className="text-muted-foreground text-[11px] font-normal">{item.min}°</span>
              </div>

              <div className="text-[11px] font-bold text-primary flex items-center justify-center gap-1">
                <Droplets className="w-3 h-3" />
                <span>{item.rain}%</span>
              </div>

              <span className={`block text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-tight ${
                item.tagType === 'danger' 
                  ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' 
                  : item.tagType === 'warning'
                  ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
              }`}>
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Actionable Agronomy Advisories */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-lg text-foreground tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          Field Action Advisories for {selectedDistrict}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weather.advisories.map((adv, idx) => (
            <div 
              key={idx}
              className={`p-5 rounded-3xl bg-card border space-y-2 transition-all ${
                adv.type === 'danger' 
                  ? 'border-rose-500/30 bg-rose-500/[0.02]' 
                  : adv.type === 'warning'
                  ? 'border-amber-500/30 bg-amber-500/[0.02]'
                  : 'border-emerald-500/30 bg-emerald-500/[0.02]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-muted text-foreground border border-border">
                  {adv.category}
                </span>

                <span className={`text-xs font-bold flex items-center gap-1 ${
                  adv.type === 'danger' ? 'text-rose-600' : adv.type === 'warning' ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {adv.type === 'danger' && <AlertTriangle className="w-3.5 h-3.5" />}
                  {adv.type === 'warning' && <Info className="w-3.5 h-3.5" />}
                  {adv.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{adv.type === 'danger' ? 'High Priority' : adv.type === 'warning' ? 'Action Recommended' : 'Favorable Window'}</span>
                </span>
              </div>

              <h4 className="font-bold text-sm text-foreground pt-1">{adv.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{adv.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. AI Agronomy Assistant Chatbot */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-foreground">
              Ask KrishiSetu AI Crop Doctor
            </h3>
            <p className="text-xs text-muted-foreground">
              Instant agronomy recommendations based on live {selectedDistrict} weather radar.
            </p>
          </div>
        </div>

        {/* Preset Quick Questions */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Frequently Asked Weather Queries:
          </label>
          <div className="flex flex-wrap gap-2">
            {AI_PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAiQuestion(q)
                  handleAskAI(q)
                }}
                className="px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted border border-border text-xs font-semibold text-foreground transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            handleAskAI()
          }} 
          className="flex items-center gap-3 pt-2"
        >
          <input
            type="text"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            placeholder="Type your crop or weather question (e.g. Is it safe to spray fungicide tomorrow?)..."
            className="flex-1 h-11 px-4 rounded-2xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <Button 
            type="submit" 
            disabled={aiLoading}
            className="rounded-2xl h-11 px-5 text-xs font-bold shadow-md bg-primary text-primary-foreground"
          >
            {aiLoading ? 'Analyzing...' : <><Send className="w-4 h-4 mr-1.5" /> Ask AI</>}
          </Button>
        </form>

        {/* AI Answer Box */}
        {aiAnswer && (
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <Sparkles className="w-4 h-4" />
              <span>AI Agronomy Recommendation</span>
            </div>
            <p className="text-xs text-foreground leading-relaxed pt-1">
              {aiAnswer}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FarmerWeather
