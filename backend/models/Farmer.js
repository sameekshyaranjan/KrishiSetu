const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const farmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide the farmer name'],
    index: true
  },
  mobile: {
    type: String,
    required: [true, 'Please provide a mobile number'],
    unique: true,
    match: [/^\d{10}$/, 'Please provide a valid 10-digit mobile number']
  },
  village: {
    type: String
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
  cropsGrown: [{
    type: String
  }],
  landArea: {
    type: Number
  },
  sowingSeason: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    default: 'kn'
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

farmerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

farmerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Farmer = mongoose.model('Farmer', farmerSchema);

module.exports = Farmer;
