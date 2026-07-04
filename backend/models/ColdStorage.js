const mongoose = require('mongoose');

const karnatakaDistricts = [
  'Bagalkot', 'Bengaluru Urban', 'Bengaluru Rural', 'Belagavi', 'Ballari', 
  'Bidar', 'Vijayapura', 'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 
  'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 
  'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 
  'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 
  'Yadgir', 'Vijayanagara'
];

const coldStorageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Storage name is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    enum: {
      values: karnatakaDistricts,
      message: 'Invalid district. Only Karnataka districts are supported.'
    }
  },
  state: {
    type: String,
    required: true,
    enum: ['Karnataka'],
    default: 'Karnataka'
  },
  capacity: {
    type: Number, // In Metric Tons
    required: true
  },
  costPerDay: {
    type: Number, // In INR
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  isGovernmentOwned: {
    type: Boolean,
    default: false
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }
}, { timestamps: true });

// Stage 59: Geospatial Index
coldStorageSchema.index({ location: '2dsphere' });

const ColdStorage = mongoose.model('ColdStorage', coldStorageSchema);

module.exports = ColdStorage;
