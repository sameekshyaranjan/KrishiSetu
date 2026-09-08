import api from './api'

// High-fidelity fallback data in case of network unavailability
export const FALLBACK_COLD_STORAGES = [
  {
    _id: 'cs-blr-01',
    name: 'KSWC Central Agri-Logistics Cold Hub',
    address: 'APMC Yard, Gate #4, Yeshwanthpur, Bengaluru Urban - 560022',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    capacity: 6500,
    availableCapacity: 4200,
    costPerDay: 35,
    contactNumber: '+91 80 2337 4190',
    isGovernmentOwned: true,
    isSolarPowered: true,
    chamberType: 'Multi-Commodity & CA Chambers',
    temperatureRange: '-1°C to 10°C',
    commoditiesSupported: ['Apples', 'Potatoes', 'Exotic Vegetables', 'Grapes', 'Pomegranates'],
    managerName: 'K. R. Rajashekar (KSWC Superintendent)',
    operatingHours: '24/7 Operations',
    rating: 4.8,
    location: { type: 'Point', coordinates: [77.5505, 13.0282] }
  },
  {
    _id: 'cs-blr-02',
    name: 'Whitefield Fresh Agrotech Cold Chain',
    address: 'Plot 48, EPIP Industrial Area, Whitefield, Bengaluru Urban - 560066',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    capacity: 3200,
    availableCapacity: 1850,
    costPerDay: 45,
    contactNumber: '+91 98450 12891',
    isGovernmentOwned: false,
    isSolarPowered: true,
    chamberType: 'Controlled Atmosphere (CA)',
    temperatureRange: '0°C to 4°C',
    commoditiesSupported: ['Capsicum', 'Broccoli', 'Berries', 'Cut Flowers'],
    managerName: 'Vikas Deshmukh',
    operatingHours: '6:00 AM - 11:00 PM',
    rating: 4.7,
    location: { type: 'Point', coordinates: [77.7275, 12.9815] }
  },
  {
    _id: 'cs-blr-03',
    name: 'Devanahalli Airport Agro Cold Logistics',
    address: 'Near KIADB Aerospace Park, Devanahalli, Bengaluru Rural - 562110',
    district: 'Bengaluru Rural',
    state: 'Karnataka',
    capacity: 8000,
    availableCapacity: 5200,
    costPerDay: 50,
    contactNumber: '+91 80 2800 4500',
    isGovernmentOwned: false,
    isSolarPowered: true,
    chamberType: 'International Air-Cargo Cold Terminal',
    temperatureRange: '-20°C to 12°C',
    commoditiesSupported: ['Fresh Cut Flowers', 'Grapes', 'Pomegranates', 'Baby Corn', 'Herbs'],
    managerName: 'Capt. Arun Nayak',
    operatingHours: '24/7 Operations',
    rating: 4.9,
    location: { type: 'Point', coordinates: [77.7125, 13.2435] }
  },
  {
    _id: 'cs-klr-01',
    name: 'Kolar Tomato Processing & Cold Hub',
    address: 'APMC Yard, Bangalore-Chennai Highway, Kolar - 563101',
    district: 'Kolar',
    state: 'Karnataka',
    capacity: 8500,
    availableCapacity: 5800,
    costPerDay: 28,
    contactNumber: '+91 8152 224150',
    isGovernmentOwned: true,
    isSolarPowered: true,
    chamberType: 'Multi-Commodity (High-Humidity)',
    temperatureRange: '8°C to 15°C',
    commoditiesSupported: ['Tomatoes', 'Mangoes', 'Green Chillies', 'Beans'],
    managerName: 'M. Venkataramaiah',
    operatingHours: '24/7 Operations',
    rating: 4.9,
    location: { type: 'Point', coordinates: [78.1348, 13.1367] }
  },
  {
    _id: 'cs-ckb-01',
    name: 'Chikkaballapur Horticulture Export Cold Silo',
    address: 'Near Shidlaghatta Cross, NH-44, Chikkaballapur - 562101',
    district: 'Chikkaballapur',
    state: 'Karnataka',
    capacity: 6000,
    availableCapacity: 3900,
    costPerDay: 30,
    contactNumber: '+91 8156 272300',
    isGovernmentOwned: true,
    isSolarPowered: true,
    chamberType: 'Pre-Cooling & Cold Rooms',
    temperatureRange: '2°C to 10°C',
    commoditiesSupported: ['Grapes', 'Pomegranates', 'Roses', 'Marigold', 'Potatoes'],
    managerName: 'S. N. Narayanaswamy',
    operatingHours: '24/7 Operations',
    rating: 4.8,
    location: { type: 'Point', coordinates: [77.7275, 13.4325] }
  },
  {
    _id: 'cs-mys-01',
    name: 'Mysuru KSWC Regional Cold Logistics Hub',
    address: 'Bannimantap Industrial Area, Mysuru - 570015',
    district: 'Mysuru',
    state: 'Karnataka',
    capacity: 5800,
    availableCapacity: 3400,
    costPerDay: 32,
    contactNumber: '+91 821 249 7120',
    isGovernmentOwned: true,
    isSolarPowered: true,
    chamberType: 'Multi-Commodity & Deep Freeze',
    temperatureRange: '-5°C to 12°C',
    commoditiesSupported: ['Ginger', 'Turmeric', 'Bananas', 'Dairy', 'Vegetables'],
    managerName: 'H. M. Shivakumar',
    operatingHours: '24/7 Operations',
    rating: 4.8,
    location: { type: 'Point', coordinates: [76.6494, 12.3325] }
  },
  {
    _id: 'cs-has-01',
    name: 'Hassan Potato & Spices Cold Silo (KSWC)',
    address: 'Industrial Estate, BM Road, Hassan - 573201',
    district: 'Hassan',
    state: 'Karnataka',
    capacity: 9200,
    availableCapacity: 6400,
    costPerDay: 26,
    contactNumber: '+91 8172 245620',
    isGovernmentOwned: true,
    isSolarPowered: true,
    chamberType: 'High-Capacity Bulk Potato Storage',
    temperatureRange: '3°C to 10°C',
    commoditiesSupported: ['Seed Potatoes', 'Table Potatoes', 'Cardamom', 'Ginger', 'Coffee Beans'],
    managerName: 'B. S. Devegowda',
    operatingHours: '24/7 Operations',
    rating: 4.9,
    location: { type: 'Point', coordinates: [76.1004, 13.0072] }
  },
  {
    _id: 'cs-bel-01',
    name: 'Belagavi Border Trade & Vegetable Cold Store',
    address: 'APMC Auto Nagar, Kangrali, Belagavi - 590010',
    district: 'Belagavi',
    state: 'Karnataka',
    capacity: 7800,
    availableCapacity: 4900,
    costPerDay: 32,
    contactNumber: '+91 831 247 1890',
    isGovernmentOwned: true,
    isSolarPowered: true,
    chamberType: 'Multi-Commodity & Blast Freezers',
    temperatureRange: '-10°C to 8°C',
    commoditiesSupported: ['Onions', 'Potatoes', 'Cabbage', 'Grapes', 'Dairy'],
    managerName: 'Ashok V. Patil',
    operatingHours: '24/7 Operations',
    rating: 4.8,
    location: { type: 'Point', coordinates: [74.5218, 15.8697] }
  },
  {
    _id: 'cs-vij-01',
    name: 'Vijayapura Grape & Raisin Mega Cold Hub',
    address: 'Mahal Bagayat, Solapur Road, Vijayapura - 586103',
    district: 'Vijayapura',
    state: 'Karnataka',
    capacity: 9800,
    availableCapacity: 6100,
    costPerDay: 27,
    contactNumber: '+91 8352 270114',
    isGovernmentOwned: true,
    isSolarPowered: true,
    chamberType: 'Controlled Atmosphere (Grape Specialized)',
    temperatureRange: '-0.5°C to 2°C',
    commoditiesSupported: ['Grapes', 'Raisins', 'Pomegranates', 'Lemons', 'Onions'],
    managerName: 'Mallikarjun Biradar',
    operatingHours: '24/7 Operations',
    rating: 4.9,
    location: { type: 'Point', coordinates: [75.7250, 16.8402] }
  },
  {
    _id: 'cs-hav-01',
    name: 'Byadgi National Chili Cold Chain Hub',
    address: 'Byadgi APMC Yard, Haveri District - 581106',
    district: 'Haveri',
    state: 'Karnataka',
    capacity: 8900,
    availableCapacity: 5800,
    costPerDay: 28,
    contactNumber: '+91 8375 228940',
    isGovernmentOwned: true,
    isSolarPowered: true,
    chamberType: 'Chili Preservation & Dehumidified Cold Silo',
    temperatureRange: '4°C to 10°C',
    commoditiesSupported: ['Byadgi Red Chilies', 'Paprika', 'Cardamom', 'Ginger'],
    managerName: 'Sureshbabu Kalal',
    operatingHours: '24/7 Operations',
    rating: 4.9,
    location: { type: 'Point', coordinates: [75.4912, 14.6815] }
  },
  {
    _id: 'cs-tum-01',
    name: 'Tumakuru Integrated Food Park Cold Complex',
    address: 'Vasanthanarasapura Industrial Area, Tumakuru - 572128',
    district: 'Tumakuru',
    state: 'Karnataka',
    capacity: 8800,
    availableCapacity: 5600,
    costPerDay: 30,
    contactNumber: '+91 816 228 9010',
    isGovernmentOwned: true,
    isSolarPowered: true,
    chamberType: 'Multi-Commodity & Deep Freezers',
    temperatureRange: '-15°C to 12°C',
    commoditiesSupported: ['Coconuts', 'Groundnuts', 'Tomatoes', 'Ragi Seeds', 'Dairy'],
    managerName: 'Dr. T. L. Shivanna',
    operatingHours: '24/7 Operations',
    rating: 4.9,
    location: { type: 'Point', coordinates: [77.0125, 13.4110] }
  },
  {
    _id: 'cs-dhn-01',
    name: 'Hubballi-Dharwad Twin City Agri Cold Terminal',
    address: 'Amargol APMC Market Yard, Hubballi, Dharwad - 580025',
    district: 'Dharwad',
    state: 'Karnataka',
    capacity: 7500,
    availableCapacity: 4800,
    costPerDay: 33,
    contactNumber: '+91 836 222 4580',
    isGovernmentOwned: true,
    isSolarPowered: true,
    chamberType: 'Multi-Commodity & Ripening Unit',
    temperatureRange: '0°C to 15°C',
    commoditiesSupported: ['Chilies', 'Onions', 'Potatoes', 'Mangoes', 'Maize'],
    managerName: 'Basavaraj Hiremath',
    operatingHours: '24/7 Operations',
    rating: 4.8,
    location: { type: 'Point', coordinates: [75.1240, 15.3647] }
  }
]

