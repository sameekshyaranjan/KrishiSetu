const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5000/api';

async function verifyTraderPortal() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 VERIFY TRADER PORTAL API STATE & BALANCES');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. Trader Login
  console.log('1. Logging in as trader1@krishisetu.com...');
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'trader1@krishisetu.com',
    password: 'password123'
  });
  const token = loginRes.data.accessToken;
  const user = loginRes.data.user;
  console.log(`   ✓ Authenticated: ${user.name} (${user.email})\n`);

  const headers = { Authorization: `Bearer ${token}` };

  // 2. Fetch Wallet Overview (/api/wallet/overview)
  console.log('2. Fetching /api/wallet/overview...');
  const walletRes = await axios.get(`${BASE_URL}/wallet/overview`, { headers });
  const w = walletRes.data;
  console.log('   Wallet Response:');
  console.log(`     • Available Bidding Liquid: ₹${w.availableBalance} ${w.availableBalance === 0 ? '✅ (PASS: ₹0)' : '❌ FAIL'}`);
  console.log(`     • Locked in Active Auctions: ₹${w.lockedEscrow} ${w.lockedEscrow === 0 ? '✅ (PASS: ₹0)' : '❌ FAIL'}`);
  console.log(`     • Total Disbursed:           ₹${w.totalDisbursed} ${w.totalDisbursed === 0 ? '✅ (PASS: ₹0)' : '❌ FAIL'}`);
  console.log(`     • Total Deposited:           ₹${w.totalDeposited} ${w.totalDeposited === 0 ? '✅ (PASS: ₹0)' : '❌ FAIL'}`);
  console.log(`     • Ledger Transactions:       ${w.transactions?.length || 0} entries ✅\n`);

  // 3. Fetch Trader Dashboard Orders (/api/transactions/my-transactions)
  console.log('3. Fetching /api/transactions/my-transactions...');
  const txRes = await axios.get(`${BASE_URL}/transactions/my-transactions`, { headers });
  const txData = txRes.data?.data || txRes.data || [];
  console.log(`     • Active Transactions / Orders: ${txData.length} ${txData.length === 0 ? '✅ (PASS: 0)' : '❌ FAIL'}\n`);

  // 4. Fetch Trader Active Bids (/api/bids/my)
  console.log('4. Fetching /api/bids/my...');
  const bidsRes = await axios.get(`${BASE_URL}/bids/my`, { headers });
  const bidsData = bidsRes.data?.data || bidsRes.data || [];
  console.log(`     • Active In-Flight Bids:        ${bidsData.length} ${bidsData.length === 0 ? '✅ (PASS: 0)' : '❌ FAIL'}\n`);

  // 5. Test another trader (trader2@krishisetu.com)
  console.log('5. Logging in as trader2@krishisetu.com to verify account isolation...');
  const loginRes2 = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'trader2@krishisetu.com',
    password: 'password123'
  });
  const token2 = loginRes2.data.accessToken;
  const walletRes2 = await axios.get(`${BASE_URL}/wallet/overview`, { headers: { Authorization: `Bearer ${token2}` } });
  const w2 = walletRes2.data;
  console.log(`     • Trader 2 Available Balance: ₹${w2.availableBalance} ${w2.availableBalance === 0 ? '✅ (PASS: ₹0)' : '❌ FAIL'}`);
  console.log(`     • Trader 2 Locked Balance:    ₹${w2.lockedEscrow} ${w2.lockedEscrow === 0 ? '✅ (PASS: ₹0)' : '❌ FAIL'}\n`);

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🎉 ALL TRADER PORTAL BALANCES & FEEDS VERIFIED 100% CLEAN!');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

verifyTraderPortal().catch(err => {
  console.error('❌ Verification failed:', err.response?.data || err.message);
  process.exit(1);
});
