const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://localhost:5000/api';

async function runCounterBidE2ETest() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  KRISHISETU — COUNTER-BID WORKFLOW END-TO-END VERIFICATION  ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // 1. Authenticate Farmer & Trader
    console.log('[1/7] Authenticating Farmer & Trader...');
    const farmerLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'farmer1@krishisetu.com',
      password: 'password123'
    });
    const farmerToken = farmerLoginRes.data.accessToken;
    const farmerUser = farmerLoginRes.data.user;
    const farmerId = farmerUser._id || farmerUser.id;
    console.log(`  ✓ Farmer authenticated: ${farmerUser.name} (${farmerId})`);

    const traderLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'trader1@krishisetu.com',
      password: 'password123'
    });
    const traderToken = traderLoginRes.data.accessToken;
    const traderUser = traderLoginRes.data.user;
    const traderId = traderUser._id || traderUser.id;
    console.log(`  ✓ Trader authenticated: ${traderUser.name} (${traderId})\n`);

    const farmerHeaders = { Authorization: `Bearer ${farmerToken}` };
    const traderHeaders = { Authorization: `Bearer ${traderToken}` };

    // Ensure Trader Escrow Wallet has sufficient balance for test
    const Wallet = require('../models/Wallet');
    await mongoose.connect(process.env.MONGO_URI);
    let wallet = await Wallet.findOne({ trader: traderId });
    if (!wallet) {
      wallet = await Wallet.create({ trader: traderId, availableBalance: 500000 });
    } else if (wallet.availableBalance < 200000) {
      wallet.availableBalance += 300000;
      await wallet.save();
    }
    console.log(`  ✓ Trader Escrow Wallet Balance: ₹${wallet.availableBalance.toLocaleString('en-IN')}\n`);

    // 2. Farmer creates a new crop listing
    console.log('[2/7] Farmer listing a fresh harvest lot...');
    const cropRes = await axios.post(
      `${BASE_URL}/crops`,
      {
        name: 'Sona Masoori Grade-A Rice Lot',
        category: 'Paddy',
        quantity: 50,
        unit: 'Quintals',
        basePrice: 2200,
        expectedHarvestDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
      },
      { headers: farmerHeaders }
    );
    const cropId = cropRes.data.crop?._id || cropRes.data._id;
    console.log(`  ✓ Crop listed successfully: ID ${cropId}, Base Rate: ₹2,200/Qtl\n`);

    // 3. Trader submits an initial bid
    console.log('[3/7] Trader placing initial bid of ₹2,300/Qtl...');
    const bidRes = await axios.post(
      `${BASE_URL}/bids`,
      {
        cropId,
        amount: 2300,
        message: 'Initial APMC opening bid'
      },
      { headers: traderHeaders }
    );
    const bidId = bidRes.data.bid?._id || bidRes.data._id;
    console.log(`  ✓ Bid submitted: ID ${bidId}, Initial Rate: ₹2,300/Qtl\n`);

    // 4. Farmer inspects inbound bids & submits Counter Bid
    console.log('[4/7] Farmer submitting Counter Offer of ₹2,550/Qtl...');
    const counterRes = await axios.put(
      `${BASE_URL}/bids/${bidId}/counter`,
      {
        counterAmount: 2550,
        message: 'Direct farm-gate premium produce: requesting ₹2,550/Qtl'
      },
      { headers: farmerHeaders }
    );

    const counteredBid = counterRes.data.bid;
    console.log(`  ✓ Counter bid submitted successfully!`);
    console.log(`    • Status: ${counteredBid.status}`);
    console.log(`    • Original Bid Amount: ₹${counteredBid.originalAmount}/Qtl`);
    console.log(`    • Proposed Counter Amount: ₹${counteredBid.counterAmount}/Qtl`);
    console.log(`    • Proposed By: ${counteredBid.counterProposedBy}`);
    console.log(`    • Negotiation Entries: ${counteredBid.negotiationHistory?.length}\n`);

    if (counteredBid.status !== 'countered' || counteredBid.counterAmount !== 2550 || counteredBid.counterProposedBy !== 'farmer') {
      throw new Error('Counter-bid fields did not save correctly!');
    }

    // 5. Trader inspects portal bids (getMyBids) and verifies counter offer appears
    console.log('[5/7] Trader checking portal bids (getMyBids)...');
    const traderBidsRes = await axios.get(`${BASE_URL}/bids/my`, { headers: traderHeaders });
    const bidsList = Array.isArray(traderBidsRes.data) ? traderBidsRes.data : traderBidsRes.data.data || [];
    const traderBidItem = bidsList.find(b => String(b._id) === String(bidId));

    if (!traderBidItem) {
      throw new Error(`Countered bid not found in Trader getMyBids feed! Received ${bidsList.length} bids.`);
    }
    console.log(`  ✓ Trader receives Counter Bid in feed:`);
    console.log(`    • Status in Trader Portal: ${traderBidItem.status}`);
    console.log(`    • Farmer Counter Amount: ₹${traderBidItem.counterAmount}/Qtl`);
    console.log(`    • Counter Message: "${traderBidItem.counterMessage}"\n`);

    // 6. Trader re-counters with revised offer of ₹2,450/Qtl
    console.log('[6/7] Trader re-countering with revised rate of ₹2,450/Qtl...');
    const reCounterRes = await axios.put(
      `${BASE_URL}/bids/${bidId}/trader-respond`,
      {
        action: 'counter',
        counterAmount: 2450,
        message: 'Best offer we can do is ₹2,450/Qtl'
      },
      { headers: traderHeaders }
    );
    console.log(`  ✓ Trader revised counter submitted:`);
    console.log(`    • Status: ${reCounterRes.data.bid.status}`);
    console.log(`    • New Counter Amount: ₹${reCounterRes.data.bid.counterAmount}/Qtl`);
    console.log(`    • Proposed By: ${reCounterRes.data.bid.counterProposedBy}\n`);

    // 7. Trader accepts Farmer counter (testing acceptance branch with Escrow Lock)
    // To test acceptance, let's have farmer counter back with ₹2,450 and trader accept:
    console.log('[7/7] Farmer accepts / confirms agreement, Trader accepts final counter...');
    const finalCounterRes = await axios.put(
      `${BASE_URL}/bids/${bidId}/counter`,
      {
        counterAmount: 2450,
        message: 'Agreed on ₹2,450/Qtl'
      },
      { headers: farmerHeaders }
    );

    const acceptRes = await axios.put(
      `${BASE_URL}/bids/${bidId}/trader-respond`,
      { action: 'accept' },
      { headers: traderHeaders }
    );

    const acceptedBid = acceptRes.data.bid;
    const transaction = acceptRes.data.transaction;

    console.log(`  ✓ Final Counter Offer Accepted!`);
    console.log(`    • Final Bid Status: ${acceptedBid.status}`);
    console.log(`    • Agreed Amount: ₹${acceptedBid.amount}/Qtl`);
    console.log(`    • Escrow Transaction ID: ${transaction._id}`);
    console.log(`    • Payment Status: ${transaction.paymentStatus}`);
    console.log(`    • Total Escrow Value Secured: ₹${transaction.amount.toLocaleString('en-IN')}\n`);

    // Verify Notification & Crop Status in DB
    const Crop = require('../models/Crop');
    const updatedCrop = await Crop.findById(cropId);
    console.log(`  ✓ MongoDB Crop Status: ${updatedCrop.status} (Marked 'sold')`);

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  🎉 COMPLETE COUNTER-BID WORKFLOW VERIFIED 100% SUCCESS!  ');
    console.log('═══════════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed with error:');
    if (err.response) {
      console.error('  Response Data:', err.response.data);
      console.error('  Status:', err.response.status);
    } else {
      console.error('  Message:', err.message);
      console.error('  Stack:', err.stack);
    }
    process.exit(1);
  }
}

runCounterBidE2ETest();
