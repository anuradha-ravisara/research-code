const axios = require('axios');

const data = {
  bloodPressureSystolic: 133,
  bloodPressureDiastolic: 63,
  bmi: 16.9,
  bloodSugarLevel: 106
};

axios.post('http://localhost:5000/health_risk_model', data)
  .then(response => {
    console.log('Response:', response.data);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
