import api from './api'

// Benchmark Central and Karnataka State Agricultural Welfare Schemes
const OFFICIAL_SCHEMES_FALLBACK = [
  {
    _id: 's1',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Income Support',
    benefitSummary: '₹6,000 / year direct bank transfer in 3 installments',
    benefits: [
      '₹6,000 per annum paid in 3 equal installments of ₹2,000 directly via DBT',
      '100% centrally funded direct financial assistance',
      'Zero intermediaries — money deposited directly into Aadhaar-linked bank account'
    ],
    eligibility: [
      'Small and marginal farmer families with cultivable land',
      'Valid Aadhaar card linked to bank account',
      'Land ownership records verified in State Land Records'
    ],
    officialLink: 'https://pmkisan.gov.in',
    state: 'Central',
    isPublished: true
  },
  {
    _id: 's2',
    name: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Crop Insurance',
    benefitSummary: 'Up to 100% financial compensation for crop losses',
    benefits: [
      'Comprehensive insurance protection against natural calamities, drought, floods, and pests',
      'Extremely low farmer premium: 2% for Kharif crops, 1.5% for Rabi crops, 5% for commercial/horticultural crops',
      'Direct fast-track settlement into bank accounts via National Crop Insurance Portal'
    ],
    eligibility: [
      'All farmers growing notified crops in notified APMC areas',
      'Both loanee and non-loanee farmers eligible'
    ],
    officialLink: 'https://pmfby.gov.in',
    state: 'Central',
    isPublished: true
  },
  {
    _id: 's3',
    name: 'Kisan Credit Card (KCC) Scheme',
    ministry: 'Ministry of Finance & NABARD',
    category: 'Credit & Loans',
    benefitSummary: 'Low-interest crop loans up to ₹3,00,000 at 4% interest',
    benefits: [
      'Collateral-free agricultural loans up to ₹1,60,000 (and up to ₹3,00,000 with subvention)',
      'Effective interest rate of only 4% per annum upon prompt repayment',
      'Covers seeds, fertilizers, harvesting costs, and post-harvest storage expenses'
    ],
    eligibility: [
      'All individual farmers, joint borrowers, tenant farmers, and oral lessees',
      'Age between 18 and 75 years'
    ],
    officialLink: 'https://myscheme.gov.in/schemes/kcc',
    state: 'Central',
    isPublished: true
  },
  {
    _id: 's4',
    name: 'Karnataka Raitha Siri (Millet Incentive Scheme)',
    ministry: 'Department of Agriculture, Govt. of Karnataka',
    category: 'State Subsidy',
    benefitSummary: '₹10,000 / hectare financial incentive for minor millet cultivation',
    benefits: [
      'Direct incentive of ₹10,000 per hectare (up to maximum 2 hectares) for growing millets (Ragi, Navane, Same, Haraka)',
      'Aims to boost climate-resilient nutritious millet production in drought-prone districts',
      'Direct DBT credit into farmer bank accounts via Karnataka FRUITS portal'
    ],
    eligibility: [
      'Farmers residing and cultivating in Karnataka',
      'Registered with active Farmer ID (FID) on Karnataka FRUITS portal'
    ],
    officialLink: 'https://raitamitra.karnataka.gov.in',
    state: 'Karnataka',
    isPublished: true
  },
  {
    _id: 's5',
    name: 'PMKSY (Per Drop More Crop - Micro Irrigation)',
    ministry: 'Ministry of Jal Shakti',
    category: 'Irrigation',
    benefitSummary: 'Up to 55% government subsidy on Drip and Sprinkler systems',
    benefits: [
      '55% financial subsidy for Small and Marginal farmers, 45% for other farmers',
      'Reduces water consumption by up to 50% while boosting crop yield by 30-40%',
      'Covers precision irrigation infrastructure for sugarcane, vegetables, fruits, and pulses'
    ],
    eligibility: [
      'Farmers with confirmed water source and cultivable land ownership',
      'Member of water users association or individual landowner'
    ],
    officialLink: 'https://pmksy.gov.in',
    state: 'Central',
    isPublished: true
  },
  {
    _id: 's6',
    name: 'Soil Health Card Scheme',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Soil & Fertilizer',
    benefitSummary: 'Free soil testing report with crop-specific nutrient advice',
    benefits: [
      'Comprehensive report analyzing 12 essential soil parameters (N, P, K, pH, Zinc, Iron, Organic Carbon, etc.)',
      'Customized fertilizer dosage recommendations to reduce input costs and preserve soil fertility',
      'Issued free of charge every 2 years by State Agriculture Departments'
    ],
    eligibility: [
      'All landholder farmers across all Indian States and Union Territories'
    ],
    officialLink: 'https://soilhealth.dac.gov.in',
    state: 'Central',
    isPublished: true
  }
]

export const schemeService = {
  /**
   * Fetch all published welfare schemes from backend API
   */
  getSchemes: async () => {
    try {
      const res = await api.get('/schemes')
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data
      }
      return OFFICIAL_SCHEMES_FALLBACK
    } catch (err) {
      console.warn('[SchemeService] Backend unavailable, using cached official schemes data.')
      return OFFICIAL_SCHEMES_FALLBACK
    }
  }
}

export default schemeService
