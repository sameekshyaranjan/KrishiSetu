const GovernmentScheme = require('../models/GovernmentScheme');

const fetchSchemesFromGov = () => {
  return [
    {
      name: 'PM Kisan Samman Nidhi (PM-KISAN)',
      portal: 'pmkisan.gov.in',
      category: 'Direct Income Support',
      purpose: 'Direct financial income support of ₹6,000 per annum provided to all landholding farmer families across India.',
      eligibility: 'All landholding farmer families with cultivable land recorded in state revenue/Bhoomi RTC registers.',
      benefits: '₹6,000 per year transferred directly in three equal installments of ₹2,000 via Aadhaar-linked DBT.',
      officialLink: 'https://pmkisan.gov.in'
    },
    {
      name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      portal: 'pmfby.gov.in',
      category: 'Crop Insurance & Risk Shield',
      purpose: 'Comprehensive financial protection and insurance against yield loss from unseasonal drought, flood, hail, and pest infestation.',
      eligibility: 'All farmers including sharecroppers and tenant farmers growing notified seasonal crops.',
      benefits: 'Comprehensive crop insurance with nominal premium (2% Kharif, 1.5% Rabi); remaining 98% premium subsidized by government.',
      officialLink: 'https://pmfby.gov.in'
    },
    {
      name: 'Soil Health Card Scheme',
      portal: 'soilhealth.dac.gov.in',
      category: 'Soil Health & Nutrients',
      purpose: 'Periodic assessment of soil macro and micronutrient fertility to optimize fertilizer applications and preserve soil biological health.',
      eligibility: 'All agricultural landowners and cultivators across Karnataka and India.',
      benefits: 'Free laboratory soil test report every 2 years with crop-wise nutrient dosage advisories to lower cultivation cost.',
      officialLink: 'https://soilhealth.dac.gov.in'
    },
    {
      name: 'Karnataka Raitha Siri Scheme',
      portal: 'raitamitra.karnataka.gov.in',
      category: 'Millet & Dryland Incentive',
      purpose: 'Direct financial incentive to encourage minor millet cultivation (Ragi, Foxtail Millet, Little Millet) in rainfed districts.',
      eligibility: 'Dryland farmers cultivating minor millets in recognized drought-prone taluks of Karnataka.',
      benefits: 'Direct DBT incentive of ₹10,000 per hectare credited to the farmer bank account upon biometric verification.',
      officialLink: 'https://raitamitra.karnataka.gov.in'
    },
    {
      name: 'Krishi Bhagya Scheme (Farm Ponds & Micro-Irrigation)',
      portal: 'raitamitra.karnataka.gov.in',
      category: 'Water Security & Irrigation',
      purpose: 'Construction of on-farm polyhouse-lined rainwater harvesting ponds and installation of energy-efficient micro-irrigation systems.',
      eligibility: 'Rainfed landholders in 131 drought-vulnerable taluks of Karnataka.',
      benefits: '80% capital subsidy for general farmers and up to 90% subsidy for SC/ST farmers for pond lining and sprinkler systems.',
      officialLink: 'https://raitamitra.karnataka.gov.in/krishibhagya'
    },
    {
      name: 'Surya Raitha Scheme (Solar Agricultural Pumpsets)',
      portal: 'kredl.karnataka.gov.in',
      category: 'Renewable Solar Power',
      purpose: 'Replacement of conventional grid/diesel pumpsets with standalone solar agricultural pumps with grid net-metering feed-in tariffs.',
      eligibility: 'Farmers with dedicated irrigation borewells or canal draw points in rural Karnataka.',
      benefits: '60% capital grant subsidy with guaranteed buyback of surplus solar power generation at state-notified feed-in tariffs.',
      officialLink: 'https://kredl.karnataka.gov.in'
    },
    {
      name: 'Paramparagat Krishi Vikas Yojana (PKVY - Organic Farming)',
      portal: 'agricoop.nic.in',
      category: 'Organic Agriculture',
      purpose: 'Promotion of traditional organic agricultural practices, PGS-India certification, and cluster-based organic value chains.',
      eligibility: 'Groups and clusters of 50 or more farmers having 50 acres contiguous land.',
      benefits: 'Financial grant of ₹50,000 per hectare for 3 years covering organic inputs, quality testing, and PGS packaging.',
      officialLink: 'https://agricoop.nic.in'
    },
    {
      name: 'Kisan Credit Card (KCC) Concessional Agriloan',
      portal: 'kcc.dac.gov.in',
      category: 'Credit & Working Capital',
      purpose: 'Institutional short-term working capital credit for seeds, fertilizers, tractor rentals, and post-harvest produce holding.',
      eligibility: 'All farmers, joint liability groups, self-help groups, and tenant farmers.',
      benefits: 'Collateral-free credit limit up to ₹3 Lakh at an effective interest rate of 4% per annum upon timely repayment.',
      officialLink: 'https://kcc.dac.gov.in'
    }
  ];
};

const saveSchemesToDB = async () => {
  const schemes = fetchSchemesFromGov();
  const results = [];
  
  for (const scheme of schemes) {
    const existing = await GovernmentScheme.findOne({ name: scheme.name });
    if (!existing) {
      const created = await GovernmentScheme.create({
        ...scheme,
        status: 'pending',
        isPublished: false
      });
      results.push(created);
    } else {
      // Keep existing status & publication state set by admin
      existing.portal = scheme.portal;
      existing.category = scheme.category;
      existing.purpose = scheme.purpose;
      existing.eligibility = scheme.eligibility;
      existing.benefits = scheme.benefits;
      existing.officialLink = scheme.officialLink;
      await existing.save();
      results.push(existing);
    }
  }

  console.log(`[schemeService] Synchronized ${results.length} official government schemes from .gov.in / .nic.in portals.`);
  return results;
};

module.exports = { fetchSchemesFromGov, saveSchemesToDB };
