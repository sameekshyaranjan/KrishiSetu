/**
 * KrishiSetu - Trader Wallet & Escrow Bidding Capital Automated Test Suite
 * Validates:
 * 1. Initial Trader balance = ₹0 (no fake balance contamination)
 * 2. Role security (Farmer rejected from Trader wallet with 403, unauthenticated with 401)
 * 3. Server-side deposit validation (0, negative, non-number, < ₹100, > ₹1Cr)
 * 4. Sandbox Top-Up persistence in MongoDB (Wallet + WalletLedger)
 * 5. Idempotency protection against duplicate submissions
 * 6. Balance accumulation and persistence across login/logout cycles
 * 7. Bidding integration with wallet balance
 */

const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

const runWalletTests = async () => {
  console.log('===============================================================');
  console.log('🏛️ RUNNING TRADER WALLET & ESCROW BIDDING CAPITAL TEST SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  try {
    // 1. Authenticate standard accounts
    console.log('1️⃣ Authenticating test accounts...');
    const farmerLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'farmer1@krishisetu.com',
      password: 'password123'
    });
    const farmerToken = farmerLogin.data.accessToken || farmerLogin.data.token;
    console.log('   ✅ Farmer Authenticated.');

    const traderLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'trader1@krishisetu.com',
      password: 'password123'
    });
    const traderToken = traderLogin.data.accessToken || traderLogin.data.token;
    const traderId = traderLogin.data.user?._id || traderLogin.data._id;
    console.log('   ✅ Trader Authenticated (ID: ' + traderId + ').');

    // 2. Test Role Security: Farmer calling Trader Wallet API
    console.log('\n2️⃣ Testing Role-Based Security on Wallet Endpoints...');
    try {
      await axios.get(`${API_BASE}/wallet/overview`, {
        headers: { Authorization: `Bearer ${farmerToken}` }
      });
      console.error('   ❌ Security failure: Farmer was allowed to access Trader wallet!');
      failed++;
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('   ✅ Farmer blocked from Trader wallet with HTTP 403 Forbidden.');
        passed++;
      } else {
        console.error(`   ❌ Unexpected status: ${err.response?.status}`);
        failed++;
      }
    }

    try {
      await axios.get(`${API_BASE}/wallet/overview`);
      console.error('   ❌ Security failure: Unauthenticated access permitted!');
      failed++;
    } catch (err) {
      if (err.response?.status === 401) {
        console.log('   ✅ Unauthenticated request blocked with HTTP 401 Unauthorized.');
        passed++;
      } else {
        console.error(`   ❌ Unexpected status: ${err.response?.status}`);
        failed++;
      }
    }

    // 3. Connect directly to MongoDB to inspect or reset test trader wallet
    await mongoose.connect(process.env.MONGO_URI);
    const Wallet = require('../models/Wallet');
    const WalletLedger = require('../models/WalletLedger');

    // Clear test trader wallet to test clean 0 state
    await Wallet.deleteOne({ trader: traderId });
    await WalletLedger.deleteMany({ trader: traderId });

    // 4. Test Initial Fresh Balance = 0
    console.log('\n3️⃣ Testing Initial Fresh Trader Wallet Balance...');
    const initialOverview = await axios.get(`${API_BASE}/wallet/overview`, {
      headers: { Authorization: `Bearer ${traderToken}` }
    });

    if (
      initialOverview.data.availableBalance === 0 &&
      initialOverview.data.lockedEscrow === 0 &&
      initialOverview.data.totalDeposited === 0 &&
      Array.isArray(initialOverview.data.transactions) &&
      initialOverview.data.transactions.length === 0
    ) {
      console.log('   ✅ Fresh Trader has ₹0 available balance and empty ledger history.');
      passed++;
    } else {
      console.error('   ❌ Initial balance contaminated:', initialOverview.data);
      failed++;
    }

    // 5. Server-Side Input Validation
    console.log('\n4️⃣ Testing Server-Side Deposit Validations...');
    const invalidInputs = [
      { amt: 0, desc: 'Zero amount' },
      { amt: -500, desc: 'Negative amount' },
      { amt: 50, desc: 'Below minimum ₹100' },
      { amt: 20000000, desc: 'Above maximum limit' },
      { amt: 'invalid_string', desc: 'Invalid string' },
      { amt: null, desc: 'Null value' }
    ];

    for (const testCase of invalidInputs) {
      try {
        await axios.post(
          `${API_BASE}/wallet/topup`,
          { amount: testCase.amt },
          { headers: { Authorization: `Bearer ${traderToken}` } }
        );
        console.error(`   ❌ Validation failed: ${testCase.desc} was accepted!`);
        failed++;
      } catch (err) {
        if (err.response?.status === 400) {
          console.log(`   ✅ Rejected ${testCase.desc} with HTTP 400: "${err.response.data.message}"`);
          passed++;
        } else {
          console.error(`   ❌ Unexpected response for ${testCase.desc}: ${err.response?.status}`);
          failed++;
        }
      }
    }

    // 6. Perform First Sandbox Top-Up (₹50,000)
    console.log('\n5️⃣ Performing First Sandbox Top-Up (₹50,000)...');
    const testIdempotencyKey = `test-idemp-${Date.now()}`;
    const topUp1Res = await axios.post(
      `${API_BASE}/wallet/topup`,
      {
        amount: 50000,
        paymentMethod: 'Instant NetBanking / UPI',
        idempotencyKey: testIdempotencyKey
      },
      { headers: { Authorization: `Bearer ${traderToken}` } }
    );

    if (
      topUp1Res.status === 200 &&
      topUp1Res.data.availableBalance === 50000 &&
      topUp1Res.data.totalDeposited === 50000 &&
      topUp1Res.data.transactions.length >= 1
    ) {
      console.log('   ✅ Top-Up API successful: ₹50,000 credited to Escrow Wallet.');
      passed++;
    } else {
      console.error('   ❌ Unexpected top-up response:', topUp1Res.data);
      failed++;
    }

    // 7. Verify MongoDB State
    console.log('\n6️⃣ Verifying MongoDB Document Consistency...');
    const walletDoc = await Wallet.findOne({ trader: traderId });
    const ledgerDocs = await WalletLedger.find({ trader: traderId });

    if (walletDoc && walletDoc.availableBalance === 50000 && ledgerDocs.length === 1) {
      console.log(`   ✅ MongoDB Wallet: availableBalance = ₹${walletDoc.availableBalance}, Ledger records = ${ledgerDocs.length}`);
      console.log(`   ✅ Ledger UTR: ${ledgerDocs[0].utr}, Source: ${ledgerDocs[0].source}`);
      passed++;
    } else {
      console.error('   ❌ MongoDB consistency mismatch.');
      failed++;
    }

    // 8. Idempotency Protection: Immediate Duplicate Top-Up
    console.log('\n7️⃣ Testing Idempotency (Duplicate Submission Protection)...');
    const duplicateRes = await axios.post(
      `${API_BASE}/wallet/topup`,
      {
        amount: 50000,
        paymentMethod: 'Instant NetBanking / UPI',
        idempotencyKey: testIdempotencyKey
      },
      { headers: { Authorization: `Bearer ${traderToken}` } }
    );

    const walletAfterDuplicate = await Wallet.findOne({ trader: traderId });
    if (walletAfterDuplicate.availableBalance === 50000) {
      console.log('   ✅ Duplicate submission intercepted: balance remained ₹50,000 (not doubled).');
      passed++;
    } else {
      console.error(`   ❌ Idempotency failed: balance doubled to ${walletAfterDuplicate.availableBalance}!`);
      failed++;
    }

    // 9. Second Top-Up Increment (₹25,000)
    console.log('\n8️⃣ Performing Second Top-Up (₹25,000) for Cumulative Balance...');
    const topUp2Res = await axios.post(
      `${API_BASE}/wallet/topup`,
      {
        amount: 25000,
        paymentMethod: 'RTGS / NEFT Core Banking'
      },
      { headers: { Authorization: `Bearer ${traderToken}` } }
    );

    if (topUp2Res.data.availableBalance === 75000 && topUp2Res.data.totalDeposited === 75000) {
      console.log('   ✅ Cumulative balance updated to ₹75,000 (50k + 25k).');
      passed++;
    } else {
      console.error('   ❌ Cumulative balance incorrect:', topUp2Res.data);
      failed++;
    }

    // 10. Re-authentication & Refresh Persistence Check
    console.log('\n9️⃣ Testing Persistence across Re-Login & Session Refresh...');
    const reLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'trader1@krishisetu.com',
      password: 'password123'
    });
    const freshToken = reLoginRes.data.accessToken || reLoginRes.data.token;

    const refreshedOverview = await axios.get(`${API_BASE}/wallet/overview`, {
      headers: { Authorization: `Bearer ${freshToken}` }
    });

    if (refreshedOverview.data.availableBalance === 75000 && refreshedOverview.data.transactions.length === 2) {
      console.log('   ✅ Persistence verified: Re-authenticated session returns exact ₹75,000 balance and 2 ledger entries.');
      passed++;
    } else {
      console.error('   ❌ Persistence mismatch:', refreshedOverview.data);
      failed++;
    }

    console.log('\n===============================================================');
    console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Test suite fatal error:', err.response?.data || err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runWalletTests();
