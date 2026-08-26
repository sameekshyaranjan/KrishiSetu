const { createObjectCsvStringifier } = require('csv-writer');
const Transaction = require('../models/Transaction');

const exportMyTransactionsCSV = async (req, res, next) => {
  try {
    const role = req.user.role;
    const filter = role === 'farmer' ? { farmer: req.user.id } : { trader: req.user.id };

    const transactions = await Transaction.find(filter)
      .populate('cropListing', 'name category quantity unit')
      .populate('farmer', 'name mobile district state')
      .populate('trader', 'name companyName mobile')
      .sort({ transactionDate: -1 });

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'txId', title: 'Transaction ID' },
        { id: 'date', title: 'Date' },
        { id: 'crop', title: 'Crop' },
        { id: 'category', title: 'Category' },
        { id: 'quantity', title: 'Quantity' },
        { id: 'amount', title: 'Amount (INR)' },
        { id: 'counterparty', title: 'Counterparty' },
        { id: 'counterpartyPhone', title: 'Counterparty Phone' },
        { id: 'paymentStatus', title: 'Payment Status' },
        { id: 'logisticsStatus', title: 'Logistics Status' },
        { id: 'paymentMethod', title: 'Payment Method' }
      ]
    });

    const records = transactions.map(tx => {
      const isFarmer = role === 'farmer';
      const otherUser = isFarmer ? tx.trader : tx.farmer;
      const counterpartyName = isFarmer 
        ? (otherUser?.companyName || otherUser?.name || 'N/A')
        : (otherUser?.name || 'N/A');

      return {
        txId: tx._id.toString(),
        date: tx.transactionDate ? new Date(tx.transactionDate).toISOString().split('T')[0] : 'N/A',
        crop: tx.cropListing?.name || 'N/A',
        category: tx.cropListing?.category || 'N/A',
        quantity: tx.cropListing?.quantity ? `${tx.cropListing.quantity} ${tx.cropListing.unit || 'quintal'}` : 'N/A',
        amount: tx.amount || 0,
        counterparty: counterpartyName,
        counterpartyPhone: otherUser?.mobile || 'N/A',
        paymentStatus: tx.paymentStatus || 'pending',
        logisticsStatus: tx.logisticsStatus || 'pending',
        paymentMethod: tx.paymentMethod || 'manual'
      };
    });

    const csvData = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="transactions_${Date.now()}.csv"`);
    return res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};

module.exports = { exportMyTransactionsCSV };
