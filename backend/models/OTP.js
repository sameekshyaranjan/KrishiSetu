const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: [true, 'Please provide a mobile number'],
    match: [/^\d{10}$/, 'Please provide a valid 10-digit mobile number']
  },
  otp: {
    type: String,
    required: [true, 'Please provide the OTP']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 
  }
});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
