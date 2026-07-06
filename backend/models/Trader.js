const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const traderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide the trader name']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  mobile: {
    type: String,
    required: [true, 'Please provide a mobile number'],
    unique: true,
    match: [/^\d{10}$/, 'Please provide a valid 10-digit mobile number']
  },
  district: {
    type: String,
    required: true,
    index: true,
    enum: ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Hubballi', 'Dharwad', 'Belagavi', 'Mangaluru', 'Tumakuru', 'Mandya', 'Hassan', 'Kalaburagi', 'Raichur', 'Ballari']
  },
  state: {
    type: String,
    default: 'Karnataka',
    enum: ['Karnataka']
  },
  companyName: {
    type: String
  },
  licenseNumber: {
    type: String
  },
  apmcAffiliation: {
    type: String
  },
  operatingLocations: [{
    type: String
  }],
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  documents: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  penaltyCount: {
    type: Number,
    default: 0
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

traderSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

traderSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Trader = mongoose.model('Trader', traderSchema);

module.exports = Trader;
