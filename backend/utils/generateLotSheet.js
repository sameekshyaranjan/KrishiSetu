/**
 * Flattens a Crop and Farmer document into a standardized Lot Sheet object.
 *
 * @param {Object} crop - The Mongoose Crop document
 * @param {Object} farmer - The Mongoose Farmer document
 * @returns {Object} - Flattened lot sheet
 */
const generateLotSheet = (crop, farmer) => {
  if (!crop || !farmer) {
    throw new Error('Both crop and farmer documents are required to generate a lot sheet.');
  }

  return {
    // Crop Details
    cropId: crop._id.toString(),
    cropName: crop.name,
    category: crop.category,
    quantity: crop.quantity,
    unit: crop.unit,
    basePrice: crop.basePrice,
    harvestStatus: crop.harvestStatus || 'post-harvest',
    expectedHarvestDate: crop.expectedHarvestDate || null,
    
    // Farmer Details
    farmerId: farmer._id.toString(),
    farmerName: farmer.name,
    farmerMobile: farmer.mobile,
    village: farmer.village || 'N/A',
    district: farmer.district || 'N/A',
    state: farmer.state || 'Karnataka',

    // Metadata
    generatedAt: new Date().toISOString()
  };
};

module.exports = { generateLotSheet };
