const { sendPricesSMS } = require('../services/twilioService');

exports.handleMissedCall = async (req, res, next) => {
  try {
    // Twilio sends form-urlencoded data. 'From' is the caller's phone number.
    const { From } = req.body;
    
    if (From) {
      // Strip country code (e.g., +919876543210 -> 9876543210)
      // Note: In production you might want a more robust phone parser
      const mobile = From.replace('+91', '');
      
      // Trigger the SMS in the background (no need to await since Twilio expects immediate response)
      sendPricesSMS(mobile, 'en');
    }

    // Return empty TwiML so Twilio hangs up immediately and doesn't charge the caller
    res.type('text/xml');
    res.send('<Response></Response>');
  } catch (error) {
    console.error('Missed Call Error:', error);
    // Still return empty TwiML on error to gracefully hang up
    res.type('text/xml');
    res.send('<Response></Response>');
  }
};
