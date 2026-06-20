const GovernmentScheme = require('../models/GovernmentScheme');

// Mock function representing scraping government websites with axios and cheerio
const fetchSchemesFromGov = () => {
  // In reality, this would use axios to fetch HTML and cheerio to parse it.
  // For now, we return mock data that simulates the scraped result.
  return [
    {
      name: 'PM Kisan Samman Nidhi (PM-KISAN)',
      purpose: 'Provide income support to all landholding farmer families.',
      eligibility: 'All landholding farmer families subject to certain exclusion criteria.',
      benefits: '₹6000 per year transferred in three equal installments of ₹2000.',
      officialLink: 'https://pmkisan.gov.in'
    },
    {
      name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      purpose: 'Provide insurance coverage and financial support to farmers in the event of crop failure.',
      eligibility: 'All farmers including sharecroppers and tenant farmers growing notified crops.',
      benefits: 'Insurance cover against crop failure due to natural calamities, pests, or diseases at subsidized premium rates.',
      officialLink: 'https://pmfby.gov.in'
    },
    {
      name: 'Soil Health Card Scheme',
      purpose: 'Provide farmers with soil nutrient status and recommendations on appropriate dosage of nutrients.',
      eligibility: 'All farmers.',
      benefits: 'Improves soil health, reduces cultivation cost, and increases yield.',
      officialLink: 'https://soilhealth.dac.gov.in'
    }
  ];
};

const saveSchemesToDB = async () => {
  const schemes = fetchSchemesFromGov();
  
  for (const scheme of schemes) {
    // Upsert the scheme by name. We set isPublished to false explicitly 
    // so the admin must review the newly scraped schemes.
    await GovernmentScheme.findOneAndUpdate(
      { name: scheme.name },
      { ...scheme, isPublished: false },
      { upsert: true, returnDocument: 'after' }
    );
  }

  console.log(`Government schemes updated: ${schemes.length} records scraped and saved as drafts.`);
};

module.exports = { fetchSchemesFromGov, saveSchemesToDB };
