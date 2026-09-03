const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function verifyAuthAndFeeds() {
  console.log('Testing authentication after reset:');

  // 1. Test Farmer Login
  let farmerPassed = false;
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'farmer1@krishisetu.com',
      password: 'password123'
    });
    if (res.data?.accessToken && res.data?.user?.role === 'farmer') {
      farmerPassed = true;
      console.log(' - Farmer login: PASS (Welcome, ' + res.data.user.name + ')');
    }
  } catch (err) {
    console.error(' - Farmer login: FAIL', err.message);
  }

  // 2. Test Trader Login
  let traderPassed = false;
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'trader1@krishisetu.com',
      password: 'password123'
    });
    if (res.data?.accessToken && res.data?.user?.role === 'trader') {
      traderPassed = true;
      console.log(' - Trader login: PASS (Welcome, ' + res.data.user.name + ')');
    }
  } catch (err) {
    console.error(' - Trader login: FAIL', err.message);
  }

  // 3. Test Admin Login
  let adminPassed = false;
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@krishisetu.in',
      password: 'password123'
    });
    if (res.data?.accessToken && res.data?.user?.role === 'admin') {
      adminPassed = true;
      console.log(' - Admin login: PASS (Welcome, ' + res.data.user.name + ')');
    }
  } catch (err) {
    console.error(' - Admin login: FAIL', err.message);
  }

  // 4. Test Marketplace Crop Count (Should be 0)
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'trader1@krishisetu.com',
      password: 'password123'
    });
    const token = loginRes.data.accessToken;
    const cropsRes = await axios.get(`${BASE_URL}/crops`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const count = cropsRes.data?.data?.data?.length || 0;
    console.log(` - Marketplace Crops Feed: ${count} crops (Expected: 0) ${count === 0 ? 'PASS' : 'FAIL'}`);
  } catch (err) {
    console.error(' - Marketplace Crops Feed: FAIL', err.message);
  }
}

verifyAuthAndFeeds();
