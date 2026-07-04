const twilio = require('twilio');
const Farmer = require('../models/Farmer');
// Note: We don't have a MandiPrice model yet, so we will stub the prices for now
// const MandiPrice = require('../models/MandiPrice'); 

const sendPricesSMS = async (mobile, language = 'en') => {
  try {
    const farmer = await Farmer.findOne({ mobile });

    let messageBody = '';
    
    if (!farmer) {
      messageBody = 'Please register on KrishiSetu to receive live Mandi prices for your crops.';
    } else if (!farmer.cropsGrown || farmer.cropsGrown.length === 0) {
      messageBody = `Hello ${farmer.name}, please update your profile with the crops you grow to receive daily prices.`;
    } else {
      // Mocking Mandi Prices since we haven't built the scraping engine yet
      const mockedPrices = farmer.cropsGrown.map(crop => `${crop}: ₹${Math.floor(Math.random() * 2000 + 1000)}/Q`).join(', ');
      messageBody = `KrishiSetu Karnataka APMC Live Prices:\n${mockedPrices}`;
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
