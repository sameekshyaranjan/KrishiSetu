const axios = require('axios');

const testHttp = async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'farmer1@krishisetu.com',
      password: 'password123'
    });
    console.log('HTTP 200 SUCCESS! User logged in:', res.data.user.name, 'Role:', res.data.user.district);
    console.log('AccessToken received:', !!res.data.accessToken);
    process.exit(0);
  } catch (err) {
    console.error('HTTP test failed:', err.response?.status, err.response?.data || err.message);
    process.exit(1);
  }
};

testHttp();
