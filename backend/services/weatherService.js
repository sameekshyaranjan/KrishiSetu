const axios = require('axios');

/**
 * Evaluates weather data to determine agricultural risk level.
 * @param {Object} data - OpenWeatherMap current weather response
 * @returns {String} 'normal', 'watch', or 'warning'
 */
const evaluateRisk = (data) => {
  if (!data || !data.wind || !data.weather) return 'normal';

  // OpenWeatherMap wind speed is in m/s
  const windSpeedMs = data.wind.speed;
  const windSpeedKmh = windSpeedMs * 3.6; 
  
  // Rain data is usually inside data.rain['1h'] in mm
  const rainfallMm = data.rain ? (data.rain['1h'] || data.rain['3h'] || 0) : 0;
  
  // Check for severe conditions
  const hasThunderstorm = data.weather.some(w => w.main.toLowerCase() === 'thunderstorm');
  
  // Severe risk thresholds: 
  // - Wind > 60 km/h can flatten crops (lodging)
  // - Heavy rain (> 20mm/hr) can wash away topsoil or seeds
  if (windSpeedKmh > 60 || rainfallMm > 20 || hasThunderstorm) {
    return 'warning';
  }

  // Moderate risk thresholds:
  // - Wind > 40 km/h
  // - Moderate rain (> 10mm/hr)
  if (windSpeedKmh > 40 || rainfallMm > 10) {
    return 'watch';
  }

  return 'normal';
};

/**
 * Fetches current weather for a district and returns a risk alert level.
 * @param {String} district - The district name (e.g., 'Mysuru')
 * @returns {Promise<Object>} { district, riskLevel, description, temp, windKmh }
 */
const getWeatherAlert = async (district) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    // Dev Mock: If no API key provided, randomly generate a weather event for testing
    if (!apiKey || apiKey === 'dummy_key_for_now' || process.env.NODE_ENV === 'development') {
      console.log(`[DEV MOCK] Fetching mock weather for ${district}...`);
      
      const randomSeed = Math.random();
      let mockData = {
        weather: [{ main: 'Clear', description: 'clear sky' }],
        main: { temp: 300.15 }, // ~27°C
        wind: { speed: 3.5 }, // ~12 km/h
        rain: null
      };

      // 10% chance of a severe thunderstorm
      if (randomSeed > 0.9) {
        mockData.weather = [{ main: 'Thunderstorm', description: 'heavy thunderstorm' }];
        mockData.wind.speed = 18; // ~64 km/h
        mockData.rain = { '1h': 25 }; 
      } 
      // 20% chance of a watch/moderate rain
      else if (randomSeed > 0.7) {
        mockData.weather = [{ main: 'Rain', description: 'moderate rain' }];
        mockData.wind.speed = 12; // ~43 km/h
        mockData.rain = { '1h': 12 };
      }

      const riskLevel = evaluateRisk(mockData);
      
      return {
        district,
        riskLevel,
        description: mockData.weather[0].description,
        tempCelcius: Math.round(mockData.main.temp - 273.15),
        windKmh: Math.round(mockData.wind.speed * 3.6)
      };
    }

    // Production: Fetch from actual OpenWeatherMap API
    // We append ",IN" to ensure it searches within India
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${district},IN&appid=${apiKey}`;
    const response = await axios.get(url);
    const data = response.data;

    const riskLevel = evaluateRisk(data);

    return {
      district,
      riskLevel,
      description: data.weather && data.weather.length > 0 ? data.weather[0].description : 'unknown',
      tempCelcius: data.main ? Math.round(data.main.temp - 273.15) : null,
      windKmh: data.wind ? Math.round(data.wind.speed * 3.6) : null
    };

  } catch (error) {
    console.error(`Error fetching weather for ${district}:`, error.message);
    // Fail silently returning normal risk so we don't spam errors if API goes down
    return { district, riskLevel: 'normal', error: true };
  }
};

module.exports = {
  getWeatherAlert
};
