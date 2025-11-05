const axios = require('axios');

const testCompanionSelection = async () => {
  try {
    // Test data for companion selection
    const testData = {
      user_id: "user123",
      companion_id: 1, // Assuming companion with ID 1 exists
      selection_reason: "Liked the personality and interests match"
    };

    console.log('Testing companion selection with data:', JSON.stringify(testData, null, 2));

    const response = await axios.post('http://localhost:5000/api/conversations/select-companion', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-jwt-token-here' // Replace with actual token
      }
    });

    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error testing companion selection:', error.response?.data || error.message);
  }
};

testCompanionSelection(); 