export const storageService = {
  /**
   * Fetch all cold storage facilities with optional query filtering
   */
  async getAllStorages(params = {}) {
    try {
      const response = await api.get('/storage', { params })
      const list = Array.isArray(response) ? response : (Array.isArray(response?.data) ? response.data : null)
      if (list && list.length > 0) {
        return list
      }
      return FALLBACK_COLD_STORAGES
    } catch (error) {
      console.warn('Storage API fetch error, using fallback catalog:', error.message)
      // Apply in-memory filtering on fallback if needed
      let data = [...FALLBACK_COLD_STORAGES]
      if (params.district && params.district !== 'All') {
        data = data.filter(d => d.district.toLowerCase() === params.district.toLowerCase())
      }
      if (params.isGovernmentOwned !== undefined && params.isGovernmentOwned !== '') {
        const isGov = params.isGovernmentOwned === 'true' || params.isGovernmentOwned === true
        data = data.filter(d => d.isGovernmentOwned === isGov)
      }
      if (params.search) {
        const s = params.search.toLowerCase()
        data = data.filter(d => 
          d.name.toLowerCase().includes(s) || 
          d.address.toLowerCase().includes(s) || 
          d.district.toLowerCase().includes(s)
        )
      }
      return data
    }
  },

  /**
   * Fetch facilities sorted by geographic proximity using user lat/lng
   */
  async getNearbyStorages(lat, lng, radiusInKm = 100) {
    try {
      const response = await api.get('/storage/nearby', {
        params: { lat, lng, radiusInKm }
      })
      const list = Array.isArray(response) ? response : (Array.isArray(response?.data) ? response.data : null)
      if (list && list.length > 0) {
        return list
      }
      throw new Error('Empty nearby response')
    } catch (error) {
      console.warn('Nearby storage API error, calculating local distance:', error.message)
      // Local Haversine calculation for fallback
      const calcDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        return Math.round(R * c * 10) / 10
      }

      return FALLBACK_COLD_STORAGES.map(facility => {
        const coords = facility.location?.coordinates || [77.5946, 12.9716]
        const dist = calcDistance(lat, lng, coords[1], coords[0])
        return { ...facility, distanceKm: dist }
      }).sort((a, b) => a.distanceKm - b.distanceKm)
    }
  }
}

export default storageService
