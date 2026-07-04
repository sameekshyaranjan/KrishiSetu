const getPriceMessage = (crop, price, language = 'en') => {
  const templates = {
    en: `Today's price for ${crop}: ₹${price}/Quintal`,
    hi: `आज का ${crop} का भाव: ₹${price}/क्विंटल`,
    kn: `ಇಂದಿನ ${crop} ಬೆಲೆ: ₹${price}/ಕ್ವಿಂಟಲ್`
  };

  // Fallback to English if language is not supported
  return templates[language] || templates['en'];
};

const getFallbackMessage = (language = 'en') => {
  const templates = {
    en: 'Please register on KrishiSetu to receive live Mandi prices for your crops.',
    hi: 'अपनी फसलों के लिए लाइव मंडी भाव प्राप्त करने के लिए कृपया कृषिसेतु पर पंजीकरण करें।',
    kn: 'ನಿಮ್ಮ ಬೆಳೆಗಳಿಗೆ ಲೈವ್ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ಪಡೆಯಲು ದಯವಿಟ್ಟು ಕೃಷಿಸೇತು ನಲ್ಲಿ ನೋಂದಾಯಿಸಿ.'
  };
  return templates[language] || templates['en'];
};

const getMissingCropsMessage = (name, language = 'en') => {
  const templates = {
    en: `Hello ${name}, please update your profile with the crops you grow to receive daily prices.`,
    hi: `नमस्ते ${name}, दैनिक भाव प्राप्त करने के लिए कृपया अपनी प्रोफ़ाइल में अपनी फसलें अपडेट करें।`,
    kn: `ನಮಸ್ಕಾರ ${name}, ದೈನಂದಿನ ಬೆಲೆಗಳನ್ನು ಪಡೆಯಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ನಲ್ಲಿ ನೀವು ಬೆಳೆಯುವ ಬೆಳೆಗಳನ್ನು ನವೀಕರಿಸಿ.`
  };
  return templates[language] || templates['en'];
};

const getHeaderMessage = (language = 'en') => {
  const templates = {
    en: 'KrishiSetu Karnataka APMC Live Prices:\n',
    hi: 'कृषिसेतु कर्नाटक एपीएमसी लाइव भाव:\n',
    kn: 'ಕೃಷಿಸೇತು ಕರ್ನಾಟಕ ಎಪಿಎಂಸಿ ಲೈವ್ ಬೆಲೆಗಳು:\n'
  };
  return templates[language] || templates['en'];
};

module.exports = {
  getPriceMessage,
  getFallbackMessage,
  getMissingCropsMessage,
  getHeaderMessage
};
