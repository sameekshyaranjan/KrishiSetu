const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');
const connectDB = require('../config/db');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Crop = require('../models/Crop');
const Bid = require('../models/Bid');
const Transaction = require('../models/Transaction');

dotenv.config();

const KARNATAKA_DISTRICTS = [
  'Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Hubballi', 
  'Dharwad', 'Belagavi', 'Mangaluru', 'Tumakuru', 'Mandya', 
  'Hassan', 'Kalaburagi', 'Raichur', 'Ballari'
];

const CROP_CATEGORIES = {
  vegetables: ['Tomato', 'Potato', 'Onion', 'Cabbage', 'Cauliflower', 'Carrot', 'Brinjal'],
  fruits: ['Mango', 'Banana', 'Papaya', 'Pomegranate', 'Guava', 'Watermelon'],
  grains: ['Rice', 'Wheat', 'Ragi', 'Jowar', 'Maize'],
  pulses: ['Toor Dal', 'Moong Dal', 'Urad Dal', 'Chickpeas'],
  spices: ['Turmeric', 'Chilli', 'Cardamom', 'Ginger', 'Garlic']
};

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database for seeding...');

    // 1. Clear existing marketplace data
    console.log('[Seed] Cleaning old marketplace collections...');
    await Promise.all([
      Farmer.deleteMany({}),
      Trader.deleteMany({}),
      Crop.deleteMany({}),
      Bid.deleteMany({}),
      Transaction.deleteMany({})
    ]);

    // 2. Generate 20 Farmers
    console.log('[Seed] Creating 20 Farmers...');
    const farmers = [];
    for (let i = 1; i <= 20; i++) {
      const district = faker.helpers.arrayElement(KARNATAKA_DISTRICTS);
      const farmer = await Farmer.create({
        name: faker.person.fullName(),
        mobile: `98${faker.string.numeric(8)}`,
        email: `farmer${i}@krishisetu.com`,
        password: 'password123',
        village: `${district} Village`,
        district: district,
        state: 'Karnataka',
        cropsGrown: ['Tomato', 'Onion', 'Rice'],
        landArea: faker.number.int({ min: 2, max: 25 }),
        sowingSeason: 'Kharif'
      });
      farmers.push(farmer);
    }
    console.log(`[Seed] Successfully created ${farmers.length} farmers.`);

    // 3. Generate 10 Traders
    console.log('[Seed] Creating 10 Verified Traders...');
    const traders = [];
    for (let i = 1; i <= 10; i++) {
      const district = faker.helpers.arrayElement(KARNATAKA_DISTRICTS);
      const trader = await Trader.create({
        name: faker.person.fullName(),
        email: `trader${i}@krishisetu.com`,
        password: 'password123',
        mobile: `97${faker.string.numeric(8)}`,
        district: district,
        state: 'Karnataka',
        companyName: `${faker.company.name()} Agro Traders`,
        licenseNumber: `KA-APMC-${faker.string.alphanumeric(8).toUpperCase()}`,
        apmcAffiliation: `${district} APMC Yard`,
        verificationStatus: 'approved',
        operatingLocations: [district]
      });
      traders.push(trader);
    }
    console.log(`[Seed] Successfully created ${traders.length} traders.`);

    // 4. Generate 50 Crop Listings
    console.log('[Seed] Creating 50 Crop Listings...');
    const crops = [];
    const categoryKeys = Object.keys(CROP_CATEGORIES);

    for (let i = 0; i < 50; i++) {
      const farmer = faker.helpers.arrayElement(farmers);
      const category = faker.helpers.arrayElement(categoryKeys);
      const cropName = faker.helpers.arrayElement(CROP_CATEGORIES[category]);
      const quantity = faker.number.int({ min: 10, max: 200 });
      const basePrice = faker.number.int({ min: 1200, max: 4500 });

      const crop = await Crop.create({
        farmer: farmer._id,
        name: cropName,
        category: category,
        quantity: quantity,
        unit: 'quintal',
        basePrice: basePrice,
        description: `High-grade organic ${cropName} directly harvested from ${farmer.district}. Ready for pickup.`,
        images: [
          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1546470427-227c7369a9d0?w=600&auto=format&fit=crop'
        ],
        status: 'available',
        harvestStatus: 'post-harvest'
      });
      crops.push(crop);
    }
    console.log(`[Seed] Successfully created ${crops.length} crop listings.`);

    // 5. Generate Bids & Sample Transactions
    console.log('[Seed] Creating Bids and Transactions...');
    let bidCount = 0;
    let txCount = 0;

    for (let i = 0; i < 30; i++) {
      const crop = crops[i];
      const trader = faker.helpers.arrayElement(traders);
      const bidAmount = crop.basePrice + faker.number.int({ min: 50, max: 500 });

      const isAccepted = i < 10; // First 10 bids are accepted with transactions
      
      const bid = await Bid.create({
        crop: crop._id,
        farmer: crop.farmer,
        trader: trader._id,
        amount: bidAmount,
        status: isAccepted ? 'accepted' : 'pending',
        message: `We can arrange immediate logistics and payment for this lot.`
      });
      bidCount++;

      if (isAccepted) {
        crop.status = 'sold';
        await crop.save();

        await Transaction.create({
          farmer: crop.farmer,
          trader: trader._id,
          cropListing: crop._id,
          bid: bid._id,
          amount: bidAmount * crop.quantity,
          paymentMethod: 'razorpay',
          paymentStatus: i < 5 ? 'held_in_escrow' : 'payout_released',
          logisticsStatus: i < 5 ? 'in_transit' : 'delivered',
          paymentGatewayId: `pay_${faker.string.alphanumeric(14)}`
        });
        txCount++;
      }
    }

    console.log(`[Seed] Successfully created ${bidCount} bids and ${txCount} transactions.`);
    console.log('\n==========================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY');
    console.log('==========================================');
    console.log('Farmer Login: farmer1@krishisetu.com / password123');
    console.log('Trader Login: trader1@krishisetu.com / password123');
    console.log('==========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Seeding failed with error:', error);
    process.exit(1);
  }
};

seedDatabase();
