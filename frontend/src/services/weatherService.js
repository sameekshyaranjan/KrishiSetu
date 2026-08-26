import axios from 'axios'

/**
 * Karnataka Agro-Climatic District Geographic Coordinates
 */
const DISTRICT_COORDINATES = {
  'Hassan': { lat: 13.0033, lon: 76.1004 },
  'Mysuru': { lat: 12.2958, lon: 76.6394 },
  'Belagavi': { lat: 15.8497, lon: 74.4977 },
  'Mandya': { lat: 12.5244, lon: 76.8967 },
  'Bengaluru Rural': { lat: 13.2846, lon: 77.5855 },
  'Bengaluru Urban': { lat: 12.9716, lon: 77.5946 },
  'Kolar': { lat: 13.1367, lon: 78.1291 },
  'Dharwad': { lat: 15.4589, lon: 75.0078 },
  'Hubballi': { lat: 15.3647, lon: 75.1240 },
  'Kalaburagi': { lat: 17.3297, lon: 76.8343 },
  'Raichur': { lat: 16.2076, lon: 77.3463 },
  'Ballari': { lat: 15.1394, lon: 76.9214 },
  'Tumakuru': { lat: 13.3379, lon: 77.1173 },
  'Mangaluru': { lat: 12.9141, lon: 74.8560 }
}

/**
 * Interpret WMO Weather interpretation codes
 */
const decodeWmoWeather = (code) => {
  if (code === 0) return { condition: 'Clear Sky / Sunny', icon: 'sun', suitability: 'Optimal for Harvest', tagType: 'success' }
  if (code >= 1 && code <= 3) return { condition: 'Partly Cloudy', icon: 'cloud-sun', suitability: 'Good Spray Window', tagType: 'success' }
  if (code >= 45 && code <= 48) return { condition: 'Fog & Dew', icon: 'cloud-sun', suitability: 'Morning Moisture High', tagType: 'warning' }
  if (code >= 51 && code <= 67) return { condition: 'Rain Showers', icon: 'rain', suitability: 'High Fungal Risk', tagType: 'danger' }
  if (code >= 71 && code <= 77) return { condition: 'Hail / Cold Wind', icon: 'rain', suitability: 'Protect Nursery', tagType: 'danger' }
  if (code >= 80 && code <= 82) return { condition: 'Heavy Showers', icon: 'rain', suitability: 'Waterlogging Alert', tagType: 'danger' }
  if (code >= 95) return { condition: 'Thunderstorm', icon: 'rain', suitability: 'Suspend All Spraying', tagType: 'danger' }
  return { condition: 'Moderate Weather', icon: 'cloud-sun', suitability: 'Favorable Fieldwork', tagType: 'success' }
}

export const weatherService = {
  /**
   * Fetch Live Real-Time Weather & 7-Day Forecast from Open-Meteo
   */
  getDistrictWeather: async (district = 'Hassan') => {
    const coords = DISTRICT_COORDINATES[district] || DISTRICT_COORDINATES['Hassan']
    
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FKolkata`
      
      const response = await axios.get(url, { timeout: 8000 })
      const data = response.data

      const currentWmo = decodeWmoWeather(data.current.weather_code)

      // Transform 7-day daily forecast
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const forecast = data.daily.time.slice(0, 7).map((dateStr, idx) => {
        const dateObj = new Date(dateStr)
        const dayName = idx === 0 ? 'Today' : daysOfWeek[dateObj.getDay()]
        const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
        const wmo = decodeWmoWeather(data.daily.weather_code[idx])

        return {
          day: dayName,
          date: formattedDate,
          icon: wmo.icon,
          max: Math.round(data.daily.temperature_2m_max[idx]),
          min: Math.round(data.daily.temperature_2m_min[idx]),
          rain: data.daily.precipitation_probability_max[idx] || 15,
          tag: wmo.suitability,
          tagType: wmo.tagType
        }
      })

      // Generate dynamic agronomy advisories based on real telemetry
      const rainProb = forecast[0]?.rain || 20
      const humidity = data.current.relative_humidity_2m
      const wind = Math.round(data.current.wind_speed_10m)

      const advisories = []

      if (rainProb >= 60 || data.current.precipitation > 2) {
        advisories.push({
          category: 'Irrigation & Drainage',
          title: `Rainfall Likely (${rainProb}% Probability) — Suspend Irrigation`,
          desc: `Monsoon clouds over ${district}. Turn off drip valves to prevent root asphyxiation and clear bund drainage furrows.`,
          type: 'danger'
        })
      } else {
        advisories.push({
          category: 'Irrigation',
          title: 'Optimal Soil Moisture — Continue Regular Fertigation',
          desc: `Mild transpiration conditions in ${district}. Maintain standard morning drip schedules.`,
          type: 'success'
        })
      }

      if (humidity >= 75) {
        advisories.push({
          category: 'Pest & Fungal Alert',
          title: `High Humidity (${humidity}%) Favors Leaf Blight`,
          desc: `High moisture promotes spore growth. Inspect lower leaves for early blight and apply organic bio-fungicide (Trichoderma viride).`,
          type: 'warning'
        })
      }

      if (wind <= 10) {
        advisories.push({
          category: 'Spraying Window',
          title: `Calm Morning Wind (${wind} km/h) — Good Spray Window`,
          desc: `Minimal spray drift expected today. Ideal for foliar micronutrients and pest prevention between 6:30 AM - 9:30 AM.`,
          type: 'success'
        })
      } else {
        advisories.push({
          category: 'Spraying Advisory',
          title: `Moderate Wind Gusts (${wind} km/h) — Spray with Caution`,
          desc: `Wind speeds above 12 km/h cause chemical drift. Use low-drift nozzles and lower boom heights.`,
          type: 'warning'
        })
      }

      advisories.push({
        category: 'Harvest Window',
        title: 'Weekly Harvest Scheduling',
        desc: `Check the 7-day outlook for consecutive days with rain probability below 20% for drying produce before APMC dispatch.`,
        type: 'info'
      })

      return {
        isLive: true,
        source: 'Open-Meteo Live IMD Radar',
        current: {
          temp: Math.round(data.current.temperature_2m),
          condition: currentWmo.condition,
          humidity: data.current.relative_humidity_2m,
          rainProb: forecast[0]?.rain || 20,
          wind: Math.round(data.current.wind_speed_10m),
          uv: 6,
          rainfall: `${data.current.precipitation || 0} mm`,
          feelsLike: Math.round(data.current.apparent_temperature)
        },
        forecast,
        advisories
      }
    } catch (error) {
      console.warn('[WeatherService] Live fetch failed, using fallback:', error.message)
      return null
    }
  }
}

export default weatherService
