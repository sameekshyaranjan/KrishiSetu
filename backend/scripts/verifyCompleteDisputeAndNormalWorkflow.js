const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Trader = require('../models/Trader');
const Farmer = require('../models/Farmer');
const Crop = require('../models/Crop');
const Bid = require('../models/Bid');
const Transaction = require('../models/Transaction');
const Dispute = require('../models/Dispute');
const Wallet = require('../models/Wallet');
const WalletLedger = require('../models/WalletLedger');

async function runTest() {
  console.log('=== STEP 0: CONNECTING TO DATABASE ===');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✔ Connected to MongoDB Atlas');

  const trader = await Trader.findOne({ email: 'sandy.lynch@example.com' }) || await Trader.findOne();
  const farmer = await Farmer.findOne({ email: 'hope.schaefer-johnston@example.com' }) || await Farmer.findOne();
  
  if (!trader || !farmer) {
    throw new Error('Trader or Farmer not found in DB');
  }

  console.log(`✔ Trader: ${trader.name} (${trader._id})`);
  console.log(`✔ Farmer: ${farmer.name} (${farmer._id})`);

  // Ensure Trader has a wallet with enough balance
  let wallet = await Wallet.findOne({ trader: trader._id });
  if (!wallet) {
    wallet = await Wallet.create({
      trader: trader._id,
      availableBalance: 500000,
      lockedBalance: 0,
      totalDeposited: 500000
    });
  } else if (wallet.availableBalance < 100000) {
    wallet.availableBalance += 500000;
    await wallet.save();
  }
  console.log(`✔ Initial Trader Wallet: Available = ₹${wallet.availableBalance}, Locked = ₹${wallet.lockedBalance}, Disbursed = ₹${wallet.totalDisbursed}`);

  // Create JWT tokens
  const traderToken = jwt.sign(
    { id: String(trader._id), role: 'trader' },
    process.env.JWT_SECRET || 'your_super_secret_jwt_key_krishisetu_2026',
    { expiresIn: '1d' }
  );
  const adminToken = jwt.sign(
    { id: '6a99834ada2e96e0cacb9c0a', role: 'admin' },
    process.env.JWT_SECRET || 'your_super_secret_jwt_key_krishisetu_2026',
    { expiresIn: '1d' }
  );

  // -------------------------------------------------------------
  // PART 1: CONTROLLED TEST FOR TRADER DISPUTE & 100% FARMER PAYOUT
  // -------------------------------------------------------------
  console.log('\n=== PART 1: TRADER DISPUTE CREATION & PERSISTENCE ===');

  // Find or create an available crop
  let testCrop = await Crop.findOne({ farmer: farmer._id, status: 'available' });
  if (!testCrop) {
    testCrop = await Crop.create({
      farmer: farmer._id,
      name: 'Shimoga Organic Maize Test Lot',
      category: 'grains',
      quantity: 50,
      unit: 'quintal',
      basePrice: 1800,
      state: 'Karnataka',
      district: 'Shimoga',
      status: 'available'
    });
  }

  const disputeEscrowAmount = 45000;

  // Create Bid
  const bid1 = await Bid.create({
    crop: testCrop._id,
    farmer: farmer._id,
    trader: trader._id,
    amount: disputeEscrowAmount,
    status: 'accepted'
  });

  // Lock escrow in trader wallet
  wallet.availableBalance -= disputeEscrowAmount;
  wallet.lockedBalance += disputeEscrowAmount;
  await wallet.save();

  await WalletLedger.create({
    trader: trader._id,
    wallet: wallet._id,
    type: 'ESCROW_LOCK',
    amount: disputeEscrowAmount,
    balanceAfter: wallet.availableBalance,
    status: 'completed',
    paymentMethod: 'Escrow Vault Lock',
    description: `Escrow locked for ${testCrop.name}`,
    referenceId: String(bid1._id)
  });

  // Create Transaction (in transit)
  const tx1 = await Transaction.create({
    farmer: farmer._id,
    trader: trader._id,
    cropListing: testCrop._id,
    bid: bid1._id,
    amount: disputeEscrowAmount,
    paymentMethod: 'manual',
    paymentStatus: 'held_in_escrow',
    logisticsStatus: 'in_transit',
    vehicleDetails: {
      vehicleNumber: 'KA-14-EA-9912',
      vehicleType: 'Eicher 14ft Canter',
      driverName: 'Manjunath Gowda',
      driverContact: '9845012345',
      submittedAt: new Date()
    },
    dispatchedAt: new Date()
  });
  console.log(`✔ Transaction created: #${tx1._id} (Escrow: ₹${tx1.amount}, Logistics: ${tx1.logisticsStatus})`);

  // Ensure test upload file exists
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const testProofFile = path.join(uploadsDir, 'test_proof_sample.jpg');
  if (!fs.existsSync(testProofFile)) {
    fs.writeFileSync(testProofFile, 'TEST_IMAGE_BUFFER_DATA');
  }

  // Raise dispute via HTTP PUT /api/transactions/:id/dispute using FormData
  console.log('✔ Sending Trader Dispute submission with real photo proof...');
  const formData = new FormData();
  formData.append('reason', 'Severe moisture damage and mold detected across 40% of the consignment bags upon arrival at the weighbridge.');
  const fileBuffer = fs.readFileSync(testProofFile);
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
  formData.append('proofPhotos', blob, 'moisture_damage_proof.jpg');

  const disputeSubmitRes = await fetch(`http://localhost:5000/api/transactions/${tx1._id}/dispute`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${traderToken}`
    },
    body: formData
  });

  const disputeSubmitData = await disputeSubmitRes.json();
  console.log(`✔ HTTP Response: ${disputeSubmitRes.status}`, disputeSubmitData.message);

  if (disputeSubmitRes.status !== 201) {
    throw new Error(`Failed to submit dispute: ${JSON.stringify(disputeSubmitData)}`);
  }

  // Verify MongoDB document
  const savedDispute = await Dispute.findOne({ transaction: tx1._id });
  if (!savedDispute) {
    throw new Error('FATAL: Dispute document was NOT saved in MongoDB!');
  }
  console.log(`✔ PERSISTENCE VERIFIED IN MONGODB: Dispute #${savedDispute._id}`);
  console.log(`  - Status: ${savedDispute.status}`);
  console.log(`  - Escrow: ₹${savedDispute.escrowAmount}`);
  console.log(`  - Proof Photos: ${JSON.stringify(savedDispute.proofPhotos)}`);
  console.log(`  - Reason: "${savedDispute.reason}"`);

  // Verify transaction logistics is now 'disputed'
  const updatedTx1 = await Transaction.findById(tx1._id);
  console.log(`✔ Transaction Logistics Status: ${updatedTx1.logisticsStatus} (Escrow: ${updatedTx1.paymentStatus})`);
  if (updatedTx1.logisticsStatus !== 'disputed') {
    throw new Error('Transaction logistics status was not set to disputed!');
  }

  // -------------------------------------------------------------
  // PART 2: ADMIN DISPUTE RETRIEVAL VIA API
  // -------------------------------------------------------------
  console.log('\n=== PART 2: ADMIN DISPUTE RETRIEVAL API ===');
  const adminDisputesRes = await fetch('http://localhost:5000/api/admin/disputes', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const adminDisputesData = await adminDisputesRes.json();
  console.log(`✔ Admin Disputes Endpoint: Status ${adminDisputesRes.status}`);
  console.log(`✔ Disputes Returned Count: ${adminDisputesData.disputes?.length}`);
  
  const foundInAdmin = (adminDisputesData.disputes || []).find(d => String(d._id) === String(savedDispute._id));
  if (!foundInAdmin) {
    throw new Error('FATAL: Newly saved dispute was not returned in Admin disputes query!');
  }
  console.log(`✔ Admin retrieval verified for Dispute #${foundInAdmin._id}:`);
  console.log(`  - Trader Name: ${foundInAdmin.trader?.name} (Mobile: ${foundInAdmin.trader?.mobile})`);
  console.log(`  - Farmer Name: ${foundInAdmin.farmer?.name} (District: ${foundInAdmin.farmer?.district})`);
  console.log(`  - Consignment: ${foundInAdmin.cropListing?.name}`);
  console.log(`  - Photo URL: ${foundInAdmin.proofPhotos[0]}`);

  // -------------------------------------------------------------
  // PART 3: ADMIN RESOLUTION (100% PAYOUT TO FARMER)
  // -------------------------------------------------------------
  console.log('\n=== PART 3: ADMIN RESOLUTION - 100% PAYOUT TO FARMER ===');
  const resolveRes = await fetch(`http://localhost:5000/api/admin/disputes/${savedDispute._id}/resolve`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      action: 'payout_farmer',
      notes: 'Consignment inspected by APMC Mandi Officer. Quality complies with Fair Average Quality (FAQ) standards. 100% Escrow released to farmer.'
    })
  });

  const resolveData = await resolveRes.json();
  console.log(`✔ Resolve Response: Status ${resolveRes.status}`, resolveData.message);
  if (resolveRes.status !== 200) {
    throw new Error(`Failed to resolve dispute: ${JSON.stringify(resolveData)}`);
  }

  // Verify MongoDB after resolution
  const resolvedDispute = await Dispute.findById(savedDispute._id);
  console.log(`✔ Dispute New Status: ${resolvedDispute.status}`);
  console.log(`✔ Ruling:`, resolvedDispute.ruling);
  if (resolvedDispute.status !== 'resolved_payout_farmer') {
    throw new Error('Dispute status was not updated to resolved_payout_farmer');
  }

  // Verify Wallet updates
  const updatedWallet = await Wallet.findOne({ trader: trader._id });
  console.log(`✔ Trader Wallet after 100% Farmer Payout:`);
  console.log(`  - Locked Balance: ₹${updatedWallet.lockedBalance}`);
  console.log(`  - Total Disbursed: ₹${updatedWallet.totalDisbursed}`);

  // Verify WalletLedger
  const payoutLedger = await WalletLedger.findOne({
    trader: trader._id,
    type: 'PAYOUT_DISBURSED',
    referenceId: String(savedDispute._id)
  });
  if (!payoutLedger) {
    throw new Error('WalletLedger entry for PAYOUT_DISBURSED was not created!');
  }
  console.log(`✔ Ledger entry confirmed: Type ${payoutLedger.type}, Amount ₹${payoutLedger.amount}, Method: ${payoutLedger.paymentMethod}`);

  // Verify Transaction final status
  const finalizedTx1 = await Transaction.findById(tx1._id);
  console.log(`✔ Transaction Final State: Logistics = ${finalizedTx1.logisticsStatus}, Payment = ${finalizedTx1.paymentStatus}`);

  // -------------------------------------------------------------
  // PART 4: VERIFY DOUBLE RESOLUTION REJECTION
  // -------------------------------------------------------------
  console.log('\n=== PART 4: DOUBLE RESOLUTION PREVENTION TEST ===');
  const duplicateRes = await fetch(`http://localhost:5000/api/admin/disputes/${savedDispute._id}/resolve`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      action: 'refund_trader',
      notes: 'Attempting conflicting resolution'
    })
  });

  const duplicateData = await duplicateRes.json();
  console.log(`✔ Double Resolution HTTP Status: ${duplicateRes.status}`);
  console.log(`✔ Rejection Message: "${duplicateData.message}"`);
  if (duplicateRes.status !== 400) {
    throw new Error('Double resolution was NOT rejected with HTTP 400!');
  }

  // -------------------------------------------------------------
  // PART 5: VERIFY NORMAL DELIVERY WORKFLOW (NON-DISPUTED)
  // -------------------------------------------------------------
  console.log('\n=== PART 5: NORMAL DELIVERY WORKFLOW TEST ===');
  const normalEscrowAmount = 25000;

  // Ensure wallet has enough available balance
  updatedWallet.availableBalance -= normalEscrowAmount;
  updatedWallet.lockedBalance += normalEscrowAmount;
  await updatedWallet.save();

  const normalBid = await Bid.create({
    crop: testCrop._id,
    farmer: farmer._id,
    trader: trader._id,
    amount: normalEscrowAmount,
    status: 'accepted'
  });

  const normalTx = await Transaction.create({
    farmer: farmer._id,
    trader: trader._id,
    cropListing: testCrop._id,
    bid: normalBid._id,
    amount: normalEscrowAmount,
    paymentMethod: 'manual',
    paymentStatus: 'held_in_escrow',
    logisticsStatus: 'in_transit',
    vehicleDetails: {
      vehicleNumber: 'KA-04-MB-1122',
      vehicleType: 'Tata 407',
      driverName: 'Ramesh Gowda',
      submittedAt: new Date()
    },
    dispatchedAt: new Date()
  });
  console.log(`✔ Normal order created: #${normalTx._id} (Escrow: ₹${normalTx.amount}, Logistics: ${normalTx.logisticsStatus})`);

  // Trader confirms delivery
  const confirmRes = await fetch(`http://localhost:5000/api/transactions/${normalTx._id}/confirm-delivery`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${traderToken}`
    },
    body: JSON.stringify({})
  });

  const confirmData = await confirmRes.json();
  console.log(`✔ Confirm Delivery HTTP Status: ${confirmRes.status}`, confirmData.message);
  if (confirmRes.status !== 200) {
    throw new Error(`Confirm delivery failed: ${JSON.stringify(confirmData)}`);
  }

  const finalizedNormalTx = await Transaction.findById(normalTx._id);
  console.log(`✔ Normal Transaction Completed: Logistics = ${finalizedNormalTx.logisticsStatus}, Payment = ${finalizedNormalTx.paymentStatus}`);
  if (finalizedNormalTx.logisticsStatus !== 'delivered' || finalizedNormalTx.paymentStatus !== 'payout_released') {
    throw new Error('Normal delivery confirmation did not update logistics/payment status properly');
  }

  console.log('\n======================================================');
  console.log('🎉 ALL TESTS PASSED: COMPLETE DISPUTE & ESCROW WORKFLOW FULLY VERIFIED!');
  console.log('======================================================');
  process.exit(0);
}

runTest().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
