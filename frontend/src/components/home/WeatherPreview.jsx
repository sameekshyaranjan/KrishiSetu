import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CloudSun,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Gauge,
  Compass,
  Radio,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import AnimatedCounter from '@/components/common/AnimatedCounter'
import ScrollPop from '@/components/common/ScrollPop'

// Sourced directly from FarmerWeather.jsx & weatherService.js
const DISTRICT_WEATHER = {
  Kolar: {
    district: 'Kolar',
    current: {
      temp: 27,
      condition: 'Partly Cloudy',
      rainfall: '0.0 mm',
      feelsLike: 28,
      humidity: 68,
      rainProb: 20,
      wind: 12,
      pressure: 1012,
    },
    advisory: {
      category: 'Spraying & Crop Protection',
      title: 'Optimal Spray Window Open Until 15:00',
      desc: 'Moderate transpiration and light winds (<12 km/h) favor even droplet coverage on Solanaceous crops.',
      type: 'success',
    },
    forecast: [
      { day: 'Today', max: 29, min: 21, rain: 20, icon: 'cloud-sun', tag: 'Good Spray Window', tagType: 'success' },
      { day: 'Tomorrow', max: 28, min: 21, rain: 35, icon: 'cloud-sun', tag: 'Mild Cloud Cover', tagType: 'success' },
      { day: 'Sun', max: 27, min: 20, rain: 60, icon: 'rain', tag: 'Rain Approaching', tagType: 'warning' },
      { day: 'Mon', max: 28, min: 21, rain: 25, icon: 'sun', tag: 'Harvest Window', tagType: 'success' },
      { day: 'Tue', max: 30, min: 22, rain: 15, icon: 'sun', tag: 'Optimal Transit', tagType: 'success' },
    ],
  },
  Hassan: {
    district: 'Hassan',
    current: {
      temp: 24,
      condition: 'Overcast & Drizzle',
      rainfall: '2.4 mm',
      feelsLike: 25,
      humidity: 86,
      rainProb: 72,
      wind: 9,
      pressure: 1010,
    },
    advisory: {
      category: 'Pest & Fungal Alert',
      title: 'Blight Risk High — Postpone Chemical Spraying',
      desc: 'High relative moisture (>85%) promotes fungal germination. Move harvested potato & tomato lots into covered storage.',
      type: 'warning',
    },
    forecast: [
      { day: 'Today', max: 25, min: 19, rain: 72, icon: 'rain', tag: 'Hold Spraying', tagType: 'warning' },
      { day: 'Tomorrow', max: 24, min: 19, rain: 85, icon: 'rain', tag: 'Waterlogging Risk', tagType: 'danger' },
      { day: 'Sun', max: 25, min: 20, rain: 65, icon: 'rain', tag: 'Fungal Spot Check', tagType: 'warning' },
      { day: 'Mon', max: 27, min: 20, rain: 30, icon: 'cloud-sun', tag: 'Improving Skies', tagType: 'success' },
      { day: 'Tue', max: 28, min: 21, rain: 20, icon: 'sun', tag: 'Fieldwork Resumes', tagType: 'success' },
    ],
  },
  Mandya: {
    district: 'Mandya',
    current: {
      temp: 30,
      condition: 'Clear Sunlight',
      rainfall: '0.0 mm',
      feelsLike: 32,
      humidity: 54,
      rainProb: 8,
      wind: 15,
      pressure: 1014,
    },
    advisory: {
      category: 'Harvest & Grain Drying',
      title: 'Optimal Harvest Peak — Prioritize Threshing',
      desc: 'Very low rain probability (<10%) and strong sun drying index. Excellent window for ragi, sugarcane, and paddy dispatch.',
      type: 'success',
    },
    forecast: [
      { day: 'Today', max: 32, min: 22, rain: 8, icon: 'sun', tag: 'Harvest Peak', tagType: 'success' },
      { day: 'Tomorrow', max: 31, min: 22, rain: 12, icon: 'sun', tag: 'Sun Drying Clear', tagType: 'success' },
      { day: 'Sun', max: 30, min: 21, rain: 15, icon: 'cloud-sun', tag: 'Dry Transport', tagType: 'success' },
      { day: 'Mon', max: 29, min: 21, rain: 30, icon: 'cloud-sun', tag: 'Drip Scheduled', tagType: 'success' },
      { day: 'Tue', max: 29, min: 21, rain: 40, icon: 'cloud-sun', tag: 'Check Soil Moisture', tagType: 'warning' },
    ],
  },
  Belagavi: {
    district: 'Belagavi',
    current: {
      temp: 23,
      condition: 'Heavy Cloudburst Alert',
      rainfall: '8.2 mm',
      feelsLike: 23,
      humidity: 91,
      rainProb: 88,
      wind: 21,
      pressure: 1008,
    },
    advisory: {
      category: 'Drainage & Transit Danger',
      title: 'Covered Vehicle Required — Avoid Open Dispatch',
      desc: 'Active crosswinds and heavy rainfall likely through evening. Ensure field drainage channels are cleared to prevent root suffocation.',
      type: 'danger',
    },
    forecast: [
      { day: 'Today', max: 24, min: 18, rain: 88, icon: 'rain', tag: 'Covered Transit Only', tagType: 'danger' },
      { day: 'Tomorrow', max: 23, min: 18, rain: 80, icon: 'rain', tag: 'High Humidity Delay', tagType: 'danger' },
      { day: 'Sun', max: 24, min: 19, rain: 55, icon: 'rain', tag: 'Pre-Weighing Check', tagType: 'warning' },
      { day: 'Mon', max: 26, min: 20, rain: 35, icon: 'cloud-sun', tag: 'Clearing Window', tagType: 'warning' },
      { day: 'Tue', max: 28, min: 21, rain: 20, icon: 'sun', tag: 'Normal Dispatch', tagType: 'success' },
    ],
  },
}

