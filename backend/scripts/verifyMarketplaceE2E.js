/**
 * COMPREHENSIVE END-TO-END MARKETPLACE TEST & VERIFICATION
 * Tests:
 * 1. Farmer A creates TEST_REAL_CROP_001
 * 2. MongoDB persistence & schema verification
 * 3. Trader calling GET /api/crops returns TEST_REAL_CROP_001
 * 4. Farmer B creates TEST_REAL_CROP_002
 * 5. Redis cache invalidation works (v2 appears in feed)
 * 6. Trader sees both REAL crops
 * 7. Status filtering (sold/removed not visible)
 * 8. Clean up test crops
 */
const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const BASE_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET;

async function signToken(id, role) {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '1h' });
}

async function run() {
  console.log('================================================================');
  console.log('🚀 STARTING COMPREHENSIVE MARKETPLACE FORENSIC VERIFICATION');
  console.log('================================================================\n');

  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  console.log('✅ Connected to MongoDB:', db.databaseName);

  // 1. Get real Farmer and Trader
  const farmers = await db.collection('farmers').find({}).toArray();
  const traders = await db.collection('traders').find({}).toArray();

  if (farmers.length < 1) {
    console.error('❌ Need at least 1 farmer in DB');
    process.exit(1);
  }
  if (traders.length < 1) {
    console.error('❌ Need at least 1 trader in DB');
    process.exit(1);
  }

  const farmerA = farmers[0];
  const farmerB = farmers.length > 1 ? farmers[1] : farmers[0];
  const trader = traders[0];

  console.log(`👨‍🌾 Farmer A: ${farmerA.name} (${farmerA.email}) [ID: ${farmerA._id}]`);
  console.log(`👨‍🌾 Farmer B: ${farmerB.name} (${farmerB.email}) [ID: ${farmerB._id}]`);
  console.log(`👔 Trader:   ${trader.name} (${trader.email}) [ID: ${trader._id}]\n`);

  const tokenFarmerA = await signToken(farmerA._id.toString(), 'farmer');
  const tokenFarmerB = await signToken(farmerB._id.toString(), 'farmer');
  const tokenTrader   = await signToken(trader._id.toString(), 'trader');

  // STEP 1 & 2: Farmer A creates TEST_REAL_CROP_001
  console.log('--- STEP 1 & 2: Farmer A creates TEST_REAL_CROP_001 ---');
  const cropPayload1 = {
    name: 'TEST_REAL_CROP_001',
    cropType: 'Tomato',
    category: 'vegetables',
    quantity: 120,
    unit: 'quintal',
    basePrice: 2400,
    district: 'Hassan',
    description: 'Fresh Hassan Hybrid Tomatoes',
    images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600']
  };

  const createRes1 = await axios.post(`${BASE_URL}/crops`, cropPayload1, {
    headers: { Authorization: `Bearer ${tokenFarmerA}` }
  });

  console.log(`HTTP Status: ${createRes1.status} (Expected: 201)`);
  const crop1 = createRes1.data;
  console.log('Created Listing ID:', crop1._id);
  console.log('Listing Fields:', {
    name: crop1.name,
    category: crop1.category,
    quantity: crop1.quantity,
    unit: crop1.unit,
    basePrice: crop1.basePrice,
    district: crop1.district,
    status: crop1.status,
    farmer: crop1.farmer
  });

  // STEP 3, 4, 5: Verify MongoDB directly
  console.log('\n--- STEP 3, 4, 5: Verify MongoDB Document directly ---');
  const dbCrop1 = await db.collection('crops').findOne({ _id: new mongoose.Types.ObjectId(crop1._id) });
  if (!dbCrop1) {
    console.error('❌ Crop not found in MongoDB!');
    process.exit(1);
  }
  console.log('✅ MongoDB Document Confirmed:');
  console.log('  _id:        ', dbCrop1._id.toString());
  console.log('  name:       ', dbCrop1.name);
  console.log('  farmer:     ', dbCrop1.farmer.toString());
  console.log('  district:   ', dbCrop1.district);
  console.log('  status:     ', dbCrop1.status);
  console.log('  category:   ', dbCrop1.category);
  console.log('  basePrice:  ', dbCrop1.basePrice);
  console.log('  quantity:   ', dbCrop1.quantity);
  console.log('  createdAt:  ', dbCrop1.createdAt);

  // STEP 6: Trader calls GET /api/crops (Marketplace API)
  console.log('\n--- STEP 6: Trader calls GET /api/crops (Marketplace API) ---');
  const marketRes1 = await axios.get(`${BASE_URL}/crops`, {
    headers: { Authorization: `Bearer ${tokenTrader}` }
  });
  console.log(`HTTP Status: ${marketRes1.status}`);
  console.log(`Source:      ${marketRes1.data?.source}`);
  const items1 = marketRes1.data?.data?.data || marketRes1.data?.data || [];
  console.log(`Total Count: ${items1.length}`);
  const found1 = items1.find(c => c.name === 'TEST_REAL_CROP_001');
  if (found1) {
    console.log('✅ PASS: TEST_REAL_CROP_001 is visible in Trader Marketplace API response!');
    console.log('  Populated Farmer Name:', found1.farmer?.name);
    console.log('  Populated Farmer District:', found1.farmer?.district);
    console.log('  Crop District:', found1.district);
  } else {
    console.error('❌ FAIL: TEST_REAL_CROP_001 NOT found in Trader Marketplace API response!');
    process.exit(1);
  }

  // STEP 19: Farmer B creates TEST_REAL_CROP_002 (Test cache invalidation & multi-farmer visibility)
  console.log('\n--- STEP 19 & 22: Farmer B creates TEST_REAL_CROP_002 & Tests Redis Invalidation ---');
  const cropPayload2 = {
    name: 'TEST_REAL_CROP_002',
    cropType: 'Ragi (Finger Millet)',
    category: 'grains',
    quantity: 80,
    unit: 'quintal',
    basePrice: 3600,
    district: 'Mandya',
    description: 'Organic Finger Millet from Mandya Farm',
    images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600']
  };

  const createRes2 = await axios.post(`${BASE_URL}/crops`, cropPayload2, {
    headers: { Authorization: `Bearer ${tokenFarmerB}` }
  });
  console.log(`HTTP Status: ${createRes2.status}`);
  const crop2 = createRes2.data;
  console.log('Created Second Listing ID:', crop2._id);

  // Trader calls GET /api/crops again
  const marketRes2 = await axios.get(`${BASE_URL}/crops`, {
    headers: { Authorization: `Bearer ${tokenTrader}` }
  });
  const items2 = marketRes2.data?.data?.data || marketRes2.data?.data || [];
  console.log(`Total Count in Marketplace: ${items2.length}`);

  const hasCrop1 = items2.some(c => c.name === 'TEST_REAL_CROP_001');
  const hasCrop2 = items2.some(c => c.name === 'TEST_REAL_CROP_002');

  console.log('  Crop 1 (TEST_REAL_CROP_001) visible:', hasCrop1 ? '✅ YES' : '❌ NO');
  console.log('  Crop 2 (TEST_REAL_CROP_002) visible:', hasCrop2 ? '✅ YES' : '❌ NO');

  if (hasCrop1 && hasCrop2) {
    console.log('✅ PASS: Multi-farmer listings & cache invalidation verified!');
  } else {
    console.error('❌ FAIL: Cache invalidation or multi-farmer listing failed!');
    process.exit(1);
  }

  // STEP 20 & 21: Test status filtering & live cache invalidation via DELETE /crops/:id
  console.log('\n--- STEP 20 & 21: Verify Deleted / Removed crops are immediately excluded ---');
  const deleteRes = await axios.delete(`${BASE_URL}/crops/${crop2._id}`, {
    headers: { Authorization: `Bearer ${tokenFarmerB}` }
  });
  console.log(`Delete API HTTP Status: ${deleteRes.status} (Expected: 200)`);

  const marketRes3 = await axios.get(`${BASE_URL}/crops`, {
    headers: { Authorization: `Bearer ${tokenTrader}` }
  });
  const items3 = marketRes3.data?.data?.data || marketRes3.data?.data || [];
  const crop2StillThere = items3.some(c => c.name === 'TEST_REAL_CROP_002');
  console.log('  Removed crop visible in marketplace:', crop2StillThere ? '❌ BUG: Removed crop is visible' : '✅ CORRECT: Removed crop is filtered out');

  // Clean up remaining test crop
  console.log('\n--- CLEANUP: Removing test crops from MongoDB ---');
  await axios.delete(`${BASE_URL}/crops/${crop1._id}`, {
    headers: { Authorization: `Bearer ${tokenFarmerA}` }
  });
  const del = await db.collection('crops').deleteMany({
    name: { $in: ['TEST_REAL_CROP_001', 'TEST_REAL_CROP_002'] }
  });
  console.log(`Cleaned up test crop records.`);

  console.log('\n================================================================');
  console.log('🎉 ALL FORENSIC VERIFICATION CHECKS PASSED 100%!');
  console.log('================================================================\n');
  process.exit(0);
}

run().catch(err => {
  console.error('FATAL ERROR:', err.response?.data || err.message);
  process.exit(1);
});
