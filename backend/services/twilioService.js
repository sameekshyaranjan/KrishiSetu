const twilio = require('twilio');
const Farmer = require('../models/Farmer');
const MandiPrice = require('../models/MandiPrice');
const { getPriceMessage, getFallbackMessage, getMissingCropsMessage, getHeaderMessage } = require('../utils/smsTemplates');

const sendPricesSMS = async (mobile, language = 'en') => {
  try {
    const farmer = await Farmer.findOne({ mobile });

    let messageBody = '';
    
    // If the farmer exists, use their preferred language. Otherwise use the passed language or fallback to 'en'.
    const preferredLang = farmer ? farmer.language : language;

    if (!farmer) {
      messageBody = getFallbackMessage(preferredLang);
    } else if (!farmer.cropsGrown || farmer.cropsGrown.length === 0) {
      messageBody = getMissingCropsMessage(farmer.name, preferredLang);
    } else {
      // Fetch live prices from MongoDB for the farmer's district
      const prices = await MandiPrice.find({
        district: farmer.district,
        commodity: { $in: farmer.cropsGrown }
      }).sort({ arrivalDate: -1 });

      if (prices.length === 0) {
        messageBody = `No prices available today for your crops in ${farmer.district}.`;
      } else {
        // Group by commodity to only send the latest price per crop
        const latestPrices = {};
        for (const p of prices) {
          if (!latestPrices[p.commodity]) {
            latestPrices[p.commodity] = p.modalPrice;
          }
        }

        const priceStrings = Object.keys(latestPrices).map(crop => {
          return getPriceMessage(crop, latestPrices[crop], preferredLang);
        }).join('\n');
        
        messageBody = `${getHeaderMessage(preferredLang)}${priceStrings}`;
      }
    }

    // Development Mock: Bypass Twilio
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n=================================`);
      console.log(`[DEV TWILIO MOCK] SMS to: ${mobile}`);
      console.log(`[DEV TWILIO MOCK] Message: \n${messageBody}`);
      console.log(`=================================\n`);
      return true;
    }

    // Production: Real Twilio SMS
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${mobile}`
    });

    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

module.exports = { sendPricesSMS };