const DISTRICT_KEYS = ['Kolar', 'Hassan', 'Mandya', 'Belagavi']

export const WeatherPreview = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('Kolar')
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [aiQuestion, setAiQuestion] = useState(null)
  const [gpsLocked, setGpsLocked] = useState(false)

  const weather = DISTRICT_WEATHER[selectedDistrict]
  const currentDay = weather.forecast[selectedDayIndex] || weather.forecast[0]

  const handleGpsClick = () => {
    setGpsLocked(true)
    setTimeout(() => setGpsLocked(false), 3500)
  }

  const renderWeatherIcon = (type, className = 'size-8') => {
    if (type === 'rain') return <CloudRain className={`${className} text-sky-500`} />
    if (type === 'sun') return <Sun className={`${className} text-amber-500`} />
    return <CloudSun className={`${className} text-amber-500`} />
  }

  return (
    <section id="weather" className="bg-surface-strong py-16 lg:py-24 text-surface-strong-foreground border-b border-border">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        
        {/* Header with authentic Radar Telemetry Pill */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-primary-foreground/15 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-emerald-500/15 text-emerald-300 text-[10px] font-bold border border-emerald-500/25 mb-3">
              <Radio className="size-3 text-emerald-400 animate-pulse" />
              <span>Open-Meteo & IMD Live Karnataka Radar Telemetry</span>
            </div>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl text-surface-strong-foreground">
              Field weather that guides decisions.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-primary-foreground/75 max-w-xl">
              Real Karnataka micro-climate intelligence translating telemetry into immediate farm actions: when to spray, when to hold harvest, and when to dispatch produce.
            </p>
          </div>

          {/* Interactive District Location Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleGpsClick}
              className={`px-3 py-2 text-xs font-bold border rounded-sm flex items-center gap-1.5 transition-all ${
                gpsLocked
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-primary-foreground/10 text-surface-strong-foreground border-primary-foreground/20 hover:bg-primary-foreground/20'
              }`}
              title="Detect agro-climatic GPS"
            >
              <Compass className="size-3.5 text-trader" />
              <span>{gpsLocked ? 'GPS: 13.13° N, 78.13° E' : 'GPS Locate'}</span>
            </button>

            <div className="flex items-center gap-1 border border-primary-foreground/20 p-1 rounded-sm bg-primary-foreground/5">
              {DISTRICT_KEYS.map((dist) => (
                <button
                  key={dist}
                  onClick={() => {
                    setSelectedDistrict(dist)
                    setSelectedDayIndex(0)
                    setAiQuestion(null)
                  }}
                  className={`px-3 py-1.5 text-xs font-bold transition-all rounded-xs ${
                    selectedDistrict === dist
                      ? 'bg-trader text-trader-foreground shadow-xs'
                      : 'text-primary-foreground/70 hover:text-white'
                  }`}
                >
                  {dist}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Compact Authentic Feature Grid (Current Hero + 4 Indices + Advisory + Forecast) */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.15fr] items-start">
          
          {/* LEFT: Current Micro-Climate Hero & 4 Indices */}
          <div className="border border-primary-foreground/20 bg-card text-card-foreground p-6 rounded-sm shadow-xl space-y-6">
            
            <div className="flex items-start justify-between border-b border-border pb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  {weather.district} District · Live Radar Telemetry
                </span>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="font-display text-5xl sm:text-6xl text-foreground">
                    {weather.current.temp}°C
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Feels like {weather.current.feelsLike}°C
                  </span>
                </div>
                <p className="text-sm font-bold text-primary mt-1">
                  {weather.current.condition}
                </p>
              </div>

              <div className="grid size-16 place-items-center rounded-sm bg-secondary border border-border">
                {renderWeatherIcon(weather.forecast[0].icon, 'size-9')}
              </div>
            </div>

            {/* 4 Authentic Micro-Climate Key Indices from FarmerWeather.jsx */}
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Ground Telemetry Indices
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <ScrollPop delay={0} className="bg-secondary p-3 rounded-xs border border-border">
                  <span className="text-[9px] uppercase text-muted-foreground flex items-center justify-between">
                    Humidity <Droplets className="size-3 text-primary" />
                  </span>
                  <strong className="font-mono text-base text-foreground block mt-1">
                    <AnimatedCounter value={`${weather.current.humidity}%`} />
                  </strong>
                  <span className="text-[8px] text-muted-foreground">Relative moisture</span>
                </ScrollPop>

                <ScrollPop delay={80} className="bg-secondary p-3 rounded-xs border border-border">
                  <span className="text-[9px] uppercase text-muted-foreground flex items-center justify-between">
                    Precipitation <CloudRain className="size-3 text-sky-500" />
                  </span>
                  <strong className="font-mono text-base text-foreground block mt-1">
                    <AnimatedCounter value={`${weather.current.rainProb}%`} />
                  </strong>
                  <span className="text-[8px] text-muted-foreground">{weather.current.rainfall} radar</span>
                </ScrollPop>

                <ScrollPop delay={160} className="bg-secondary p-3 rounded-xs border border-border">
                  <span className="text-[9px] uppercase text-muted-foreground flex items-center justify-between">
                    Wind Velocity <Wind className="size-3 text-primary" />
                  </span>
                  <strong className="font-mono text-base text-foreground block mt-1">
                    <AnimatedCounter value={weather.current.wind} /> <small className="text-[10px] font-normal">km/h</small>
                  </strong>
                  <span className="text-[8px] text-muted-foreground">Anemometer</span>
                </ScrollPop>

                <ScrollPop delay={240} className="bg-secondary p-3 rounded-xs border border-border">
                  <span className="text-[9px] uppercase text-muted-foreground flex items-center justify-between">
                    Pressure <Gauge className="size-3 text-trader" />
                  </span>
                  <strong className="font-mono text-base text-foreground block mt-1">
                    <AnimatedCounter value={weather.current.pressure} /> <small className="text-[10px] font-normal">hPa</small>
                  </strong>
                  <span className="text-[8px] text-muted-foreground">Barometer</span>
                </ScrollPop>
              </div>
            </div>

            {/* Actionable Agronomy Advisory Panel */}
            <div className={`p-4 border-l-4 rounded-xs text-xs space-y-1 ${
              weather.advisory.type === 'success'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                : weather.advisory.type === 'warning'
                ? 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-200'
                : 'border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-200'
            }`}>
              <div className="flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-wider">
                {weather.advisory.type === 'success' && <CheckCircle2 className="size-3.5 text-emerald-600" />}
                {weather.advisory.type === 'warning' && <AlertTriangle className="size-3.5 text-amber-600" />}
                {weather.advisory.type === 'danger' && <ShieldAlert className="size-3.5 text-rose-600" />}
                <span>{weather.advisory.category}</span>
              </div>
              <p className="font-bold text-xs text-foreground">{weather.advisory.title}</p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">{weather.advisory.desc}</p>
            </div>

          </div>

          {/* RIGHT: Compact 5-Day Forecast Matrix & AI Agronomist Tester */}
          <div className="space-y-4">
            
            {/* 5-Day Interactive Agricultural Outlook */}
            <div className="border border-primary-foreground/20 bg-card text-card-foreground p-5 rounded-sm shadow-xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  5-Day Agronomy Decision Outlook
                </span>
                <span className="text-[9px] text-muted-foreground">
                  Select a day to inspect
                </span>
              </div>

              <div className="divide-y divide-border">
                {weather.forecast.map((fc, idx) => {
                  const isSelected = selectedDayIndex === idx
                  return (
                    <ScrollPop key={fc.day} delay={idx * 50}>
                      <button
                        onClick={() => setSelectedDayIndex(idx)}
                        className={`w-full py-3 px-2 flex items-center justify-between gap-3 text-left transition-colors rounded-xs ${
                          isSelected ? 'bg-muted' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-[90px]">
                          {renderWeatherIcon(fc.icon, 'size-5')}
                          <div>
                            <strong className="text-xs text-foreground block">{fc.day}</strong>
                            <span className="text-[9px] text-muted-foreground">
                              {fc.max}° / {fc.min}°C
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                          <CloudRain className="size-3 text-sky-500" />
                          <span>{fc.rain}%</span>
                        </div>

                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-xs border ${
                          fc.tagType === 'success'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : fc.tagType === 'warning'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                        }`}>
                          {fc.tag}
                        </span>
                      </button>
                    </ScrollPop>
                  )
                })}
              </div>

              {/* Selected Day Quick Inspector */}
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Selected: <strong className="text-foreground">{currentDay.day}</strong> ({currentDay.tag})</span>
                <span className="font-mono text-primary font-bold">Rain Risk: {currentDay.rain}%</span>
              </div>
            </div>

            {/* Interactive "Ask Agro AI" Micro-Tester */}
            <div className="border border-primary-foreground/20 bg-primary-foreground/5 p-4 rounded-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-surface-strong-foreground">
                <Sparkles className="size-3.5 text-trader" />
                <span>Simulate Farmer Advisory Inquiry</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setAiQuestion(
                    selectedDistrict === 'Kolar' || selectedDistrict === 'Mandya'
                      ? `✅ Safe to spray in ${selectedDistrict}: Rain probability is ${weather.current.rainProb}% with low wind (<15 km/h). Ideal window 06:30 AM to 09:30 AM.`
                      : `⚠️ Postpone spraying in ${selectedDistrict}: Rain probability is high (${weather.current.rainProb}%). Chemical wash-off expected.`
                  )}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-xs border border-primary-foreground/20 bg-card text-card-foreground hover:border-primary transition-all flex items-center gap-1 text-left"
                >
                  <HelpCircle className="size-3 text-primary" /> Should I spray today?
                </button>

                <button
                  onClick={() => setAiQuestion(
                    selectedDistrict === 'Mandya' || selectedDistrict === 'Kolar'
                      ? `🌾 Excellent harvest outlook for ${selectedDistrict}. Dry solar radiation index allows same-day field threshing and gate collection.`
                      : `🌧️ Delay open field harvesting in ${selectedDistrict}. Keep graded lots under moisture-sealed tarp or in cold storage.`
                  )}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-xs border border-primary-foreground/20 bg-card text-card-foreground hover:border-primary transition-all flex items-center gap-1 text-left"
                >
                  <HelpCircle className="size-3 text-primary" /> Harvest window outlook?
                </button>
              </div>

              {aiQuestion && (
                <div className="mt-2.5 p-3 rounded-xs bg-card text-card-foreground border border-primary/20 text-xs animate-in fade-in">
                  <p className="font-semibold text-primary text-[10px] uppercase">KrishiSetu Advisory Engine:</p>
                  <p className="mt-0.5 leading-relaxed">{aiQuestion}</p>
                </div>
              )}
            </div>

            {/* Portal CTA */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-primary-foreground/60">
                140+ Taluk weather stations integrated
              </span>
              <Button variant="outline" size="sm" asChild className="text-xs">
                <Link to="/register/farmer">
                  Access Full Radar <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}

export default WeatherPreview
