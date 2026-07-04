const twilio = require('twilio');
const Farmer = require('../models/Farmer');
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
      // Mocking Mandi Prices
      const mockedPrices = farmer.cropsGrown.map(crop => {
        const fakePrice = Math.floor(Math.random() * 2000 + 1000);
        return getPriceMessage(crop, fakePrice, preferredLang);
      }).join('\n');
      
      messageBody = `${getHeaderMessage(preferredLang)}${mockedPrices}`;
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
