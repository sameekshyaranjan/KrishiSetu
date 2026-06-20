const MandiPrice = require('../models/MandiPrice');

const fetchMockMandiPrices = () => {
  const today = new Date();

  return [
    { commodity: 'Tomato', market: 'Pune APMC', district: 'Pune', state: 'Maharashtra', minPrice: 800, maxPrice: 1400, modalPrice: 1100, arrivalDate: today, unit: 'Quintal' },
    { commodity: 'Onion', market: 'Lasalgaon APMC', district: 'Nashik', state: 'Maharashtra', minPrice: 600, maxPrice: 1000, modalPrice: 800, arrivalDate: today, unit: 'Quintal' },
    { commodity: 'Wheat', market: 'Indore APMC', district: 'Indore', state: 'Madhya Pradesh', minPrice: 2100, maxPrice: 2400, modalPrice: 2250, arrivalDate: today, unit: 'Quintal' },
    { commodity: 'Rice', market: 'Raipur APMC', district: 'Raipur', state: 'Chhattisgarh', minPrice: 1800, maxPrice: 2200, modalPrice: 2000, arrivalDate: today, unit: 'Quintal' },
    { commodity: 'Potato', market: 'Agra APMC', district: 'Agra', state: 'Uttar Pradesh', minPrice: 700, maxPrice: 1100, modalPrice: 900, arrivalDate: today, unit: 'Quintal' },
    { commodity: 'Sugarcane', market: 'Kolhapur APMC', district: 'Kolhapur', state: 'Maharashtra', minPrice: 280, maxPrice: 320, modalPrice: 300, arrivalDate: today, unit: 'Quintal' },
    { commodity: 'Soybean', market: 'Latur APMC', district: 'Latur', state: 'Maharashtra', minPrice: 3800, maxPrice: 4200, modalPrice: 4000, arrivalDate: today, unit: 'Quintal' },
    { commodity: 'Cotton', market: 'Akola APMC', district: 'Akola', state: 'Maharashtra', minPrice: 5500, maxPrice: 6200, modalPrice: 5900, arrivalDate: today, unit: 'Quintal' },
  ];
};

const savePricesToDB = async () => {
  const prices = fetchMockMandiPrices();

  for (const price of prices) {
    await MandiPrice.findOneAndUpdate(
      { commodity: price.commodity, market: price.market, arrivalDate: price.arrivalDate },
      price,
      { upsert: true, returnDocument: 'after' }
    );
  }

  console.log(`Mandi prices updated: ${prices.length} records`);
};

module.exports = { fetchMockMandiPrices, savePricesToDB };
