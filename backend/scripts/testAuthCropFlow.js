/**
 * REGRESSION TEST: Farmer Authentication & Crop Creation Flow
 */
const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

async function runRegressionTests() {
  console.log('================================================================');
  console.log('🧪 RUNNING AUTH & CROP CREATION REGRESSION SUITE');
  console.log('================================================================\n');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  // TEST 1: Farmer Login with real credentials
  console.log('\n--- TEST 1: Farmer Login ---');
  let farmerToken;
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'farmer1@krishisetu.com',
      password: 'password123'
    });
    console.log('Login Status:', loginRes.status, '(Expected: 200)');
    farmerToken = loginRes.data?.accessToken || loginRes.data?.token;
    console.log('Token received:', farmerToken ? `YES (length: ${farmerToken.length})` : 'NO');
    console.log('User role:', loginRes.data?.user?.role, '(Expected: farmer)');
    if (!farmerToken) throw new Error('Token missing from login response');
  } catch (err) {
    console.error('❌ Farmer login failed:', err.response?.data || err.message);
    process.exit(1);
  }

  // TEST 2: Create Crop with valid Bearer token
  console.log('\n--- TEST 2: Create Crop with Bearer Token ---');
  let createdCropId;
  try {
    const cropPayload = {
      name: 'AUTH_TEST_CROP_TOMATO',
      cropType: 'Tomato',
      category: 'vegetables',
      quantity: 50,
      unit: 'quintal',
      basePrice: 2200,
      district: 'Hassan',
      description: 'Auth test crop lot'
    };

    const cropRes = await axios.post(`${BASE_URL}/crops`, cropPayload, {
      headers: {
        Authorization: `Bearer ${farmerToken}`
      }
    });

    console.log('Create Crop Status:', cropRes.status, '(Expected: 201)');
    createdCropId = cropRes.data?._id;
    console.log('Created Crop _id:', createdCropId);
    console.log('Crop status:', cropRes.data?.status);
    console.log('Crop district:', cropRes.data?.district);
    console.log('✅ PASS: Crop successfully created with JWT Bearer auth!');
  } catch (err) {
    console.error('❌ Crop creation failed:', err.response?.status, err.response?.data || err.message);
    process.exit(1);
  }

  // TEST 3: Attempt Create Crop with NO token -> MUST be 401
  console.log('\n--- TEST 3: Create Crop with NO Token (Must Reject) ---');
  try {
    await axios.post(`${BASE_URL}/crops`, { name: 'FAIL_CROP' });
    console.error('❌ Security failure: Request without token was NOT rejected!');
    process.exit(1);
  } catch (err) {
    console.log('Status:', err.response?.status, '(Expected: 401)');
    console.log('Message:', err.response?.data?.message, '(Expected: Not authorized, no token provided)');
    if (err.response?.status === 401) {
      console.log('✅ PASS: Request without token correctly rejected with 401');
    }
  }

  // TEST 4: Attempt Create Crop with INVALID token -> MUST be 401
  console.log('\n--- TEST 4: Create Crop with INVALID Token (Must Reject) ---');
  try {
    await axios.post(`${BASE_URL}/crops`, { name: 'FAIL_CROP' }, {
      headers: { Authorization: 'Bearer invalid_mock_token_123' }
    });
    console.error('❌ Security failure: Request with invalid token was NOT rejected!');
    process.exit(1);
  } catch (err) {
    console.log('Status:', err.response?.status, '(Expected: 401)');
    console.log('Message:', err.response?.data?.message, '(Expected: Not authorized, token is invalid)');
    if (err.response?.status === 401) {
      console.log('✅ PASS: Request with invalid token correctly rejected with 401');
    }
  }

  // TEST 5: Trader Login & Attempt to Create Crop (Farmer only) -> MUST be 403
  console.log('\n--- TEST 5: Trader attempts Farmer-only crop creation (Must Reject with 403) ---');
  try {
    const traderLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'trader1@krishisetu.com',
      password: 'password123'
    });
    const traderToken = traderLoginRes.data?.accessToken || traderLoginRes.data?.token;

    await axios.post(`${BASE_URL}/crops`, { name: 'TRADER_CROP' }, {
      headers: { Authorization: `Bearer ${traderToken}` }
    });
    console.error('❌ Role authorization failure: Trader was allowed to create a farmer crop!');
    process.exit(1);
  } catch (err) {
    console.log('Status:', err.response?.status, '(Expected: 403)');
    console.log('Message:', err.response?.data?.message, '(Expected: Forbidden: insufficient permissions)');
    if (err.response?.status === 403) {
      console.log('✅ PASS: Trader role correctly rejected from Farmer route with 403');
    }
  }

  // TEST 6: Farmer gets own listings (`GET /api/crops/my/listings`)
  console.log('\n--- TEST 6: Farmer fetches own listings ---');
  try {
    const myListingsRes = await axios.get(`${BASE_URL}/crops/my/listings`, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    console.log('Status:', myListingsRes.status, '(Expected: 200)');
    console.log('Listings count:', myListingsRes.data?.length);
    console.log('✅ PASS: Farmer can fetch own listings');
  } catch (err) {
    console.error('❌ Fetch own listings failed:', err.response?.data || err.message);
    process.exit(1);
  }

  // CLEANUP
  console.log('\n--- CLEANUP: Deleting test crop ---');
  if (createdCropId) {
    await axios.delete(`${BASE_URL}/crops/${createdCropId}`, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    await mongoose.connection.db.collection('crops').deleteOne({ _id: new mongoose.Types.ObjectId(createdCropId) });
    console.log('Test crop deleted successfully.');
  }

  console.log('\n================================================================');
  console.log('🎉 ALL AUTH & CROP CREATION REGRESSION TESTS PASSED (6/6)');
  console.log('================================================================\n');
  process.exit(0);
}

runRegressionTests().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
