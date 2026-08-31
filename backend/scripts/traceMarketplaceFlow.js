/**
 * FORENSIC TRACE v2 — Uses JWT signed directly with app secret
 * Bypasses password requirement, tests exact API flow.
 */
const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const BASE_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET;

async function signToken(id, role, secret) {
  return jwt.sign({ id, role }, secret, { expiresIn: '1h' });
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB:', mongoose.connection.db.databaseName);

  const db = mongoose.connection.db;

  // ── Get real farmer and trader IDs ─────────────────────────────
  const farmers = await db.collection('farmers').find({}).toArray();
  const traders = await db.collection('traders').find({}).toArray();

  if (farmers.length === 0) { console.log('❌ No farmers in DB'); process.exit(1); }
  if (traders.length === 0) { console.log('❌ No traders in DB'); process.exit(1); }

  const farmer = farmers[0];
  const trader = traders[0];
  console.log('\n👨‍🌾 Farmer:', farmer.name, '|', farmer.email, '| _id:', farmer._id);
  console.log('👔 Trader:', trader.name, '|', trader.email, '| _id:', trader._id);

  // ── Sign tokens directly ───────────────────────────────────────
  const farmerToken = await signToken(farmer._id.toString(), 'farmer', JWT_SECRET);
  const traderToken = await signToken(trader._id.toString(), 'trader', JWT_SECRET);
  console.log('\n🔑 Farmer token (first 40):', farmerToken.slice(0, 40) + '...');
  console.log('🔑 Trader token (first 40):', traderToken.slice(0, 40) + '...');

  // ── STEP 1: Create crop via API as farmer ──────────────────────
  console.log('\n─── STEP 1: POST /api/crops as Farmer ───');
  let cropId;
  try {
    const createRes = await axios.post(`${BASE_URL}/crops`, {
      name: 'TEST_REAL_CROP_001',
      cropType: 'Tomato',
      category: 'vegetables',
      quantity: 75,
      unit: 'quintal',
      basePrice: 2500,
      district: 'Hassan',
      description: 'Forensic trace — real crop test',
      images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600']
    }, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });

    console.log('HTTP Status:', createRes.status);
    console.log('Response body:', JSON.stringify(createRes.data, null, 2));
    cropId = createRes.data?._id;
    console.log('\n✅ Created crop _id:', cropId);
    console.log('   status:', createRes.data?.status);
    console.log('   category:', createRes.data?.category);
    console.log('   farmer ref:', createRes.data?.farmer);
  } catch (err) {
    console.log('❌ Crop creation FAILED');
    console.log('   Status:', err.response?.status);
    console.log('   Body:', JSON.stringify(err.response?.data || err.message));
    process.exit(1);
  }

  // ── STEP 2: Check MongoDB directly ────────────────────────────
  console.log('\n─── STEP 2: MongoDB Direct Verification ───');
  const cropInDB = await db.collection('crops').findOne({ name: 'TEST_REAL_CROP_001' });
  if (cropInDB) {
    console.log('✅ Crop EXISTS in MongoDB');
    console.log('   All stored fields:', JSON.stringify(cropInDB, null, 2));
  } else {
    console.log('❌ Crop NOT in MongoDB! Bug is in save layer.');
    process.exit(1);
  }

  // ── STEP 3: Marketplace query matches? ─────────────────────────
  console.log('\n─── STEP 3: Marketplace Query { status: "available" } ───');
  const allAvailable = await db.collection('crops').find({ status: 'available' }).toArray();
  console.log('Crops with status=available:', allAvailable.length);
  const testCropFound = allAvailable.some(c => c.name === 'TEST_REAL_CROP_001');
  console.log('TEST_REAL_CROP_001 in query result:', testCropFound ? '✅ YES' : '❌ NO — BUG HERE');

  // ── STEP 4: Call GET /crops as Trader ─────────────────────────
  console.log('\n─── STEP 4: GET /api/crops as Trader (Marketplace API) ───');
  try {
    const mktRes = await axios.get(`${BASE_URL}/crops`, {
      headers: { Authorization: `Bearer ${traderToken}` }
    });

    console.log('HTTP Status:', mktRes.status);
    console.log('Response source:', mktRes.data?.source);
    
    const pagData = mktRes.data?.data;
    console.log('Paginate keys:', Object.keys(pagData || {}));
    console.log('Total in DB:', pagData?.total);
    console.log('Returned count:', pagData?.count);

    const cropsArr = Array.isArray(pagData?.data) ? pagData.data : [];
    console.log('\nCrops returned in API:');
    cropsArr.forEach(c => {
      const marker = c.name === 'TEST_REAL_CROP_001' ? ' ⭐ TEST CROP' : '';
      console.log(`  - "${c.name}" | status:${c.status} | _id:${c._id}${marker}`);
    });

    const found = cropsArr.some(c => c.name === 'TEST_REAL_CROP_001');
    console.log('\n' + (found
      ? '✅ TEST_REAL_CROP_001 IS returned by marketplace API\n   → Backend OK. Bug is in frontend.'
      : '❌ TEST_REAL_CROP_001 NOT returned by marketplace API\n   → BUG IS IN BACKEND (query/cache/route).'));

    if (!found) {
      console.log('\nFull raw API response:');
      console.log(JSON.stringify(mktRes.data, null, 2).slice(0, 1000));
    }
  } catch (err) {
    console.log('❌ Marketplace API FAILED');
    console.log('   Status:', err.response?.status);
    console.log('   Body:', JSON.stringify(err.response?.data || err.message));
  }

  // ── CLEANUP ────────────────────────────────────────────────────
  await db.collection('crops').deleteOne({ name: 'TEST_REAL_CROP_001' });
  console.log('\n🧹 Test crop deleted from MongoDB.');
  process.exit(0);
}

run().catch(e => { console.error('FATAL:', e.message, e.stack); process.exit(1); });
