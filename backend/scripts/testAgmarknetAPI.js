const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const testAgmarknetAPI = async () => {
  const apiKey = (process.env.AGMARKNET_API_KEY || '').trim();
  const resourceId = process.env.AGMARKNET_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070';

  console.log(`Resource ID: ${resourceId}`);
  console.log(`API Key configured: ${apiKey ? apiKey.substring(0, 6) + '...' + apiKey.slice(-4) : 'NONE'}`);

  try {
    // 1. Fetch Karnataka records with filter
    const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&filters[state]=Karnataka&limit=10`;
    console.log(`\nQuerying URL: https://api.data.gov.in/resource/${resourceId}?api-key=[HIDDEN]&format=json&filters[state]=Karnataka&limit=10`);
    
    const res = await axios.get(url, { timeout: 20000 });
    console.log('Response Status:', res.status);
    console.log('Total available matching records:', res.data.total);
    console.log('Returned records count:', res.data.records?.length);
    console.log('Fields schema:', res.data.field?.map(f => f.name || f.id || f));
    console.log('\nSample Record:');
    console.log(JSON.stringify(res.data.records?.[0], null, 2));

    console.log('\nFirst 5 Records:');
    res.data.records?.slice(0, 5).forEach((r, idx) => {
      console.log(`[${idx+1}] State: "${r.state}" | District: "${r.district}" | Market: "${r.market}" | Commodity: "${r.commodity}" | Variety: "${r.variety}" | Modal: ₹${r.modal_price} | Date: ${r.arrival_date}`);
    });

  } catch (err) {
    console.error('API Error:', err.response?.data || err.message);
  }
};

testAgmarknetAPI();
